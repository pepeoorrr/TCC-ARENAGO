const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const a = require('../../src/services/access');
const { createAccounts } = require('../../src/services/accounts');
const secret = 'unit-test-secret-with-enough-length';
const owner = { id: 'owner', perfil: 'PROPRIETARIO', ativo: true };
test('matriz de perfis e usuários inativos', () => {
  for (const perfil of a.PERFIS) a.roles({ perfil }, a.PERFIS);
  assert.throws(() => a.roles({ perfil: 'CLIENTE' }, ['ADMIN', 'PROPRIETARIO']), { status: 403 });
  assert.throws(() => a.roles({ perfil: 'ADMIN', ativo: false }, ['ADMIN']), { status: 401 });
  assert.throws(() => a.roles({ perfil: 'FUNCIONARIO' }, a.PERFIS), { status: 401 });
});
test('filtro de local nunca remove vínculo com proprietário', () => {
  assert.deepEqual(a.localScope(owner, 'foreign'), { id: 'foreign', proprietarioId: 'owner' });
  assert.deepEqual(a.scope(owner, 'comanda', 'foreign'), { reserva: { quadra: { estabelecimento: { id: 'foreign', proprietarioId: 'owner' } } } });
  assert.deepEqual(a.scope({ id: 'client', perfil: 'CLIENTE' }, 'comanda'), { usuarioId: 'client' });
  assert.deepEqual(a.localScope({ perfil: 'ADMIN' }), {});
});
test('catálogo de clientes exige registros e locais ativos', () => {
  assert.deepEqual(a.scope({ perfil: 'CLIENTE' }, 'quadra'), { estabelecimento: { ativo: true }, ativa: true });
  assert.throws(() => a.scope({ perfil: 'CLIENTE' }, 'bloqueio'), { status: 403 });
});
test('consulta por ID mantém escopo e nega registro ausente', async () => {
  let args;
  const db = { produto: { findFirst: async input => { args = input; return null; } } };
  await assert.rejects(a.record(db, owner, 'produto', 'foreign'), { status: 404 });
  assert.equal(args.where.AND[1].estabelecimento.proprietarioId, owner.id);
});
test('JWT antigo usa perfil atual no banco e rejeita conta desativada', async () => {
  const token = jwt.sign({ id: 'u', perfil: 'ADMIN' }, secret);
  let current = { id: 'u', perfil: 'CLIENTE', ativo: true };
  const accounts = createAccounts({ usuario: { findUnique: async () => current } }, secret);
  assert.equal((await accounts.authenticate(token)).perfil, 'CLIENTE');
  current = { ...current, ativo: false };
  await assert.rejects(accounts.authenticate(token), { status: 401 });
  await assert.rejects(accounts.authenticate('invalid'), { status: 401 });
});
test('proprietário não administra contas e cadastro público não aceita promoção', async () => {
  let saved;
  const accounts = createAccounts({ usuario: { create: async ({ data }) => { saved = data; return { id: 'u', perfil: data.perfil }; } } }, secret);
  await assert.rejects(accounts.create(owner, {}), { status: 403 });
  await accounts.register({ nome: 'Cliente', email: 'c@test.com', senha: 'teste123', confirmarSenha: 'teste123', perfil: 'ADMIN' });
  assert.equal(saved.perfil, 'CLIENTE'); assert.notEqual(saved.senha, 'teste123');
});
