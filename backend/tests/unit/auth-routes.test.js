const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createApp } = require('../../src/app');

const secret = 'only-for-auth-route-unit-tests';

test('raiz e health são públicos, inclusive com token inválido', async () => {
  const app = createApp({ db: {}, secret });
  for (const path of ['/', '/health']) {
    const response = await request(app).get(path).set('Authorization', 'Bearer invalid');
    assert.equal(response.status, 200);
    assert.equal(response.body.status, 'ok');
  }
});

test('catálogo público lista quadras sem exigir autenticação', async () => {
  const db = { estabelecimento: { findMany: async () => [] } };
  const app = createApp({ db, secret });
  const response = await request(app).get('/public/quadras').expect(200);
  assert.deepEqual(response.body, []);
});

test('rotas inexistentes e métodos não registrados retornam 404 sem exigir token', async () => {
  const app = createApp({ db: {}, secret });
  for (const path of ['/inexistente', '/auth/inexistente', '/usuarios/u/inexistente', '/auth/login']) {
    assert.equal((await request(app).get(path)).status, 404);
  }
  assert.equal((await request(app).patch('/usuarios/u').send({})).status, 404);
});

test('login e cadastro chegam à validação de entrada sem token', async () => {
  const app = createApp({ db: {}, secret });
  for (const path of ['/auth/login', '/auth/registro']) {
    const response = await request(app).post(path).send({});
    assert.equal(response.status, 400);
    assert.doesNotMatch(response.body.erro, /Token/);
  }
});

test('recursos protegidos continuam exigindo autenticação', async () => {
  const app = createApp({ db: {}, secret });
  for (const path of ['/usuarios/perfil', '/usuarios', '/estabelecimentos', '/quadras',
    '/produtos', '/categorias', '/reservas', '/comandas', '/bloqueios', '/dashboard',
    '/disponibilidade/quadras/q']) {
    const response = await request(app).get(path);
    assert.equal(response.status, 401, path);
    assert.equal(response.body.erro, 'Token não fornecido');
  }
  for (const [method, path] of [['post', '/reservas'], ['post', '/usuarios/alterar-senha'], ['put', '/usuarios/u'], ['delete', '/comandas/c']]) {
    assert.equal((await request(app)[method](path).send({})).status, 401);
  }
  const invalid = await request(app).get('/usuarios/perfil').set('Authorization', 'Bearer invalid');
  assert.equal(invalid.status, 401);
});

test('token válido permite acessar perfil protegido', async () => {
  const user = { id: 'u', nome: 'Teste', perfil: 'CLIENTE', ativo: true };
  const db = { usuario: { findUnique: async () => user } };
  const app = createApp({ db, secret });
  const token = jwt.sign({ id: user.id }, secret);
  const response = await request(app).get('/usuarios/perfil').set('Authorization', `Bearer ${token}`);
  assert.equal(response.status, 200);
});
