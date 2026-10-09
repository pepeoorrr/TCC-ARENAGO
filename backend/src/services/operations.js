const access = require('./access');
const rules = require('./rules');
const { ensure } = require('./errors');
const { transaction, audit } = require('./transaction');
function createOperations(db, { now = () => new Date() } = {}) {
  return {
    async availability(user, quadraId, query) {
      const quadra = await access.record(db, user, 'quadra', quadraId);
      ensure(quadra.ativa, 'Quadra inativa');
      const start = rules.date(query.dataInicio), end = rules.date(query.dataFim);
      ensure(end >= start && end - start <= 31 * 86400000, 'Consulte um intervalo de até 31 dias');
      const [reservas, bloqueios] = await Promise.all([
        db.reserva.findMany({ where: { quadraId, dataReserva: { gte: start, lte: end }, status: { in: ['CONFIRMADA', 'ATIVA'] } }, select: { dataReserva: true, horarioInicio: true, horarioFim: true } }),
        db.bloqueio.findMany({ where: { quadraId, dataBloqueio: { gte: start, lte: end } }, select: { dataBloqueio: true, horarioInicio: true, horarioFim: true } })
      ]);
      const disponibilidade = [];
      const step = rules.integer(quadra.durationPadraoMinutos, 'Duração padrão');
      for (let day = start.getTime(); day <= end.getTime(); day += 86400000) {
        const horarios = [];
        for (let minute = rules.time(quadra.horarioInicio); minute + step <= rules.time(quadra.horarioFim); minute += step) {
          const conflict = (values, field) => values.some(v => v[field].getTime() === day && rules.time(v.horarioInicio) < minute + step && rules.time(v.horarioFim) > minute);
          horarios.push({ hora: `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`,
            duracao: step, disponivel: !conflict(reservas, 'dataReserva') && !conflict(bloqueios, 'dataBloqueio') });
        }
        disponibilidade.push({ data: new Date(day).toISOString().slice(0, 10), horarios });
      }
      return { quadraId, quadraNome: quadra.nome, disponibilidade };
    },
    async blocks(user, query) {
      access.roles(user, ['ADMIN', 'PROPRIETARIO']);
      return db.bloqueio.findMany({ where: { AND: [access.scope(user, 'bloqueio', query.estabelecimentoId), ...(query.quadraId ? [{ quadraId: query.quadraId }] : [])] }, include: { quadra: true }, orderBy: { dataBloqueio: 'asc' } });
    },
    async block(user, input) {
      access.roles(user, ['ADMIN', 'PROPRIETARIO']);
      return transaction(db, async tx => {
        const quadra = await access.record(tx, user, 'quadra', input.quadraId);
        await access.local(tx, user, quadra.estabelecimentoId, true);
        const dataBloqueio = rules.date(input.data);
        ensure(rules.time(input.horarioInicio) < rules.time(input.horarioFim), 'Intervalo inválido');
        ensure(['MANUTENCAO', 'LIMPEZA', 'EVENTO', 'OUTRO'].includes(input.motivo), 'Motivo inválido');
        const interval = { quadraId: quadra.id, horarioInicio: { lt: input.horarioFim }, horarioFim: { gt: input.horarioInicio } };
        ensure(!await tx.reserva.findFirst({ where: { ...interval, dataReserva: dataBloqueio, status: { in: ['CONFIRMADA', 'ATIVA'] } } }), 'Existe reserva neste intervalo');
        ensure(!await tx.bloqueio.findFirst({ where: { ...interval, dataBloqueio } }), 'Existe bloqueio neste intervalo');
        const result = await tx.bloqueio.create({ data: { quadraId: quadra.id, dataBloqueio, horarioInicio: input.horarioInicio, horarioFim: input.horarioFim, motivo: input.motivo, criadoPorId: user.id } });
        await audit(tx, user, quadra.estabelecimentoId, 'Bloqueio', result.id, 'CRIACAO', 'Horário bloqueado');
        return result;
      });
    },
    async unblock(user, id) {
      access.roles(user, ['ADMIN', 'PROPRIETARIO']);
      return transaction(db, async tx => {
        const record = await access.record(tx, user, 'bloqueio', id, { quadra: true });
        await tx.bloqueio.delete({ where: { id } });
        await audit(tx, user, record.quadra.estabelecimentoId, 'Bloqueio', id, 'DELECAO', 'Bloqueio removido');
        return { mensagem: 'Bloqueio removido' };
      });
    },
    async dashboard(user, query) {
      access.roles(user, ['ADMIN', 'PROPRIETARIO']);
      const [comandas, reservas, quadras, produtos] = await Promise.all([
        db.comanda.findMany({ where: access.scope(user, 'comanda', query.estabelecimentoId), include: { itens: { include: { produto: { select: { nome: true } } } } } }),
        db.reserva.findMany({ where: access.scope(user, 'reserva', query.estabelecimentoId), include: { quadra: true, usuario: { select: access.customer } } }),
        db.quadra.findMany({ where: access.scope(user, 'quadra', query.estabelecimentoId) }),
        db.produto.findMany({ where: access.scope(user, 'produto', query.estabelecimentoId) })
      ]);
      const dayOf = d => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(d);
      const today = dayOf(now()), month = today.slice(0, 7);
      const paid = comandas.filter(c => c.status === 'PAGA');
      const revenue = items => rules.money(items.reduce((sum, c) => sum + rules.cents(c.total), 0));
      const todays = reservas.filter(r => r.dataReserva.toISOString().slice(0, 10) === today && ['CONFIRMADA', 'ATIVA'].includes(r.status));
      const available = quadras.filter(q => q.ativa).reduce((sum, q) => sum + rules.time(q.horarioFim) - rules.time(q.horarioInicio), 0);
      const occupied = todays.filter(r => quadras.some(q => q.id === r.quadraId && q.ativa)).reduce((sum, r) => sum + rules.time(r.horarioFim) - rules.time(r.horarioInicio), 0);
      const sales = new Map();
      for (const c of paid.filter(c => dayOf(c.dataPagamento).startsWith(month))) for (const i of c.itens) {
        const entry = sales.get(i.produtoId) || { produtoId: i.produtoId, nome: i.produto.nome, quantidade: 0, cents: 0 };
        entry.quantidade += i.quantidade; entry.cents += rules.cents(i.subtotal); sales.set(i.produtoId, entry);
      }
      return { receitaDia: revenue(paid.filter(c => dayOf(c.dataPagamento) === today)), receitaMes: revenue(paid.filter(c => dayOf(c.dataPagamento).startsWith(month))),
        reservasHoje: todays.length, reservasConfirmadas: reservas.filter(r => r.status === 'CONFIRMADA' && r.dataReserva.toISOString().slice(0, 10) >= today).length,
        taxaOcupacao: available ? Math.round(occupied / available * 100) : 0,
        produtosBaixoEstoque: produtos.filter(p => p.ativo && p.estoqueAtual <= p.estoqueMinimo).length,
        comandasAguardando: comandas.filter(c => c.status === 'AGUARDANDO_PAGAMENTO').length,
        proximasReservas: reservas.filter(r => ['CONFIRMADA', 'ATIVA'].includes(r.status) && r.dataReserva.toISOString().slice(0, 10) >= today)
          .sort((a, b) => a.dataReserva - b.dataReserva || a.horarioInicio.localeCompare(b.horarioInicio)).slice(0, 10)
          .map(r => ({ id: r.id, numeroReserva: r.numeroReserva, cliente: r.usuario.nome, quadra: r.quadra.nome, dataReserva: r.dataReserva, horarioInicio: r.horarioInicio })),
        produtosMaisVendidos: [...sales.values()].sort((a, b) => b.quantidade - a.quantidade).slice(0, 5).map(({ cents, ...item }) => ({ ...item, receita: rules.money(cents) })) };
    }
  };
}
module.exports = { createOperations };
