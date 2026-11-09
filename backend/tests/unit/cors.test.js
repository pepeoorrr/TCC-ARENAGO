const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../../src/app');

const secret = 'cors-test-secret-with-enough-length';

function createAppWithEnv(overrides) {
  const previous = {
    FRONTEND_URL: process.env.FRONTEND_URL,
    NODE_ENV: process.env.NODE_ENV
  };
  Object.assign(process.env, overrides);
  try {
    return createApp({ db: {}, secret });
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

function preflight(app, origin) {
  return request(app)
    .options('/auth/registro')
    .set('Origin', origin)
    .set('Access-Control-Request-Method', 'POST')
    .set('Access-Control-Request-Headers', 'content-type');
}

test('desenvolvimento aceita localhost e 127.0.0.1, mas não outras origens', async () => {
  const app = createAppWithEnv({ FRONTEND_URL: 'http://localhost:5173', NODE_ENV: 'development' });

  for (const origin of ['http://localhost:5173', 'http://127.0.0.1:5173']) {
    const response = await preflight(app, origin).expect(204);
    assert.equal(response.headers['access-control-allow-origin'], origin);
  }

  const rejected = await preflight(app, 'http://example.test:5173').expect(401);
  assert.equal(rejected.headers['access-control-allow-origin'], undefined);
});

test('produção aceita somente a origem frontend configurada', async () => {
  const app = createAppWithEnv({ FRONTEND_URL: 'https://arenago.example', NODE_ENV: 'production' });

  const allowed = await preflight(app, 'https://arenago.example').expect(204);
  assert.equal(allowed.headers['access-control-allow-origin'], 'https://arenago.example');
  const rejected = await preflight(app, 'http://127.0.0.1:5173').expect(401);
  assert.equal(rejected.headers['access-control-allow-origin'], undefined);
});