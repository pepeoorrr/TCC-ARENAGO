const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { createApp } = require('../../src/app');
const { createBilling } = require('../../src/services/billing');
const secret = 'integration-test-secret-length';
const url = new URL(process.env.TEST_DATABASE_URL || 'mysql://localhost/invalid');
assert.match(url.pathname, /^\/arenago_[a-f0-9]{32}_test$/);
assert.equal(process.env.DATABASE_URL, process.env.TEST_DATABASE_URL);
const db = require('../../src/lib/prisma');
const app = createApp({ db, secret, now: () => new Date('2029-01-01T12:00:00Z') });
const tokens = {};
const call = (user, method, endpoint, body) => {
  const req = request(app)[method](endpoint).set('Authorization', `Bearer ${tokens[user]}`);
  return body === undefined ? req : req.send(body);
};
let reservation, mainBill, participantBill, thirdBill;
before(async () => {
  const senha = await bcrypt.hash('testpass', 4);
  for (const [id, perfil] of [['admin', 'ADMIN'], ['owner1', 'PROPRIETARIO'], ['owner2', 'PROPRIETARIO'], ['client1', 'CLIENTE'], ['client2', 'CLIENTE'], ['client3', 'CLIENTE']]) {
    await db.usuario.create({ data: { id, nome: id, email: `${id}@example.test`, senha, perfil } });
    tokens[id] = jwt.sign({ id, perfil: 'ADMIN' }, secret);
  }
  for (const [id, proprietarioId] of [['local1', 'owner1'], ['local2', 'owner1'], ['local3', 'owner2']]) {
    await db.estabelecimento.create({ data: { id, nome: id, endereco: 'Rua Teste', contato: '123', proprietarioId } });
    await db.quadra.create({ data: { id: `q-${id}`, estabelecimentoId: id, nome: `Quadra ${id}`, tipo: 'FUTSAL', capacidade: 10, precoHora: '90.00', horarioInicio: '06:00', horarioFim: '23:00' } });
    await db.categoria.create({ data: { id: `cat-${id}`, estabelecimentoId: id, nome: 'Bebidas' } });
    await db.produto.create({ data: { id: `p-${id}`, estabelecimentoId: id, categoriaId: `cat-${id}`, nome: `Água ${id}`, preco: '4.10', estoqueAtual: 5 } });
  }
});
after(async () => db.$disconnect());
test('proprietários veem seus locais e não acessam recursos alheios por ID', async () => {
  const own = await call('owner1', 'get', '/estabelecimentos').expect(200);
  assert.equal(own.body.length, 2);
  const courts = await call('owner1', 'get', '/quadras?estabelecimentoId=local3').expect(200);
  assert.equal(courts.body.length, 0);
  await call('owner1', 'get', '/quadras/q-local3').expect(404);
  await call('owner1', 'put', '/produtos/p-local3', { nome: 'Ataque' }).expect(404);
  await call('owner1', 'get', '/usuarios').expect(403);
  await call('client1', 'post', '/quadras', {}).expect(403);
  await call('owner1', 'put', '/estabelecimentos/local1', { proprietarioId: 'owner2' }).expect(403);
});
test('cadastro e login não expõem senha; perfil público é sempre cliente', async () => {
  const response = await request(app).post('/auth/registro').send({ nome: 'Novo', email: 'novo@example.test', senha: 'testpass', confirmarSenha: 'testpass', perfil: 'ADMIN' }).expect(201);
  assert.equal(response.body.usuario.perfil, 'CLIENTE'); assert.equal(response.body.usuario.senha, undefined);
  const login = await request(app).post('/auth/login').send({ email: 'novo@example.test', senha: 'testpass' }).expect(200);
  assert.ok(login.body.token); assert.equal(login.body.usuario.senha, undefined);
});
test('admin cadastra proprietário e local; proprietário administra catálogo sem conceder acesso cruzado', async () => {
  const owner = (await call('admin', 'post', '/usuarios', { nome: 'Novo proprietário', email: 'owner-new@example.test', senha: 'testpass', perfil: 'PROPRIETARIO' }).expect(201)).body.usuario;
  assert.equal(owner.senha, undefined);
  tokens.newOwner = jwt.sign({ id: owner.id }, secret);
  const local = (await call('admin', 'post', '/estabelecimentos', { nome: 'Novo local', endereco: 'Rua 1', contato: '123', proprietarioId: owner.id }).expect(201)).body;
  const category = (await call('newOwner', 'post', '/categorias', { nome: 'Bebidas', estabelecimentoId: local.id }).expect(201)).body;
  const product = (await call('newOwner', 'post', '/produtos', { nome: 'Suco', categoriaId: category.id, estabelecimentoId: local.id, preco: '7.50', estoqueAtual: 10 }).expect(201)).body;
  const court = (await call('newOwner', 'post', '/quadras', { nome: 'Quadra nova', estabelecimentoId: local.id, tipo: 'FUTSAL', capacidade: 10, precoHora: 100 }).expect(201)).body;
  await call('newOwner', 'put', `/produtos/${product.id}`, { estoqueAtual: 20 }).expect(200);
  await call('newOwner', 'put', `/quadras/${court.id}`, { estabelecimentoId: 'local1' }).expect(400);
  await call('newOwner', 'post', '/produtos', { nome: 'Inválido', categoriaId: 'cat-local1', estabelecimentoId: local.id, preco: 5 }).expect(400);
  await call('owner1', 'get', `/usuarios/${owner.id}`).expect(403);
  await call('admin', 'get', `/usuarios/${owner.id}`).expect(200);
  await call('admin', 'put', `/usuarios/${owner.id}`, { perfil: 'CLIENTE' }).expect(400);
});
test('reserva cria comanda do responsável com aluguel proporcional e ignora usuarioId enviado pelo cliente', async () => {
  const response = await call('client1', 'post', '/reservas', { quadraId: 'q-local1', usuarioId: 'client2', data: '2030-01-01', horarioInicio: '18:00', duracao: 90 }).expect(201);
  reservation = response.body.reserva; mainBill = reservation.comandas[0];
  assert.equal(reservation.usuarioId, 'client1'); assert.equal(mainBill.valorAluguel, '135');
  assert.equal(reservation.usuario.senha, undefined);
  await call('owner2', 'get', `/reservas/${reservation.id}`).expect(404);
  await call('client2', 'get', `/reservas/${reservation.id}`).expect(404);
  await call('client2', 'post', '/reservas', { quadraId: 'q-local1', data: '2030-01-01', horarioInicio: '18:30', duracao: 60 }).expect(400);
});
test('participantes têm comandas próprias, aluguel zero e privacidade', async () => {
  participantBill = (await call('owner1', 'post', `/comandas/${reservation.id}`, { usuarioId: 'client2' }).expect(201)).body;
  thirdBill = (await call('admin', 'post', `/comandas/${reservation.id}`, { usuarioId: 'client3' }).expect(201)).body;
  assert.equal(participantBill.valorAluguel, '0');
  await call('owner1', 'post', `/comandas/${reservation.id}`, { usuarioId: 'client2' }).expect(409);
  await call('client1', 'get', `/comandas/${participantBill.id}`).expect(404);
  await call('owner2', 'get', `/comandas/${participantBill.id}`).expect(404);
  const own = await call('client2', 'get', '/comandas').expect(200); assert.equal(own.body.length, 1);
  const detail = await call('client1', 'get', `/reservas/${reservation.id}`).expect(200); assert.equal(detail.body.comandas.length, 1);
  await call('client2', 'post', `/comandas/${participantBill.id}/itens`, { produtoId: 'p-local1', quantidade: 1 }).expect(403);
  await call('owner1', 'post', `/comandas/${participantBill.id}/itens`, { produtoId: 'p-local2', quantidade: 1 }).expect(400);
});
test('consumo, remoção e cancelamento protegem estoque e valores', async () => {
  const response = await call('owner1', 'post', `/comandas/${participantBill.id}/itens`, { produtoId: 'p-local1', quantidade: 2 }).expect(201);
  assert.equal(response.body.total, '8.2');
  assert.equal((await db.produto.findUnique({ where: { id: 'p-local1' } })).estoqueAtual, 3);
  await call('owner1', 'delete', `/reservas/${reservation.id}`, {}).expect(400);
  await call('owner1', 'delete', `/comandas/${participantBill.id}/itens/${response.body.itens[0].id}`).expect(200);
  assert.equal((await db.produto.findUnique({ where: { id: 'p-local1' } })).estoqueAtual, 5);
});
test('falha de auditoria reverte item, total e estoque na transação', async () => {
  const failing = { $transaction: (action, options) => db.$transaction(tx => action(new Proxy(tx, { get: (target, key) => key === 'historico' ? { create: async () => { throw new Error('falha simulada'); } } : target[key] })), options) };
  await assert.rejects(createBilling(failing).add({ id: 'owner1', perfil: 'PROPRIETARIO' }, participantBill.id, { produtoId: 'p-local1', quantidade: 1 }), /falha simulada/);
  assert.equal(await db.itemComanda.count({ where: { comandaId: participantBill.id } }), 0);
  assert.equal((await db.produto.findUnique({ where: { id: 'p-local1' } })).estoqueAtual, 5);
});
test('lançamentos simultâneos não deixam estoque negativo nem total parcial', async () => {
  await db.produto.update({ where: { id: 'p-local1' }, data: { estoqueAtual: 1 } });
  const responses = await Promise.all([participantBill, thirdBill].map(c => call('owner1', 'post', `/comandas/${c.id}/itens`, { produtoId: 'p-local1', quantidade: 1 })));
  assert.deepEqual(responses.map(r => r.status).sort(), [201, 400]);
  assert.equal((await db.produto.findUnique({ where: { id: 'p-local1' } })).estoqueAtual, 0);
  assert.equal(await db.itemComanda.count({ where: { produtoId: 'p-local1' } }), 1);
});
test('admin opera comandas e apenas último pagamento finaliza a reserva', async () => {
  for (const [index, bill] of [mainBill, participantBill, thirdBill].entries()) {
    await call('admin', 'put', `/comandas/${bill.id}/fechar`).expect(200);
    await call('admin', 'post', `/comandas/${bill.id}/pagamento`, { formaPagamento: 'PIX' }).expect(200);
    assert.equal((await db.reserva.findUnique({ where: { id: reservation.id } })).status, index === 2 ? 'FINALIZADA' : 'CONFIRMADA');
  }
  await call('owner1', 'post', `/comandas/${reservation.id}`, { usuarioId: 'client1' }).expect(400);
  await call('owner1', 'post', `/comandas/${mainBill.id}/pagamento`, { formaPagamento: 'PIX' }).expect(400);
  await call('owner1', 'delete', `/reservas/${reservation.id}`, {}).expect(400);
});
test('dashboards isolam receita e dados por proprietário e estabelecimento', async () => {
  const a = (await call('owner1', 'get', '/dashboard').expect(200)).body;
  const b = (await call('owner2', 'get', '/dashboard').expect(200)).body;
  assert.equal(Number(a.receitaMes), 139.1); assert.equal(Number(b.receitaMes), 0);
  const local2 = (await call('owner1', 'get', '/dashboard?estabelecimentoId=local2').expect(200)).body;
  assert.equal(Number(local2.receitaMes), 0);
  await call('client1', 'get', '/dashboard').expect(403);
});
test('bloqueios impedem reserva; catálogo oculta local desativado', async () => {
  await call('owner1', 'post', '/bloqueios', { quadraId: 'q-local2', data: '2030-02-01', horarioInicio: '17:00', horarioFim: '20:00', motivo: 'MANUTENCAO' }).expect(201);
  await call('client1', 'post', '/reservas', { quadraId: 'q-local2', data: '2030-02-01', horarioInicio: '18:00', duracao: 60 }).expect(400);
  await call('admin', 'delete', '/estabelecimentos/local2').expect(200);
  await call('client1', 'get', '/quadras/q-local2').expect(404);
});
test('duas reservas simultâneas do mesmo horário não são confirmadas juntas', async () => {
  const body = { quadraId: 'q-local3', data: '2030-03-01', horarioInicio: '18:00', duracao: 60 };
  const results = await Promise.all([call('client1', 'post', '/reservas', body), call('client2', 'post', '/reservas', body)]);
  assert.deepEqual(results.map(r => r.status).sort(), [201, 400]);
});
test('sessões refletem alterações de perfil e desativação', async () => {
  await db.usuario.update({ where: { id: 'client3' }, data: { perfil: 'ADMIN' } });
  await call('client3', 'get', '/usuarios').expect(200);
  await db.usuario.update({ where: { id: 'client3' }, data: { ativo: false } });
  await call('client3', 'get', '/usuarios').expect(401);
});
