const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createReservations } = require('../../src/services/reservations');
const { createBilling } = require('../../src/services/billing');
const user = { id: 'client', perfil: 'CLIENTE' };
const quadra = { id: 'q', estabelecimentoId: 'local', ativa: true, horarioInicio: '06:00', horarioFim: '22:00', precoHora: '80.00' };
test('reserva cria atomicamente comanda principal para usuário autenticado', async () => {
  let saved, audited = false;
  const tx = {
    quadra: { findFirst: async () => quadra }, estabelecimento: { findFirst: async () => ({ ativo: true }), findUnique: async () => ({ ativo: true }) },
    usuario: { findFirst: async () => user }, reserva: { findFirst: async () => null, create: async ({ data }) => { saved = data; return { id: 'r', ...data }; } },
    bloqueio: { findFirst: async () => null }, historico: { create: async () => { audited = true; } }
  };
  let transactions = 0;
  const db = { $transaction: async action => { transactions++; return action(tx); } };
  await createReservations(db, { now: () => new Date('2029-01-01'), identifier: () => 'fixed' }).create(user, { quadraId: 'q', usuarioId: 'other', data: '2030-01-01', horarioInicio: '18:00', duracao: 90 });
  assert.equal(saved.usuarioId, user.id); assert.equal(saved.comandas.create.usuarioId, user.id);
  assert.equal(saved.comandas.create.valorAluguel, '120.00'); assert.equal(transactions, 1); assert.equal(audited, true);
});
test('participante tem aluguel zero e reserva encerrada rejeita nova comanda', async () => {
  let status = 'CONFIRMADA', saved;
  const tx = { reserva: { findFirst: async () => ({ id: 'r', usuarioId: 'responsavel', valorAluguel: '80.00', status, quadra }) },
    estabelecimento: { findFirst: async () => ({ ativo: true }) }, usuario: { findFirst: async () => user },
    comanda: { create: async ({ data }) => { saved = data; return { ...data, id: 'c', reserva: { quadra } }; } }, historico: { create: async () => {} }
  };
  const service = createBilling({ $transaction: async action => action(tx) });
  const owner = { id: 'o', perfil: 'PROPRIETARIO' };
  await service.create(owner, 'r', user.id); assert.equal(saved.valorAluguel, '0.00');
  status = 'FINALIZADA'; await assert.rejects(service.create(owner, 'r', user.id), /encerrada/);
});
test('cancelamento do cliente respeita antecedência e identifica autor', async () => {
  let instant = new Date('2030-01-01T20:00:00Z'), saved;
  const record = { id: 'r', status: 'CONFIRMADA', dataReserva: new Date('2030-01-01T00:00:00Z'), horarioInicio: '18:00', quadra, comandas: [{ status: 'ABERTA', itens: [] }] };
  const tx = { reserva: { findFirst: async () => record, update: async ({ data }) => { saved = data; return data; } }, comanda: { updateMany: async () => {} }, historico: { create: async () => {} } };
  const service = createReservations({ $transaction: async action => action(tx) }, { now: () => instant });
  await assert.rejects(service.cancel(user, 'r'), /antecedência/);
  instant = new Date('2030-01-01T18:00:00Z'); await service.cancel(user, 'r');
  assert.equal(saved.canceladaPorId, user.id); assert.equal(saved.status, 'CANCELADA');
});
