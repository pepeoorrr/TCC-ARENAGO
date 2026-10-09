require('dotenv').config({ quiet: true });
const mariadb = require('mariadb');
const { randomUUID } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
async function main() {
  const source = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  if (!source) throw new Error('Configure TEST_DATABASE_URL ou DATABASE_URL para o servidor de testes.');
  const url = new URL(source);
  // Always create an isolated database, never reset the database provided in the URL.
  const name = `arenago_${randomUUID().replaceAll('-', '')}_test`;
  if (!/^arenago_[a-f0-9]{32}_test$/.test(name)) throw new Error('Nome de banco temporário inválido');
  const local = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
  if (local) url.searchParams.set('allowPublicKeyRetrieval', 'true');
  const connection = await mariadb.createConnection({ host: url.hostname, port: Number(url.port || 3306), user: decodeURIComponent(url.username), password: decodeURIComponent(url.password), allowPublicKeyRetrieval: local });
  let created = false;
  try {
    await connection.query(`CREATE DATABASE \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`); created = true;
    url.pathname = `/${name}`;
    const env = { ...process.env, DATABASE_URL: url.toString(), TEST_DATABASE_URL: url.toString(), NODE_ENV: 'test' };
    const cwd = path.resolve(__dirname, '..');
    const migration = spawnSync(process.execPath, [path.join(cwd, 'node_modules/prisma/build/index.js'), 'migrate', 'deploy'], { cwd, env, stdio: 'inherit' });
    if (migration.status !== 0) throw new Error('Migração da base temporária falhou');
    const run = spawnSync(process.execPath, ['--test', '--test-concurrency=1', 'tests/integration/api.test.js'], { cwd, env, stdio: 'inherit' });
    process.exitCode = run.status ?? 1;
  } finally {
    if (created) await connection.query(`DROP DATABASE \`${name}\``);
    await connection.end();
  }
}
main().catch(error => { console.error(error.code || error.message); process.exitCode = 1; });
