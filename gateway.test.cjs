'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { createServer, probeExisting } = require('./foxsocket-gateway.cjs');
const providerStore = require('./foxsocket-providers.cjs');
const agentFiles = require('./foxsocket-agent.cjs');
const realLlm = require('./foxsocket-llm.cjs');

function tempRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'foxsocket-gateway-'));
}

function fakeLlm(overrides = {}) {
  return {
    getProvider: (id) => (id === 'local' ? { defaultModel: 'test-model' } : null),
    listProviders: () => [{ id: 'local', label: 'Local', vendor: 'Foxsocket', models: [], defaultModel: 'test-model', keyHint: '', kind: 'ollama', needsKey: false }],
    maskKey: (k) => (k ? '••••' : ''),
    completeChat: overrides.completeChat || (async () => ({ content: 'ok', model: 'test-model', providerId: 'local' })),
    probeProvider: overrides.probeProvider || (async () => ({ ok: true })),
  };
}

async function withServer(opts, fn) {
  const root = tempRoot();
  const llm = opts.realLlm ? realLlm : fakeLlm(opts.llm);
  const { server, token } = createServer({ root, llm, providerStore, agentFiles });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;
  const auth = (extra = {}) => ({ authorization: `Bearer ${token}`, ...extra });
  try {
    await fn({ base, root, token, auth, port });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test('health reports ok, pid, and the configured provider even with no prior config, without needing a token', async () => {
  await withServer({}, async ({ base }) => {
    const res = await fetch(`${base}/health`);
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.provider, 'local');
    assert.equal(typeof body.pid, 'number');
  });
});

test('every other route rejects requests with no token or the wrong token', async () => {
  await withServer({}, async ({ base }) => {
    const noAuth = await fetch(`${base}/providers`);
    assert.equal(noAuth.status, 401);
    const wrongAuth = await fetch(`${base}/providers`, { headers: { authorization: 'Bearer not-the-token' } });
    assert.equal(wrongAuth.status, 401);
    const chatNoAuth = await fetch(`${base}/chat`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }) });
    assert.equal(chatNoAuth.status, 401);
  });
});

test('a generated token is written to disk and reused across restarts of the same data dir', async () => {
  const root = tempRoot();
  try {
    const first = createServer({ root, llm: fakeLlm(), providerStore, agentFiles });
    const second = createServer({ root, llm: fakeLlm(), providerStore, agentFiles });
    assert.equal(first.token, second.token);
    assert.equal(fs.readFileSync(path.join(root, 'gateway-token'), 'utf8').trim(), first.token);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('chat rejects empty message lists without touching the model', async () => {
  let called = false;
  await withServer({ llm: { completeChat: async () => { called = true; return { content: 'x' }; } } }, async ({ base, auth }) => {
    const res = await fetch(`${base}/chat`, { method: 'POST', headers: auth({ 'content-type': 'application/json' }), body: JSON.stringify({ messages: [] }) });
    assert.equal(res.status, 400);
    assert.equal(called, false);
  });
});

test('chat returns the model reply and persists a graph patch fence into GRAPH.json', async () => {
  const reply = 'Got it.\n:::foxsocket-graph\n{"facts":["test fact from gateway"]}\n:::';
  await withServer({ llm: { completeChat: async () => ({ content: reply, model: 'test-model', providerId: 'local' }) } }, async ({ base, root, auth }) => {
    const res = await fetch(`${base}/chat`, {
      method: 'POST',
      headers: auth({ 'content-type': 'application/json' }),
      body: JSON.stringify({ messages: [{ role: 'user', content: 'remember this' }] }),
    });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.content, 'Got it.');
    const graph = JSON.parse(fs.readFileSync(path.join(root, 'agent', 'GRAPH.json'), 'utf8'));
    assert.ok(graph.facts.includes('test fact from gateway'));
  });
});

test('a second chat request is rejected with 409 while one is in flight', async () => {
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  await withServer({ llm: { completeChat: async () => { await gate; return { content: 'done' }; } } }, async ({ base, auth }) => {
    const first = fetch(`${base}/chat`, { method: 'POST', headers: auth({ 'content-type': 'application/json' }), body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }) });
    await new Promise((resolve) => setTimeout(resolve, 20));
    const second = await fetch(`${base}/chat`, { method: 'POST', headers: auth({ 'content-type': 'application/json' }), body: JSON.stringify({ messages: [{ role: 'user', content: 'hi again' }] }) });
    assert.equal(second.status, 409);
    release();
    const firstBody = await (await first).json();
    assert.equal(firstBody.content, 'done');
  });
});

test('a failed completion is logged to gateway.log without leaking message content', async () => {
  await withServer({ llm: { completeChat: async () => { throw new Error('Add your Claude API key in Foxsocket settings.'); } } }, async ({ base, root, auth }) => {
    const res = await fetch(`${base}/chat`, {
      method: 'POST',
      headers: auth({ 'content-type': 'application/json' }),
      body: JSON.stringify({ messages: [{ role: 'user', content: 'a private household detail' }] }),
    });
    assert.equal(res.status, 502);
    const logText = fs.readFileSync(path.join(root, 'gateway.log'), 'utf8');
    assert.ok(logText.includes('502 /chat Add your Claude API key'));
    assert.equal(logText.includes('a private household detail'), false);
  });
});

test('providers save then get round-trips and masks the key', async () => {
  await withServer({ realLlm: true }, async ({ base, auth }) => {
    const save = await fetch(`${base}/providers`, {
      method: 'POST',
      headers: auth({ 'content-type': 'application/json' }),
      body: JSON.stringify({ active: 'anthropic', keys: { anthropic: 'sk-ant-1234567890' } }),
    });
    assert.equal(save.status, 200);
    const get = await (await fetch(`${base}/providers`, { headers: auth() })).json();
    assert.equal(get.active, 'anthropic');
    const anthropicEntry = get.catalog.find((item) => item.id === 'anthropic');
    assert.equal(anthropicEntry.hasKey, true);
    assert.equal(anthropicEntry.masked.includes('1234567890'), false);
  });
});

test('unknown routes return 404 (after auth)', async () => {
  await withServer({}, async ({ base, auth }) => {
    const res = await fetch(`${base}/nope`, { headers: auth() });
    assert.equal(res.status, 404);
  });
});

test('probeExisting detects a running gateway and reports false once it is closed', async () => {
  await withServer({}, async ({ port }) => {
    assert.equal(await probeExisting(port), true);
  });
  assert.equal(await probeExisting(59999), false);
});
