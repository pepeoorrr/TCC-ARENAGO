const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../../src/app');

test('produção exige origem HTTPS e normaliza subpasta no CORS', async () => {
  const previous = { NODE_ENV: process.env.NODE_ENV, FRONTEND_URL: process.env.FRONTEND_URL };
  try {
    process.env.NODE_ENV = 'production';
    delete process.env.FRONTEND_URL;
    const options = { db: {}, secret: 'only-for-unit-tests-secret' };
    assert.throws(() => createApp(options), /FRONTEND_URL/);
    process.env.FRONTEND_URL = 'http://localhost:5173';
    assert.throws(() => createApp(options), /HTTPS/);
    process.env.FRONTEND_URL = 'https://frontend.invalid/test/subfolder/';
    const app = createApp(options);
    const health = await request(app).get('/health').set('Origin', 'https://frontend.invalid');
    assert.equal(health.status, 200);
    assert.deepEqual(health.body, { status: 'ok' });
    assert.equal(health.headers['access-control-allow-origin'], 'https://frontend.invalid');
    const preflight = await request(app).options('/auth/login')
      .set('Origin', 'https://frontend.invalid')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'authorization,content-type');
    assert.equal(preflight.status, 204);
    assert.match(preflight.headers['access-control-allow-headers'], /authorization/);
    const foreign = await request(app).get('/health').set('Origin', 'https://other.invalid');
    assert.notEqual(foreign.headers['access-control-allow-origin'], 'https://other.invalid');
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});
