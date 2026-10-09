const { ensure } = require('./errors');
const PERFIS = ['ADMIN', 'PROPRIETARIO', 'CLIENTE'];
const safeUser = { id: true, nome: true, email: true, telefone: true, perfil: true, ativo: true };
const customer = { id: true, nome: true };

function roles(user, allowed) {
  ensure(user && PERFIS.includes(user.perfil) && user.ativo !== false, 'Não autorizado', 401);
  ensure(allowed.includes(user.perfil), 'Acesso negado', 403);
}
function localScope(user, id, catalog = false) {
  roles(user, PERFIS);
  const where = id ? { id } : {};
  if (user.perfil === 'PROPRIETARIO') where.proprietarioId = user.id;
  if (user.perfil === 'CLIENTE') {
    ensure(catalog, 'Acesso negado', 403);
    where.ativo = true;
  }
  return where;
}
function scope(user, model, estabelecimentoId) {
  roles(user, PERFIS);
  if (model === 'reserva') return user.perfil === 'CLIENTE'
    ? { usuarioId: user.id, ...(estabelecimentoId && { quadra: { estabelecimentoId } }) }
    : { quadra: { estabelecimento: localScope(user, estabelecimentoId) } };
  if (model === 'comanda') return user.perfil === 'CLIENTE'
    ? { usuarioId: user.id, ...(estabelecimentoId && { reserva: { quadra: { estabelecimentoId } } }) }
    : { reserva: { quadra: { estabelecimento: localScope(user, estabelecimentoId) } } };
  if (model === 'bloqueio') return { quadra: { estabelecimento: localScope(user, estabelecimentoId) } };
  const where = { estabelecimento: localScope(user, estabelecimentoId, true) };
  if (user.perfil === 'CLIENTE') where[model === 'produto' ? 'ativo' : 'ativa'] = true;
  return where;
}
async function local(db, user, id, write = false) {
  ensure(typeof id === 'string' && id.length > 0, 'Estabelecimento obrigatório');
  if (write) roles(user, ['ADMIN', 'PROPRIETARIO']);
  const record = await db.estabelecimento.findFirst({ where: localScope(user, id, !write) });
  ensure(record, 'Estabelecimento não encontrado', 404);
  if (write) ensure(record.ativo, 'Estabelecimento inativo');
  return record;
}
async function record(db, user, model, id, include) {
  ensure(typeof id === 'string' && id.length > 0, 'Identificador obrigatório');
  const value = await db[model].findFirst({ where: { AND: [{ id }, scope(user, model)] }, ...(include && { include }) });
  ensure(value, 'Registro não encontrado', 404);
  return value;
}
module.exports = { PERFIS, safeUser, customer, roles, localScope, scope, local, record };
