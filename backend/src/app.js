const express = require('express');
const cors = require('cors');
const { createAccounts } = require('./services/accounts');
const { createCatalog, createEstablishments } = require('./services/catalog');
const { createReservations } = require('./services/reservations');
const { createBilling } = require('./services/billing');
const { createOperations } = require('./services/operations');
const { ensure } = require('./services/errors');

function createApp({ db, secret, now, identifier }) {
  ensure(secret && secret.length >= 16, 'JWT_SECRET deve conter pelo menos 16 caracteres', 500);
  const app = express();
  app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  const accounts = createAccounts(db, secret);
  const catalog = createCatalog(db), establishments = createEstablishments(db);
  const reservations = createReservations(db, { now, identifier }), billing = createBilling(db, { now, identifier });
  const operations = createOperations(db, { now });
  const handle = (action, status = 200) => async (req, res, next) => {
    try { res.status(status).json(await action(req)); } catch (error) { next(error); }
  };
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.post('/auth/registro', handle(req => accounts.register(req.body), 201));
  app.post('/auth/login', handle(req => accounts.login(req.body)));
  app.post(['/auth/recuperar-senha', '/auth/redefinir-senha'], (_req, res) => res.status(501).json({ erro: 'Recuperação por email ainda não disponível. Contate o administrador.' }));
  app.use(async (req, res, next) => {
    try {
      const match = /^Bearer (.+)$/.exec(req.headers.authorization || '');
      ensure(match, 'Token não fornecido', 401);
      req.usuario = await accounts.authenticate(match[1]); next();
    } catch (error) { next(error); }
  });
  app.get('/usuarios/perfil', handle(req => accounts.profile(req.usuario)));
  app.put('/usuarios/perfil', handle(async req => ({ usuario: await accounts.update(req.usuario, req.usuario.id, req.body, true), mensagem: 'Perfil atualizado' })));
  app.get('/usuarios/buscar-cliente', handle(req => accounts.findCustomer(req.usuario, req.query.email)));
  app.get('/usuarios', handle(req => accounts.list(req.usuario, req.query)));
  app.post('/usuarios', handle(async req => ({ usuario: await accounts.create(req.usuario, req.body) }), 201));
  app.get('/usuarios/:id', handle(req => accounts.get(req.usuario, req.params.id)));
  app.put('/usuarios/:id', handle(async req => ({ usuario: await accounts.update(req.usuario, req.params.id, req.body) })));
  app.delete('/usuarios/:id', handle(req => accounts.update(req.usuario, req.params.id, { ativo: false })));
  app.get('/estabelecimentos', handle(req => establishments.list(req.usuario)));
  app.post('/estabelecimentos', handle(req => establishments.save(req.usuario, null, req.body), 201));
  app.put('/estabelecimentos/:id', handle(req => establishments.save(req.usuario, req.params.id, req.body)));
  app.delete('/estabelecimentos/:id', handle(req => establishments.save(req.usuario, req.params.id, { ativo: false })));
  for (const [path, model] of [['quadras', 'quadra'], ['produtos', 'produto'], ['categorias', 'categoria']]) {
    app.get(`/${path}`, handle(req => catalog.list(req.usuario, model, req.query)));
    app.get(`/${path}/:id`, handle(req => catalog.get(req.usuario, model, req.params.id)));
    app.post(`/${path}`, handle(req => catalog.save(req.usuario, model, null, req.body), 201));
    app.put(`/${path}/:id`, handle(req => catalog.save(req.usuario, model, req.params.id, req.body)));
    app.delete(`/${path}/:id`, handle(req => catalog.deactivate(req.usuario, model, req.params.id)));
  }
  app.get('/reservas', handle(req => reservations.list(req.usuario, req.query)));
  app.get('/reservas/:id', handle(req => reservations.get(req.usuario, req.params.id)));
  app.post('/reservas', handle(async req => ({ reserva: await reservations.create(req.usuario, req.body), mensagem: 'Reserva criada' }), 201));
  app.put('/reservas/:id', handle(async req => ({ reserva: await reservations.update(req.usuario, req.params.id, req.body) })));
  app.delete('/reservas/:id', handle(req => reservations.cancel(req.usuario, req.params.id, req.body.motivo)));
  app.get('/comandas', handle(req => billing.list(req.usuario, req.query)));
  app.get('/comandas/:id', handle(req => billing.get(req.usuario, req.params.id)));
  app.post('/comandas/:reservaId', handle(req => billing.create(req.usuario, req.params.reservaId, req.body.usuarioId), 201));
  app.post('/comandas/:id/itens', handle(req => billing.add(req.usuario, req.params.id, req.body), 201));
  app.delete('/comandas/:id/itens/:itemId', handle(req => billing.remove(req.usuario, req.params.id, req.params.itemId)));
  app.put('/comandas/:id/fechar', handle(req => billing.close(req.usuario, req.params.id)));
  app.post('/comandas/:id/pagamento', handle(req => billing.pay(req.usuario, req.params.id, req.body)));
  app.delete('/comandas/:id', handle(req => billing.cancel(req.usuario, req.params.id)));
  app.get('/disponibilidade/quadras/:quadraId', handle(req => operations.availability(req.usuario, req.params.quadraId, req.query)));
  app.get('/bloqueios', handle(req => operations.blocks(req.usuario, req.query)));
  app.post('/bloqueios', handle(req => operations.block(req.usuario, req.body), 201));
  app.delete('/bloqueios/:id', handle(req => operations.unblock(req.usuario, req.params.id)));
  app.get('/dashboard', handle(req => operations.dashboard(req.usuario, req.query)));
  app.use((_req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));
  app.use((error, _req, res, _next) => {
    const status = error.status || ({ P2002: 409, P2025: 404, P2003: 400, P2034: 409 }[error.code]) || (error.name === 'PrismaClientValidationError' ? 400 : 500);
    if (status === 500) console.error(error);
    res.status(status).json({ erro: error.status ? error.message : ({ 409: 'Dados duplicados ou operação concorrente; atualize e tente novamente', 404: 'Registro não encontrado', 400: 'Dados inválidos' }[status] || 'Erro interno do servidor') });
  });
  return app;
}
module.exports = { createApp };
