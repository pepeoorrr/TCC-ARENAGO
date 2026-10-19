require('dotenv').config();

const bcrypt = require('bcrypt');
const db = require('../src/lib/prisma');

async function main() {
  if (await db.usuario.count({ where: { perfil: 'ADMIN' } })) {
    console.log('Já existe administrador. Nenhum usuário foi alterado.');
    return;
  }

  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const senha = process.env.ADMIN_PASSWORD;
  const nome = (process.env.ADMIN_NAME || 'Administrador').trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Informe um ADMIN_EMAIL válido no .env.');
  }
  if (!senha || senha.length < 8) {
    throw new Error('Informe ADMIN_PASSWORD com no mínimo 8 caracteres no .env.');
  }
  if (!nome) throw new Error('ADMIN_NAME não pode estar vazio.');

  if (await db.usuario.findUnique({ where: { email } })) {
    throw new Error('ADMIN_EMAIL já pertence a outro usuário. Informe um email disponível.');
  }

  await db.usuario.create({
    data: {
      nome,
      email,
      senha: await bcrypt.hash(senha, 10),
      perfil: 'ADMIN',
      ativo: true
    }
  });
  console.log('Administrador inicial criado com sucesso.');
}

main()
  .catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
