const { randomUUID } = require('node:crypto');
const { ensure } = require('./errors');
const access = require('./access');
const rules = require('./rules');
const { transaction, audit } = require('./transaction');
const include = { quadra: true, usuario: { select: access.customer } };

function createReservations(db, { now = () => new Date(), identifier = randomUUID } = {}) {
  const busy = async (tx, quadraId, values, except) => {
    const interval = { quadraId, horarioInicio: { lt: values.horarioFim }, horarioFim: { gt: values.horarioInicio } };
    ensure(!await tx.reserva.findFirst({ where: { ...interval, dataReserva: values.dataReserva,
      status: { in: ['CONFIRMADA', 'ATIVA'] }, ...(except && { id: { not: except } }) } }), 'Horário indisponível');
    ensure(!await tx.bloqueio.findFirst({ where: { ...interval, dataBloqueio: values.dataReserva } }), 'Quadra bloqueada');
  };
  return {
    async list(user, query = {}) {
      return db.reserva.findMany({ where: { AND: [access.scope(user, 'reserva', query.estabelecimentoId), {
        ...(query.status && { status: query.status }), ...(query.quadraId && { quadraId: query.quadraId }),
        ...(user.perfil !== 'CLIENTE' && query.usuarioId && { usuarioId: query.usuarioId }),
        ...((query.dataInicio || query.dataFim) && { dataReserva: { ...(query.dataInicio && { gte: rules.date(query.dataInicio) }), ...(query.dataFim && { lte: rules.date(query.dataFim) }) } })
      }] }, include, orderBy: [{ dataReserva: 'desc' }, { horarioInicio: 'asc' }] });
    },
    async get(user, id) {
      return access.record(db, user, 'reserva', id, { ...include, comandas: {
        ...(user.perfil === 'CLIENTE' && { where: { usuarioId: user.id } }),
        include: { usuario: { select: access.customer }, itens: true }
      } });
    },
    async create(user, input) {
      access.roles(user, access.PERFIS);
      return transaction(db, async tx => {
        const quadra = await access.record(tx, user, 'quadra', input.quadraId);
        await access.local(tx, user, quadra.estabelecimentoId);
        ensure(quadra.ativa && (await tx.estabelecimento.findUnique({ where: { id: quadra.estabelecimentoId } })).ativo, 'Local ou quadra inativo');
        const usuarioId = user.perfil === 'CLIENTE' ? user.id : input.usuarioId;
        const cliente = await tx.usuario.findFirst({ where: { id: usuarioId || '', perfil: 'CLIENTE', ativo: true } });
        ensure(cliente, 'Cliente cadastrado obrigatório');
        const values = rules.booking(quadra, input, now());
        await busy(tx, quadra.id, values);
        const reserva = await tx.reserva.create({ data: { ...values, quadraId: quadra.id, usuarioId,
          numeroReserva: `RES-${identifier()}`, comandas: { create: { numeroComanda: `CMD-${identifier()}`,
            usuarioId, valorAluguel: values.valorAluguel, total: values.valorAluguel } } }, include: { ...include, comandas: true } });
        await audit(tx, user, quadra.estabelecimentoId, 'Reserva', reserva.id, 'CRIACAO', 'Reserva e comanda do responsável criadas');
        return reserva;
      });
    },
    async update(user, id, input) {
      return transaction(db, async tx => {
        const reserva = await access.record(tx, user, 'reserva', id, { ...include, comandas: { include: { itens: true } } });
        await access.local(tx, user, reserva.quadra.estabelecimentoId);
        ensure(reserva.status === 'CONFIRMADA', 'Apenas reservas confirmadas podem ser alteradas');
        ensure(reserva.comandas.every(c => c.status === 'ABERTA'), 'Reserva com cobrança encerrada não pode ser alterada');
        const values = rules.booking(reserva.quadra, {
          data: input.data || reserva.dataReserva.toISOString().slice(0, 10),
          horarioInicio: input.horarioInicio || reserva.horarioInicio,
          duracao: input.duracao ?? rules.time(reserva.horarioFim) - rules.time(reserva.horarioInicio)
        }, now());
        await busy(tx, reserva.quadraId, values, id);
        const principal = reserva.comandas.find(c => c.usuarioId === reserva.usuarioId);
        ensure(principal, 'Comanda do responsável não encontrada');
        await tx.comanda.update({ where: { id: principal.id }, data: { valorAluguel: values.valorAluguel,
          total: rules.money(rules.cents(values.valorAluguel) + rules.cents(principal.subtotalConsumos)) } });
        const result = await tx.reserva.update({ where: { id }, data: values, include });
        await audit(tx, user, reserva.quadra.estabelecimentoId, 'Reserva', id, 'EDICAO', 'Reserva alterada');
        return result;
      });
    },
    async cancel(user, id, motivo) {
      return transaction(db, async tx => {
        const reserva = await access.record(tx, user, 'reserva', id, { ...include, comandas: { include: { itens: true } } });
        ensure(['CONFIRMADA', 'ATIVA'].includes(reserva.status), 'Reserva não pode ser cancelada');
        if (user.perfil === 'CLIENTE') {
          const start = new Date(`${reserva.dataReserva.toISOString().slice(0, 10)}T${reserva.horarioInicio}:00-03:00`);
          ensure(start - now() >= 2 * 3600000, 'Cancelamento requer mínimo 2 horas de antecedência');
        }
        rules.cancellable(reserva.comandas);
        await tx.comanda.updateMany({ where: { reservaId: id }, data: { status: 'CANCELADA' } });
        const result = await tx.reserva.update({ where: { id }, data: { status: 'CANCELADA', canceladaPorId: user.id,
          motivoCancelamento: motivo || 'Cancelamento solicitado' } });
        await audit(tx, user, reserva.quadra.estabelecimentoId, 'Reserva', id, 'CANCELAMENTO', 'Reserva cancelada');
        return result;
      });
    }
  };
}
module.exports = { createReservations };
