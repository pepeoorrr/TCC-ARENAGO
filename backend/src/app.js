const express = require('express');
const cors = require('cors');
const { createAccounts } = require('./services/accounts');
const { createCatalog, createEstablishments } = require('./services/catalog');
const { createReservations } = require('./services/reservations');
const { createBilling } = require('./services/billing');
const { createOperations } = require('./services/operations');
const { searchPublicCourts } = require('./services/publicCatalog');
const { ensure } = require('./services/errors');

function createApp({ db, secret, now, identifier }) {
  ensure(secret && secret.length >= 16, 'JWT_SECRET deve conter pelo menos 16 caracteres', 500);
  const app = express();
  let frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl && process.env.NODE_ENV === 'production') throw new Error('FRONTEND_URL é obrigatória em produção.');
  frontendUrl ||= 'http://localhost:5173';
  const frontend = new URL(frontendUrl);
  ensure(['http:', 'https:'].includes(frontend.protocol) && !frontend.username && !frontend.password && !frontend.search && !frontend.hash, 'FRONTEND_URL inválida', 500);
  ensure(process.env.NODE_ENV !== 'production' || frontend.protocol === 'https:', 'FRONTEND_URL deve usar HTTPS em produção', 500);
  // CORS compara origens (protocolo, domínio e porta), nunca subpastas.
  app.use(cors({ origin: frontend.origin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  const accounts = createAccounts(db, secret);
  const catalog = createCatalog(db), establishments = createEstablishments(db);
  const reservations = createReservations(db, { now, identifier }), billing = createBilling(db, { now, identifier });
  const operations = createOperations(db, { now });
  const handle = (action, status = 200) => async (req, res, next) => {
    try { res.status(status).json(await action(req)); } catch (error) { next(error); }
  };
  app.get('/', (_req, res) => res.json({ status: 'ok', mensagem: 'ArenaGo API' }));
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/public/quadras', handle(req => searchPublicCourts(db, req.query)));
  app.post('/auth/registro', handle(req => accounts.register(req.body), 201));
  app.post('/auth/login', handle(req => accounts.login(req.body)));
  app.post(['/auth/recuperar-senha', '/auth/redefinir-senha'], (_req, res) => res.status(501).json({ erro: 'Recuperação por email ainda não disponível. Contate o administrador.' }));
  const authenticate = async (req, res, next) => {
    try {
      const match = /^Bearer (.+)$/.exec(req.headers.authorization || '');
      ensure(match, 'Token não fornecido', 401);
      req.usuario = await accounts.authenticate(match[1]); next();
    } catch (error) { next(error); }
  };
  app.get('/usuarios/perfil', authenticate, handle(req => accounts.profile(req.usuario)));
  app.post('/usuarios/alterar-senha', authenticate, handle(req => accounts.changePassword(req.usuario, req.body)));
  app.put('/usuarios/perfil', authenticate, handle(async req => ({ usuario: await accounts.update(req.usuario, req.usuario.id, req.body, true), mensagem: 'Perfil atualizado' })));
  app.get('/usuarios/buscar-cliente', authenticate, handle(req => accounts.findCustomer(req.usuario, req.query.email)));
  app.get('/usuarios', authenticate, handle(req => accounts.list(req.usuario, req.query)));
  app.post('/usuarios', authenticate, handle(async req => ({ usuario: await accounts.create(req.usuario, req.body) }), 201));
  app.get('/usuarios/:id', authenticate, handle(req => accounts.get(req.usuario, req.params.id)));
  app.put('/usuarios/:id', authenticate, handle(async req => ({ usuario: await accounts.update(req.usuario, req.params.id, req.body) })));
  app.delete('/usuarios/:id', authenticate, handle(req => accounts.update(req.usuario, req.params.id, { ativo: false })));
  app.get('/estabelecimentos', authenticate, handle(req => establishments.list(req.usuario)));
  app.post('/estabelecimentos', authenticate, handle(req => establishments.save(req.usuario, null, req.body), 201));
  app.put('/estabelecimentos/:id', authenticate, handle(req => establishments.save(req.usuario, req.params.id, req.body)));
  app.delete('/estabelecimentos/:id', authenticate, handle(req => establishments.save(req.usuario, req.params.id, { ativo: false })));
  for (const [path, model] of [['quadras', 'quadra'], ['produtos', 'produto'], ['categorias', 'categoria']]) {
    app.get(`/${path}`, authenticate, handle(req => catalog.list(req.usuario, model, req.query)));
    app.get(`/${path}/:id`, authenticate, handle(req => catalog.get(req.usuario, model, req.params.id)));
    app.post(`/${path}`, authenticate, handle(req => catalog.save(req.usuario, model, null, req.body), 201));
    app.put(`/${path}/:id`, authenticate, handle(req => catalog.save(req.usuario, model, req.params.id, req.body)));
    app.delete(`/${path}/:id`, authenticate, handle(req => catalog.deactivate(req.usuario, model, req.params.id)));
  }
  app.get('/reservas', authenticate, handle(req => reservations.list(req.usuario, req.query)));
  app.get('/reservas/:id', authenticate, handle(req => reservations.get(req.usuario, req.params.id)));
  app.post('/reservas', authenticate, handle(async req => ({ reserva: await reservations.create(req.usuario, req.body), mensagem: 'Reserva criada' }), 201));
  app.put('/reservas/:id', authenticate, handle(async req => ({ reserva: await reservations.update(req.usuario, req.params.id, req.body) })));
  app.delete('/reservas/:id', authenticate, handle(req => reservations.cancel(req.usuario, req.params.id, req.body.motivo)));
  app.get('/comandas', authenticate, handle(req => billing.list(req.usuario, req.query)));
  app.get('/comandas/:id', authenticate, handle(req => billing.get(req.usuario, req.params.id)));
  app.post('/comandas/:reservaId', authenticate, handle(req => billing.create(req.usuario, req.params.reservaId, req.body.usuarioId), 201));
  app.post('/comandas/:id/itens', authenticate, handle(req => billing.add(req.usuario, req.params.id, req.body), 201));
  app.delete('/comandas/:id/itens/:itemId', authenticate, handle(req => billing.remove(req.usuario, req.params.id, req.params.itemId)));
  app.put('/comandas/:id/fechar', authenticate, handle(req => billing.close(req.usuario, req.params.id)));
  app.post('/comandas/:id/pagamento', authenticate, handle(req => billing.pay(req.usuario, req.params.id, req.body)));
  app.delete('/comandas/:id', authenticate, handle(req => billing.cancel(req.usuario, req.params.id)));
  app.get('/disponibilidade/quadras/:quadraId', authenticate, handle(req => operations.availability(req.usuario, req.params.quadraId, req.query)));
  app.get('/bloqueios', authenticate, handle(req => operations.blocks(req.usuario, req.query)));
  app.post('/bloqueios', authenticate, handle(req => operations.block(req.usuario, req.body), 201));
  app.delete('/bloqueios/:id', authenticate, handle(req => operations.unblock(req.usuario, req.params.id)));
  app.get('/dashboard', authenticate, handle(req => operations.dashboard(req.usuario, req.query)));
  app.use((_req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));
  app.use((error, _req, res, _next) => {
    const status = error.status || ({ P2002: 409, P2025: 404, P2003: 400, P2034: 409 }[error.code]) || (error.name === 'PrismaClientValidationError' ? 400 : 500);
    if (status === 500) console.error(error);
    res.status(status).json({ erro: error.status ? error.message : ({ 409: 'Dados duplicados ou operação concorrente; atualize e tente novamente', 404: 'Registro não encontrado', 400: 'Dados inválidos' }[status] || 'Erro interno do servidor') });
  });
  return app;
}
module.exports = { createApp };
