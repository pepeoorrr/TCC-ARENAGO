require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../src/lib/prisma');
async function main() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = 'Administrador' } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) throw new Error('Informe ADMIN_EMAIL e ADMIN_PASSWORD (mínimo 8 caracteres).');
  if (await db.usuario.count({ where: { perfil: 'ADMIN' } })) throw new Error('Já existe administrador. Use a gestão de usuários.');
  await db.usuario.create({ data: { nome: ADMIN_NAME, email: ADMIN_EMAIL.toLowerCase(), senha: await bcrypt.hash(ADMIN_PASSWORD, 10), perfil: 'ADMIN' } });
  console.log('Administrador inicial criado.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => db.$disconnect());
