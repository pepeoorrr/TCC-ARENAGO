const { test } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const { createAccounts } = require('../../src/services/accounts');

const user = { id: 'user-1', ativo: true };

function fixture() {
  const saved = {};
  return {
    saved,
    service: createAccounts({
      usuario: {
        findUnique: async () => ({ ...user, senha: saved.senha || user.senha }),
        update: async ({ data }) => Object.assign(saved, data)
      }
    }, 'test-secret-with-more-than-16-chars')
  };
}

test('troca senha quando a senha atual confere e persiste somente o hash', async () => {
  user.senha = await bcrypt.hash('senha-antiga', 4);
  const { service, saved } = fixture();
  const result = await service.changePassword(user, {
    senhaAtual: 'senha-antiga', novaSenha: 'senha-nova', confirmarSenha: 'senha-nova'
  });
  assert.equal(result.mensagem, 'Senha alterada com sucesso');
  assert.notEqual(saved.senha, 'senha-nova');
  assert.equal(await bcrypt.compare('senha-nova', saved.senha), true);
});

test('rejeita senha atual incorreta, confirmação divergente e senha curta', async () => {
  user.senha = await bcrypt.hash('senha-antiga', 4);
  const { service } = fixture();
  await assert.rejects(service.changePassword(user, {
    senhaAtual: 'errada', novaSenha: 'senha-nova', confirmarSenha: 'senha-nova'
  }), /Senha atual incorreta/);
  await assert.rejects(service.changePassword(user, {
    senhaAtual: 'senha-antiga', novaSenha: 'senha-nova', confirmarSenha: 'outra-senha'
  }), /Confirmação da nova senha não confere/);
  await assert.rejects(service.changePassword(user, {
    senhaAtual: 'senha-antiga', novaSenha: '123', confirmarSenha: '123'
  }), /mínimo 6 caracteres/);
});
