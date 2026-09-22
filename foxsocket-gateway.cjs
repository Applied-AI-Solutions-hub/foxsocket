'use strict';

// Foxsocket Gateway — the standalone daemon. No Electron, no Next/web dependency.
// This is "the harness on the PC": one process, one data directory, one HTTP API.
// Electron's UI and any device (Kit, Nox, a phone app, whatever) are clients of
// this process, not separate copies of it.

const http = require('node:http');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const crypto = require('node:crypto');

const DEFAULT_PORT = Number(process.env.FOXSOCKET_GATEWAY_PORT) || 4707;

// Deliberately NOT Electron's app.getPath('userData') — this has to resolve the
// same way whether it's launched by Electron, a Scheduled Task, or by hand.
// On Windows this lands on %APPDATA%\Foxsocket, which is what Electron's
// userData already resolves to for this app (productName: "Foxsocket"), so an
// existing install's agent/graph and provider config are picked up as-is.
function dataDir() {
  if (process.env.FOXSOCKET_DATA_DIR) return process.env.FOXSOCKET_DATA_DIR;
  if (process.platform === 'win32' && process.env.APPDATA) return path.join(process.env.APPDATA, 'Foxsocket');
  return path.join(os.homedir(), '.foxsocket');
}

function providersFile(root) {
  return path.join(root, 'foxsocket-providers.json');
}

function tokenFile(root) {
  return path.join(root, 'gateway-token');
}

function logFile(root) {
  return path.join(root, 'gateway.log');
}

// Never log request/response bodies here — /providers carries raw API keys and
// /chat carries the household's actual conversation. Only status-line facts.
function log(root, line) {
  try {
    fs.mkdirSync(root, { recursive: true });
    fs.appendFileSync(logFile(root), `${new Date().toISOString()} ${line}\n`);
  } catch {
    /* logging is best-effort; never let it take the gateway down */
  }
}

// One random token per install, generated on first run and reused after. Any
// caller (Electron, web/, a future phone app) reads this same file locally to
// authenticate — nothing is hardcoded, nothing is sent anywhere at build time.
function ensureToken(root) {
  const file = tokenFile(root);
  try {
    const existing = fs.readFileSync(file, 'utf8').trim();
    if (existing) return existing;
  } catch {
    /* fall through to generate */
  }
  const token = crypto.randomBytes(24).toString('hex');
  fs.mkdirSync(root, { recursive: true });
  fs.writeFileSync(file, token, { mode: 0o600 });
  return token;
}

function checkAuth(req, token) {
  const header = req.headers.authorization || '';
  const provided = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const a = Buffer.from(provided);
  const b = Buffer.from(token);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function readJsonBody(req, limit = 1_000_000) {
  return new Promise((resolve, reject) => {
    let data = '';
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(Object.assign(new Error('Payload too large'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      data += chunk;
    });
    req.on('end', () => {
      if (!data.trim()) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(Object.assign(new Error('Invalid JSON'), { statusCode: 400 }));
      }
    });
    req.on('error', reject);
  });
}

function send(res, status, body) {
  const text = JSON.stringify(body);
  res.writeHead(status, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(text) });
  res.end(text);
}

