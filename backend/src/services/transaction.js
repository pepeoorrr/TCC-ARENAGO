// Serializable transactions retry deadlocks/write conflicts; callbacks must have no external side effects.
async function transaction(db, operation) {
  for (let attempt = 0; ; attempt++) {
    try { return await db.$transaction(operation, { isolationLevel: 'Serializable' }); }
    catch (error) {
      if (error.code !== 'P2034' || attempt >= 3) throw error;
    }
  }
}
async function audit(tx, user, estabelecimentoId, entidade, entidadeId, tipoAcao, descricao) {
  await tx.historico.create({ data: { usuarioId: user.id, estabelecimentoId, entidade, entidadeId, tipoAcao, descricao } });
}
module.exports = { transaction, audit };
