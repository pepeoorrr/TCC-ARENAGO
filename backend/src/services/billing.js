const { randomUUID } = require('node:crypto');
const { ensure } = require('./errors');
const access = require('./access');
const rules = require('./rules');
const { transaction, audit } = require('./transaction');
const include = { reserva: { include: { quadra: true } }, usuario: { select: access.customer }, itens: { include: { produto: { select: { id: true, nome: true } } } } };

function createBilling(db, { now = () => new Date(), identifier = randomUUID } = {}) {
  const managed = async (tx, user, id) => {
    access.roles(user, ['ADMIN', 'PROPRIETARIO']);
    return access.record(tx, user, 'comanda', id, include);
  };
  const total = async (tx, id, aluguel) => {
    const itens = await tx.itemComanda.findMany({ where: { comandaId: id } });
    const subtotal = itens.reduce((sum, item) => sum + rules.cents(item.subtotal), 0);
    return tx.comanda.update({ where: { id }, data: { subtotalConsumos: rules.money(subtotal), total: rules.money(rules.cents(aluguel) + subtotal) }, include });
  };
  const log = (tx, user, c, action, description) => audit(tx, user, c.reserva.quadra.estabelecimentoId, 'Comanda', c.id, action, description);
  return {
    list: (user, query = {}) => db.comanda.findMany({ where: { AND: [access.scope(user, 'comanda', query.estabelecimentoId), {
      ...(query.reservaId && { reservaId: query.reservaId }), ...(query.status && { status: query.status })
    }] }, include, orderBy: { dataCriacao: 'desc' } }),
    get: (user, id) => access.record(db, user, 'comanda', id, include),
    async create(user, reservaId, usuarioId) {
      access.roles(user, ['ADMIN', 'PROPRIETARIO']);
      return transaction(db, async tx => {
        const reserva = await access.record(tx, user, 'reserva', reservaId, { quadra: true });
        await access.local(tx, user, reserva.quadra.estabelecimentoId, true);
        ensure(['CONFIRMADA', 'ATIVA'].includes(reserva.status), 'Reserva encerrada');
        ensure(typeof usuarioId === 'string', 'Cliente obrigatório');
        ensure(await tx.usuario.findFirst({ where: { id: usuarioId, perfil: 'CLIENTE', ativo: true } }), 'Cliente não encontrado');
        const comanda = await tx.comanda.create({ data: { reservaId, usuarioId,
          numeroComanda: `CMD-${identifier()}`, valorAluguel: usuarioId === reserva.usuarioId ? reserva.valorAluguel : '0.00',
          total: usuarioId === reserva.usuarioId ? reserva.valorAluguel : '0.00' }, include });
        await log(tx, user, comanda, 'CRIACAO', 'Comanda do participante criada');
        return comanda;
      });
    },
    async add(user, id, body) {
      return transaction(db, async tx => {
        const comanda = await managed(tx, user, id);
        await access.local(tx, user, comanda.reserva.quadra.estabelecimentoId, true);
        ensure(typeof body.produtoId === 'string', 'Produto obrigatório');
        const produto = await tx.produto.findUnique({ where: { id: body.produtoId } });
        const values = rules.itemRules(comanda, produto, body.quantidade);
        const updated = await tx.produto.updateMany({ where: { id: produto.id, estoqueAtual: { gte: values.quantidade } }, data: { estoqueAtual: { decrement: values.quantidade } } });
        ensure(updated.count === 1, 'Estoque insuficiente');
        await tx.itemComanda.create({ data: { comandaId: id, produtoId: produto.id, ...values } });
        const result = await total(tx, id, comanda.valorAluguel);
        await log(tx, user, comanda, 'EDICAO', 'Consumo adicionado');
        return result;
      });
    },
    async remove(user, id, itemId) {
      return transaction(db, async tx => {
        const comanda = await managed(tx, user, id);
        ensure(comanda.status === 'ABERTA', 'Comanda não está aberta');
        const item = comanda.itens.find(i => i.id === itemId);
        ensure(item, 'Item não encontrado', 404);
        await tx.itemComanda.delete({ where: { id: itemId } });
        await tx.produto.update({ where: { id: item.produtoId }, data: { estoqueAtual: { increment: item.quantidade } } });
        const result = await total(tx, id, comanda.valorAluguel);
        await log(tx, user, comanda, 'EDICAO', 'Consumo removido e estoque devolvido');
        return result;
      });
    },
    async close(user, id) {
      return transaction(db, async tx => {
        const comanda = await managed(tx, user, id);
        ensure(comanda.status === 'ABERTA', 'Comanda não está aberta');
        const result = await tx.comanda.update({ where: { id }, data: { status: 'AGUARDANDO_PAGAMENTO', dataFechamento: now() } });
        await log(tx, user, comanda, 'EDICAO', 'Comanda fechada');
        return result;
      });
    },
    async pay(user, id, body) {
      return transaction(db, async tx => {
        const comanda = await managed(tx, user, id);
        const values = rules.payment(comanda, body);
        const result = await tx.comanda.update({ where: { id }, data: { ...values, status: 'PAGA', dataPagamento: now(), observacoes: body.observacoes || null } });
        const comandas = await tx.comanda.findMany({ where: { reservaId: comanda.reservaId } });
        if (rules.settled(comandas)) await tx.reserva.update({ where: { id: comanda.reservaId }, data: { status: 'FINALIZADA' } });
        await log(tx, user, comanda, 'PAGAMENTO', 'Pagamento registrado');
        return result;
      });
    },
    async cancel(user, id) {
      return transaction(db, async tx => {
        const comanda = await managed(tx, user, id);
        ensure(comanda.status !== 'CANCELADA', 'Comanda já cancelada');
        ensure(comanda.usuarioId !== comanda.reserva.usuarioId, 'Cancele a reserva para cancelar a comanda do responsável');
        rules.cancellable([comanda]);
        const result = await tx.comanda.update({ where: { id }, data: { status: 'CANCELADA' } });
        if (rules.settled(await tx.comanda.findMany({ where: { reservaId: comanda.reservaId } }))) {
          await tx.reserva.update({ where: { id: comanda.reservaId }, data: { status: 'FINALIZADA' } });
        }
        await log(tx, user, comanda, 'CANCELAMENTO', 'Comanda do participante cancelada');
        return result;
      });
    }
  };
}
module.exports = { createBilling };
