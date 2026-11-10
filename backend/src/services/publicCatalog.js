const { ensure } = require('./errors');
const rules = require('./rules');

const TYPES = ['BEACH_TENNIS', 'FUTEVOLEI', 'FUTSAL', 'VOLEI', 'BASQUETE', 'TENIS', 'OUTRO'];
const clock = value => {
  const minute = rules.time(value);
  ensure(minute >= 0 && minute < 1440, 'Horário inválido');
  return minute;
};

async function searchPublicCourts(db, query = {}) {
  const term = typeof query.q === 'string' ? query.q.trim().slice(0, 100) : '';
  const city = typeof query.cidade === 'string' ? query.cidade.trim().slice(0, 100) : '';
  const tipo = query.tipo || '';
  ensure(!tipo || TYPES.includes(tipo), 'Modalidade inválida');
  const maxPrice = query.precoMax === undefined || query.precoMax === '' ? undefined : rules.cents(query.precoMax);
  const data = query.data ? rules.date(query.data) : null;
  const hora = query.hora ? clock(query.hora) : null;
  ensure(!hora || data, 'Informe uma data para filtrar por horário');

  const courtWhere = {
    ativa: true,
    ...(tipo && { tipo }),
    ...(maxPrice !== undefined && { precoHora: { lte: rules.money(maxPrice) } })
  };
  const establishments = await db.estabelecimento.findMany({
    where: {
      ativo: true,
      ...(city && { endereco: { contains: city } }),
      ...(term && { OR: [{ nome: { contains: term } }, { endereco: { contains: term } }, { quadras: { some: { ...courtWhere, nome: { contains: term } } } }] }),
      quadras: { some: courtWhere }
    },
    select: {
      id: true,
      nome: true,
      endereco: true,
      quadras: { where: courtWhere, select: { id: true, nome: true, tipo: true, descricao: true, precoHora: true, horarioInicio: true, horarioFim: true, durationPadraoMinutos: true }, orderBy: { nome: 'asc' } }
    },
    orderBy: { nome: 'asc' },
    take: 100
  });

  if (!data || hora === null) return establishments;
  const courts = establishments.flatMap(item => item.quadras);
  const ids = courts.map(item => item.id);
  if (!ids.length) return [];
  const [reservations, blocks] = await Promise.all([
    db.reserva.findMany({ where: { quadraId: { in: ids }, dataReserva: data, status: { in: ['CONFIRMADA', 'ATIVA'] } }, select: { quadraId: true, horarioInicio: true, horarioFim: true } }),
    db.bloqueio.findMany({ where: { quadraId: { in: ids }, dataBloqueio: data }, select: { quadraId: true, horarioInicio: true, horarioFim: true } })
  ]);
  const filtered = establishments.map(item => ({
    ...item,
    quadras: item.quadras.filter(court => {
      const start = rules.time(court.horarioInicio), finish = rules.time(court.horarioFim);
      const end = hora + court.durationPadraoMinutos;
      if (hora < start || end > finish) return false;
      return ![...reservations, ...blocks].some(event => event.quadraId === court.id && rules.time(event.horarioInicio) < end && rules.time(event.horarioFim) > hora);
    })
  })).filter(item => item.quadras.length);
  return filtered;
}

module.exports = { searchPublicCourts };
