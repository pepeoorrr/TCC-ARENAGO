const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createBilling } = require('../../src/services/billing');
const { transaction } = require('../../src/services/transaction');
const owner = { id: 'o', perfil: 'PROPRIETARIO' };
function fixture() {
  const c = { id: 'c', status: 'ABERTA', usuarioId: 'p', reservaId: 'r', valorAluguel: '0.00', total: '0.00', itens: [], reserva: { usuarioId: 'responsavel', quadra: { estabelecimentoId: 'local' } } };
  const effects = { stock: 5, audits: [], finalized: false };
  const tx = {
    estabelecimento: { findFirst: async () => ({ ativo: true }) },
    comanda: { findFirst: async () => c, findMany: async () => effects.bills || [c], update: async ({ data }) => Object.assign(c, data) },
    produto: { findUnique: async () => ({ id: 'p', ativo: true, estabelecimentoId: 'local', estoqueAtual: effects.stock, preco: '4.10' }), updateMany: async ({ data }) => { effects.stock -= data.estoqueAtual.decrement; return { count: 1 }; }, update: async ({ data }) => { effects.stock += data.estoqueAtual.increment; } },
    itemComanda: { create: async ({ data }) => { c.itens.push({ ...data, id: 'i' }); }, findMany: async () => c.itens, delete: async () => { c.itens = []; } },
    reserva: { update: async () => { effects.finalized = true; } },
    historico: { create: async value => effects.audits.push(value) }
  };
  return { c, effects, service: createBilling({ $transaction: async action => action(tx) }, { now: () => new Date('2030-01-01') }) };
}
test('adicionar/remover item atualiza totais, estoque e histórico', async () => {
  const { c, effects, service } = fixture();
  await service.add(owner, c.id, { produtoId: 'p', quantidade: 2 });
  assert.equal(c.total, '8.20'); assert.equal(effects.stock, 3);
  await service.remove(owner, c.id, 'i');
  assert.equal(c.total, '0.00'); assert.equal(effects.stock, 5); assert.equal(effects.audits.length, 2);
});
test('cliente não lança itens e item alheio não pode ser removido', async () => {
  const { service } = fixture();
  await assert.rejects(service.add({ perfil: 'CLIENTE' }, 'c', {}), { status: 403 });
  await assert.rejects(service.remove(owner, 'c', 'other'), { status: 404 });
});
test('pagamento de participante não finaliza enquanto outra comanda estiver aberta', async () => {
  const { c, effects, service } = fixture(); c.status = 'AGUARDANDO_PAGAMENTO';
  effects.bills = [c, { status: 'ABERTA' }];
  await service.pay(owner, 'c', { formaPagamento: 'PIX' });
  assert.equal(c.status, 'PAGA'); assert.equal(effects.finalized, false);
});
test('último pagamento finaliza a reserva', async () => {
  const { c, effects, service } = fixture(); c.status = 'AGUARDANDO_PAGAMENTO';
  effects.bills = [c, { status: 'PAGA' }];
  await service.pay(owner, 'c', { formaPagamento: 'PIX' });
  assert.equal(effects.finalized, true);
});
test('fechamento bloqueia lançamentos e cancelamento protege responsável', async () => {
  const { c, service } = fixture();
  await service.close(owner, 'c');
  assert.equal(c.status, 'AGUARDANDO_PAGAMENTO');
  await assert.rejects(service.add(owner, 'c', { produtoId: 'p', quantidade: 1 }));
  c.usuarioId = 'responsavel';
  await assert.rejects(service.cancel(owner, 'c'), /reserva/);
});
test('transação repete somente conflitos de escrita e propaga outros erros', async () => {
  let calls = 0;
  const db = { $transaction: async action => { if (++calls < 3) throw Object.assign(new Error(), { code: 'P2034' }); return action({}); } };
  assert.equal(await transaction(db, async () => 42), 42); assert.equal(calls, 3);
  await assert.rejects(transaction({ $transaction: async () => { throw new Error('falha'); } }, () => {}), /falha/);
});