function createServer({
  root = dataDir(),
  llm = require('./foxsocket-llm.cjs'),
  providerStore = require('./foxsocket-providers.cjs'),
  agentFiles = require('./foxsocket-agent.cjs'),
} = {}) {
  const file = providersFile(root);
  const token = ensureToken(root);
  let busy = false;

  async function handleChat(req, res) {
    if (busy) return send(res, 409, { error: 'Sparky is still responding to another request.' });
    let body;
    try {
      body = await readJsonBody(req);
    } catch (error) {
      return send(res, error.statusCode || 400, { error: error.message });
    }
    const messages = Array.isArray(body.messages)
      ? body.messages.filter((m) => m && typeof m.content === 'string' && m.content.trim())
      : [];
    if (!messages.length) {
      return send(res, 400, { error: 'Send at least one message with a non-empty "content".' });
    }
    busy = true;
    try {
      const cfg = providerStore.load(file);
      const packed = [
        { role: 'system', content: agentFiles.systemPrompt(root) },
        ...messages.map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
      ];
      const result = await llm.completeChat({
        providerId: cfg.active,
        model: cfg.models[cfg.active] || undefined,
        apiKey: cfg.keys[cfg.active],
        messages: packed,
        maxTokens: body.maxTokens || 2048,
      });
      const lastUser = [...messages].reverse().find((m) => m.role !== 'assistant')?.content || '';
      const absorbed = agentFiles.absorbReply(root, result.content, {
        summary: `${String(lastUser).slice(0, 120)} → ${String(result.content).slice(0, 200)}`,
      });
      return send(res, 200, { content: absorbed.visible, model: result.model, providerId: result.providerId });
    } catch (error) {
      log(root, `502 /chat ${error.message}`);
      return send(res, 502, { error: error.message });
    } finally {
      busy = false;
    }
  }

  function handleProvidersGet(req, res) {
    return send(res, 200, providerStore.snapshot(file, llm));
  }

  async function handleProvidersSave(req, res) {
    let body;
    try {
      body = await readJsonBody(req);
    } catch (error) {
      return send(res, error.statusCode || 400, { error: error.message });
    }
    providerStore.save(file, body || {});
    return send(res, 200, providerStore.snapshot(file, llm));
  }

  async function handleProvidersTest(req, res) {
    const cfg = providerStore.load(file);
    const result = await llm.probeProvider({ providerId: cfg.active, apiKey: cfg.keys[cfg.active], model: cfg.models[cfg.active] });
    return send(res, result.ok ? 200 : 502, result);
  }

  function handleHealth(req, res) {
    const cfg = providerStore.load(file);
    return send(res, 200, {
      ok: true,
      pid: process.pid,
      uptime: process.uptime(),
      root,
      provider: cfg.active,
      model: cfg.models[cfg.active] || llm.getProvider(cfg.active)?.defaultModel || null,
      busy,
    });
  }

  const wrap = (handler) => (req, res) =>
    Promise.resolve()
      .then(() => handler(req, res))
      .catch((error) => send(res, 500, { error: error.message }));

  const server = http.createServer((req, res) => {
    // /health stays open: a liveness ping shouldn't need the secret, and it
    // leaks nothing more sensitive than "a Foxsocket gateway is here."
    if (req.method === 'GET' && req.url === '/health') return handleHealth(req, res);

    if (!checkAuth(req, token)) {
      log(root, `401 ${req.method} ${req.url}`);
      return send(res, 401, { error: 'Missing or invalid gateway token. See gateway-token in the Foxsocket data directory.' });
    }

    if (req.method === 'POST' && req.url === '/chat') return void wrap(handleChat)(req, res);
    if (req.method === 'GET' && req.url === '/providers') return void wrap(handleProvidersGet)(req, res);
    if (req.method === 'POST' && req.url === '/providers') return void wrap(handleProvidersSave)(req, res);
    if (req.method === 'POST' && req.url === '/providers/test') return void wrap(handleProvidersTest)(req, res);
    return send(res, 404, { error: 'Not found' });
  });

  agentFiles.ensure(root);
  return { server, root, file, token };
}

// Is a Foxsocket gateway (ours or an earlier instance of it) already answering
// on this port? Mirrors OpenClaw's own rule of never stepping on an unidentified
// foreground gateway: if something responds and it isn't clearly a Foxsocket
// health payload, we still back off rather than guess.
function probeExisting(port, timeoutMs = 800) {
  return new Promise((resolve) => {
    const req = http.get({ host: '127.0.0.1', port, path: '/health', timeout: timeoutMs }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(Boolean(parsed && parsed.ok));
        } catch {
          resolve(true); // something answered on this port but wasn't parseable — treat as occupied
        }
      });
    });
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.on('error', () => resolve(false));
  });
}

async function main() {
  const root = dataDir();
  if (await probeExisting(DEFAULT_PORT)) {
    // Another instance (Electron-launched, Scheduled-Task-launched, or manual)
    // is already serving this port. Exit clean rather than crash-loop — the
    // same caution host-manager.js already applies to an unidentified OpenClaw
    // gateway: don't fight something that's already there.
    log(root, `startup: gateway already running on port ${DEFAULT_PORT}, exiting`);
    console.log(`A Foxsocket gateway is already running on port ${DEFAULT_PORT}. Not starting a second one.`);
    process.exit(0);
  }

  const { server } = createServer({ root });
  server.on('error', (error) => {
    log(root, `listen error: ${error.message}`);
    console.error(`Foxsocket gateway could not start: ${error.message}`);
    process.exit(1);
  });
  server.listen(DEFAULT_PORT, '127.0.0.1', () => {
    log(root, `startup: listening on 127.0.0.1:${DEFAULT_PORT}`);
    console.log(`Foxsocket gateway listening on http://127.0.0.1:${DEFAULT_PORT} (data: ${root})`);
  });
  const shutdown = () => {
    log(root, 'shutdown: signal received');
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Foxsocket gateway failed to start: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { createServer, dataDir, providersFile, tokenFile, logFile, ensureToken, probeExisting, DEFAULT_PORT };
