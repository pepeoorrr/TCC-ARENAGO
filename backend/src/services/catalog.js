const access = require('./access');
const { ensure } = require('./errors');
const rules = require('./rules');
const { transaction, audit } = require('./transaction');
const text = (value, name) => { ensure(typeof value === 'string' && value.trim(), `${name} obrigatório`); return value.trim(); };
const selectCatalog = {
  quadra: { id: true, nome: true, tipo: true, descricao: true, capacidade: true, precoHora: true, horarioInicio: true, horarioFim: true, durationPadraoMinutos: true, ativa: true, estabelecimentoId: true },
  produto: { id: true, nome: true, descricao: true, preco: true, categoriaId: true, estabelecimentoId: true, ativo: true },
  categoria: { id: true, nome: true, descricao: true, estabelecimentoId: true, ativa: true }
};
function createCatalog(db) {
  async function validate(tx, model, body, previous = {}) {
    const input = { ...previous, ...body };
    const data = { nome: text(input.nome, 'Nome'), descricao: input.descricao || null };
    const activeKey = model === 'produto' ? 'ativo' : 'ativa';
    if (body[activeKey] !== undefined) { ensure(typeof body[activeKey] === 'boolean', 'Situação inválida'); data[activeKey] = body[activeKey]; }
    if (model === 'quadra') {
      ensure(['FUTSAL', 'VOLEI', 'BASQUETE', 'TENIS', 'OUTRO'].includes(input.tipo), 'Modalidade inválida');
      Object.assign(data, { tipo: input.tipo, capacidade: rules.integer(input.capacidade, 'Capacidade'),
        precoHora: rules.money(rules.cents(input.precoHora)), horarioInicio: input.horarioInicio || '06:00',
        horarioFim: input.horarioFim || '22:00', durationPadraoMinutos: rules.integer(input.durationPadraoMinutos ?? 60, 'Duração padrão') });
      ensure(rules.time(data.horarioInicio) < rules.time(data.horarioFim), 'Intervalo de funcionamento inválido');
    }
    if (model === 'produto') {
      const categoria = await tx.categoria.findFirst({ where: { id: input.categoriaId || '', estabelecimentoId: input.estabelecimentoId, ativa: true } });
      ensure(categoria, 'Categoria ativa do mesmo estabelecimento obrigatória');
      Object.assign(data, { categoriaId: categoria.id, preco: rules.money(rules.cents(input.preco)),
        estoqueAtual: rules.integer(input.estoqueAtual ?? input.estoqueInicial ?? 0, 'Estoque', 0),
        estoqueMinimo: rules.integer(input.estoqueMinimo ?? 5, 'Estoque mínimo', 0) });
    }
    return data;
  }
  return {
    async list(user, model, query = {}) {
      const where = { AND: [access.scope(user, model, query.estabelecimentoId), {
        ...(query.busca && { nome: { contains: query.busca } }),
        ...(model === 'produto' && query.categoriaId && { categoriaId: query.categoriaId })
      }] };
      return db[model].findMany({ where, orderBy: { nome: 'asc' }, ...(user.perfil === 'CLIENTE' && { select: selectCatalog[model] }) });
    },
    async get(user, model, id) {
      if (user.perfil === 'CLIENTE') {
        const result = await db[model].findFirst({ where: { AND: [{ id }, access.scope(user, model)] }, select: selectCatalog[model] });
        ensure(result, 'Registro não encontrado', 404); return result;
      }
      return access.record(db, user, model, id);
    },
    async save(user, model, id, body) {
      access.roles(user, ['ADMIN', 'PROPRIETARIO']);
      return transaction(db, async tx => {
        const previous = id ? await access.record(tx, user, model, id) : {};
        const estabelecimentoId = previous.estabelecimentoId || body.estabelecimentoId;
        ensure(!id || !body.estabelecimentoId || body.estabelecimentoId === estabelecimentoId, 'Não é permitido transferir este registro de local');
        await access.local(tx, user, estabelecimentoId, true);
        const data = await validate(tx, model, { ...body, estabelecimentoId }, previous);
        const result = id ? await tx[model].update({ where: { id }, data }) : await tx[model].create({ data: { ...data, estabelecimentoId } });
        await audit(tx, user, estabelecimentoId, model, result.id, id ? 'EDICAO' : 'CRIACAO', `${model} salvo`);
        return result;
      });
    },
    async deactivate(user, model, id) {
      access.roles(user, ['ADMIN', 'PROPRIETARIO']);
      return transaction(db, async tx => {
        const value = await access.record(tx, user, model, id);
        const result = await tx[model].update({ where: { id }, data: { [model === 'produto' ? 'ativo' : 'ativa']: false } });
        await audit(tx, user, value.estabelecimentoId, model, id, 'EDICAO', `${model} desativado`);
        return result;
      });
    }
  };
}

function createEstablishments(db) {
  return {
    list: user => db.estabelecimento.findMany({ where: access.localScope(user, undefined, true), orderBy: { nome: 'asc' },
      ...(user.perfil === 'CLIENTE' && { select: { id: true, nome: true, endereco: true, contato: true, ativo: true } }) }),
    async save(user, id, input) {
      access.roles(user, id ? ['ADMIN', 'PROPRIETARIO'] : ['ADMIN']);
      return transaction(db, async tx => {
        const previous = id ? await access.local(tx, user, id) : null;
        if (user.perfil !== 'ADMIN') ensure(input.proprietarioId === undefined && input.ativo === undefined, 'Somente admin altera responsável e situação', 403);
        const data = { nome: text(input.nome ?? previous?.nome, 'Nome'), endereco: text(input.endereco ?? previous?.endereco, 'Endereço'), contato: text(input.contato ?? previous?.contato, 'Contato') };
        if (user.perfil === 'ADMIN') {
          const proprietarioId = input.proprietarioId ?? previous?.proprietarioId;
          ensure(await tx.usuario.findFirst({ where: { id: proprietarioId || '', perfil: 'PROPRIETARIO', ativo: true } }), 'Proprietário ativo obrigatório');
          data.proprietarioId = proprietarioId;
          if (input.ativo !== undefined) { ensure(typeof input.ativo === 'boolean', 'Situação inválida'); data.ativo = input.ativo; }
        }
        const result = id ? await tx.estabelecimento.update({ where: { id }, data }) : await tx.estabelecimento.create({ data });
        await audit(tx, user, result.id, 'Estabelecimento', result.id, id ? 'EDICAO' : 'CRIACAO', 'Estabelecimento salvo');
        return result;
      });
    }
  };
}
module.exports = { createCatalog, createEstablishments };
