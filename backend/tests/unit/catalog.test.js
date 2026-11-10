const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createCatalog } = require('../../src/services/catalog');

test('proprietário cadastra quadra de Beach Tennis com valores validados', async () => {
  let saved;
  const tx = {
    estabelecimento: { findFirst: async () => ({ id: 'local-1', ativo: true }) },
    quadra: { create: async ({ data }) => { saved = data; return { id: 'court-1', ...data }; } },
    historico: { create: async () => ({}) }
  };
  const db = { $transaction: async operation => operation(tx) };
  const owner = { id: 'owner-1', perfil: 'PROPRIETARIO', ativo: true };
  await createCatalog(db).save(owner, 'quadra', null, {
    nome: 'Quadra Praia', tipo: 'BEACH_TENNIS', capacidade: 4, precoHora: '80',
    horarioInicio: '06:00', horarioFim: '22:00', durationPadraoMinutos: 60,
    estabelecimentoId: 'local-1'
  });
  assert.equal(saved.tipo, 'BEACH_TENNIS');
  assert.equal(saved.precoHora, '80.00');
  assert.equal(saved.estabelecimentoId, 'local-1');
});

test('proprietário cadastra quadra de Futevôlei como modalidade própria', async () => {
  let saved;
  const tx = {
    estabelecimento: { findFirst: async () => ({ id: 'local-1', ativo: true }) },
    quadra: { create: async ({ data }) => { saved = data; return { id: 'court-2', ...data }; } },
    historico: { create: async () => ({}) }
  };
  const db = { $transaction: async operation => operation(tx) };
  await createCatalog(db).save({ id: 'owner-1', perfil: 'PROPRIETARIO', ativo: true }, 'quadra', null, {
    nome: 'Quadra Futevôlei', tipo: 'FUTEVOLEI', capacidade: 4, precoHora: '75',
    horarioInicio: '06:00', horarioFim: '22:00', estabelecimentoId: 'local-1'
  });
  assert.equal(saved.tipo, 'FUTEVOLEI');
});
