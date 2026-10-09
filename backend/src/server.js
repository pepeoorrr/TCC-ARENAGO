require('dotenv').config();
const db = require('./lib/prisma');
const { createApp } = require('./app');
const app = createApp({ db, secret: process.env.JWT_SECRET });
const server = app.listen(process.env.PORT || 3000, () => console.log(`ArenaGo API: porta ${process.env.PORT || 3000}`));
async function shutdown() { server.close(); await db.$disconnect(); }
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
