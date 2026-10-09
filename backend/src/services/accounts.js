const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const access = require('./access');
const { ensure } = require('./errors');
const { transaction, audit } = require('./transaction');
function createAccounts(db, secret) {
  const sign = usuario => ({ usuario, token: jwt.sign({ id: usuario.id }, secret, { expiresIn: '7d' }) });
  const emailValue = email => {
    ensure(typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'Email inválido');
    return email.trim().toLowerCase();
  };
  const password = senha => ensure(typeof senha === 'string' && senha.length >= 6, 'Senha deve ter no mínimo 6 caracteres');
  async function create(input, perfil, client = db) {
    ensure(typeof input.nome === 'string' && input.nome.trim(), 'Nome obrigatório');
    password(input.senha);
    return client.usuario.create({ data: { nome: input.nome.trim(), email: emailValue(input.email), senha: await bcrypt.hash(input.senha, 10),
      telefone: input.telefone || null, cpf: input.cpf || null, perfil }, select: access.safeUser });
  }
  return {
    async register(input) {
      ensure(input.senha === input.confirmarSenha, 'Senhas não conferem');
      return sign(await create(input, 'CLIENTE'));
    },
    async login(input) {
      const email = emailValue(input.email);
      ensure(typeof input.senha === 'string', 'Senha obrigatória');
      const user = await db.usuario.findUnique({ where: { email } });
      ensure(user?.ativo && await bcrypt.compare(input.senha, user.senha), 'Email ou senha incorretos', 401);
      const safe = Object.fromEntries(Object.keys(access.safeUser).map(key => [key, user[key]]));
      return sign(safe);
    },
    async authenticate(token) {
      let decoded;
      try { decoded = jwt.verify(token, secret); } catch { ensure(false, 'Token inválido ou expirado', 401); }
      ensure(typeof decoded.id === 'string', 'Token inválido', 401);
      const user = await db.usuario.findUnique({ where: { id: decoded.id }, select: access.safeUser });
      access.roles(user, access.PERFIS);
      return user;
    },
    async create(user, input) {
      access.roles(user, ['ADMIN']);
      const perfil = input.perfil || 'CLIENTE';
      ensure(access.PERFIS.includes(perfil), 'Perfil inválido');
      return transaction(db, async tx => {
        const result = await create(input, perfil, tx);
        await audit(tx, user, null, 'Usuario', result.id, 'CRIACAO', 'Usuário cadastrado pelo administrador');
        return result;
      });
    },
    async list(user, query = {}) {
      access.roles(user, ['ADMIN']);
      return db.usuario.findMany({ where: { ...(query.perfil && { perfil: query.perfil }) }, select: access.safeUser, orderBy: { nome: 'asc' } });
    },
    async findCustomer(user, email) {
      access.roles(user, ['ADMIN', 'PROPRIETARIO']);
      const result = await db.usuario.findFirst({ where: { email: emailValue(email), perfil: 'CLIENTE', ativo: true }, select: { ...access.customer, email: true } });
      ensure(result, 'Cliente não encontrado', 404); return result;
    },
    async profile(user) {
      return db.usuario.findUnique({ where: { id: user.id }, select: { ...access.safeUser, endereco: true, cpf: true } });
    },
    async get(user, id) {
      access.roles(user, ['ADMIN']);
      const result = await db.usuario.findUnique({ where: { id }, select: access.safeUser });
      ensure(result, 'Usuário não encontrado', 404);
      return result;
    },
    async update(user, id, input, own = false) {
      if (!own) access.roles(user, ['ADMIN']);
      return transaction(db, async tx => {
        const previous = await tx.usuario.findUnique({ where: { id } });
        ensure(previous, 'Usuário não encontrado', 404);
        const data = {};
        for (const key of ['nome', 'telefone', 'endereco']) if (input[key] !== undefined) {
          ensure(typeof input[key] === 'string' && (key !== 'nome' || input[key].trim()), `Campo ${key} inválido`);
          data[key] = input[key];
        }
        if (!own) {
          if (input.perfil !== undefined) { ensure(access.PERFIS.includes(input.perfil), 'Perfil inválido'); data.perfil = input.perfil; }
          if (input.ativo !== undefined) { ensure(typeof input.ativo === 'boolean', 'Situação inválida'); data.ativo = input.ativo; }
          ensure(!(id === user.id && (data.ativo === false || (data.perfil && data.perfil !== 'ADMIN'))), 'Não é permitido retirar seu próprio acesso administrativo');
          if (data.perfil && data.perfil !== previous.perfil) {
            ensure(!await tx.estabelecimento.count({ where: { proprietarioId: id } }), 'Transfira os estabelecimentos antes de alterar o perfil');
          }
        }
        const result = await tx.usuario.update({ where: { id }, data, select: access.safeUser });
        await audit(tx, user, null, 'Usuario', id, 'EDICAO', 'Cadastro atualizado');
        return result;
      });
    }
  };
}
module.exports = { createAccounts };
