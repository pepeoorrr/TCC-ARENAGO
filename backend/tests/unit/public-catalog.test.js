const { test } = require('node:test');
const assert = require('node:assert/strict');
const { searchPublicCourts } = require('../../src/services/publicCatalog');

const court = (id, price = '80.00') => ({ id, nome: 'Quadra de Beach Tennis', tipo: 'BEACH_TENNIS', descricao: null, precoHora: price, horarioInicio: '06:00', horarioFim: '22:00', durationPadraoMinutos: 60 });
function fixture({ reservations = [], blocks = [] } = {}) {
  const calls = {};
  return {
    calls,
    db: {
      estabelecimento: { findMany: async args => { calls.search = args; return [{ id: 'arena-1', nome: 'Arena Areia', endereco: 'Santos, SP', quadras: [court('court-1')] }]; } },
      reserva: { findMany: async args => { calls.reservations = args; return reservations; } },
      bloqueio: { findMany: async args => { calls.blocks = args; return blocks; } }
    }
  };
}

test('busca pública retorna somente campos selecionados de locais e quadras ativos', async () => {
  const { db, calls } = fixture();
  const result = await searchPublicCourts(db, { cidade: 'Santos', tipo: 'BEACH_TENNIS', precoMax: '100.00' });
  assert.equal(result[0].quadras[0].nome, 'Quadra de Beach Tennis');
  assert.equal(calls.search.where.ativo, true);
  assert.equal(calls.search.select.quadras.where.ativa, true);
  assert.equal(calls.search.select.proprietarioId, undefined);
});

test('filtro de data e hora remove horários conflitantes com reserva ou bloqueio', async () => {
  const { db } = fixture({ reservations: [{ quadraId: 'court-1', horarioInicio: '17:30', horarioFim: '18:30' }] });
  const result = await searchPublicCourts(db, { data: '2030-01-02', hora: '18:00' });
  assert.deepEqual(result, []);
});

test('filtro de horário também respeita bloqueios e faixa de funcionamento', async () => {
  const blocked = fixture({ blocks: [{ quadraId: 'court-1', horarioInicio: '19:00', horarioFim: '20:00' }] });
  assert.deepEqual(await searchPublicCourts(blocked.db, { data: '2030-01-02', hora: '19:00' }), []);
  const outside = fixture();
  assert.deepEqual(await searchPublicCourts(outside.db, { data: '2030-01-02', hora: '22:00' }), []);
});

test('rejeita modalidade inválida e horário sem data', async () => {
  const { db } = fixture();
  await assert.rejects(searchPublicCourts(db, { tipo: 'INVALIDA' }), /Modalidade inválida/);
  await assert.rejects(searchPublicCourts(db, { hora: '18:00' }), /Informe uma data/);
});
