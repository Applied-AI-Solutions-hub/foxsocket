const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildReport, scrub, PRIVACY } = require('./diagnostics');

const GB = 1024 * 1024 * 1024;
const gamingMetrics = {
  cpuName: 'Test CPU', memoryTotal: 64 * GB,
  gpu: { name: 'NVIDIA GeForce RTX 4090', size: 24576 },
  disk: { free: 500 * GB },
};
const readyWindows = () => ({
  platform: 'win32', appVersion: '0.6.0', now: 0,
  inspect: { wsl: { status: 'available', distributions: [{ name: 'Ubuntu-24.04' }] } },
  host: { distro: 'Ubuntu-24.04', runtime: 'installed', version: '2026.9.3', gateway: 'reachable', inference: 'not-tested', ready: false },
  metrics: gamingMetrics,
  gateway: { ok: true },
  capability: require('./capability').assess(gamingMetrics),
});
const check = (report, id) => report.checks.find(c => c.id === id);

test('non-Windows platform reports unsupported and never claims a live agent', () => {
  const r = buildReport({ platform: 'linux', appVersion: '0.6.0', now: 0, metrics: null });
  assert.equal(r.overall, 'unsupported');
  assert.equal(check(r, 'platform').status, 'info');
  assert.match(r.summary, /Windows/);
});

test('fully prepared Windows host reaches checks-passed but still requires a real reply', () => {
  const r = buildReport(readyWindows());
  assert.equal(r.overall, 'checks-passed');
  assert.equal(check(r, 'wsl').status, 'pass');
  assert.equal(check(r, 'runtime').status, 'pass');
  assert.equal(check(r, 'gateway').status, 'pass');
  // Honest: a responding gateway is never treated as a confirmed reply.
  assert.equal(check(r, 'inference').status, 'warn');
  assert.match(r.summary, /real reply/i);
});

test('missing WSL or gateway keeps the report incomplete, never ready', () => {
  const base = readyWindows();
  base.host = { ...base.host, gateway: 'unavailable' };
  const r = buildReport(base);
  assert.equal(r.overall, 'incomplete');
  assert.equal(check(r, 'gateway').status, 'fail');
});

test('no selected environment skips runtime/gateway rather than failing', () => {
  const r = buildReport({ platform: 'win32', appVersion: '0.6.0', now: 0, inspect: { wsl: { status: 'available', distributions: [{ name: 'Ubuntu-24.04' }] } }, host: null, metrics: gamingMetrics, gateway: null, capability: require('./capability').assess(gamingMetrics) });
  assert.equal(check(r, 'runtime').status, 'skip');
  assert.equal(r.overall, 'incomplete');
});

test('local-model advice is surfaced from capability', () => {
  const r = buildReport(readyWindows());
  assert.equal(r.localModel.advice, 'local');
  assert.equal(r.localModel.recommended, 'large');
  assert.equal(r.hardware.gpu, 'NVIDIA GeForce RTX 4090');
  assert.equal(r.hardware.vramGB, 24);
});

test('report carries the privacy statement', () => {
  assert.equal(buildReport({ platform: 'linux', now: 0 }).privacy, PRIVACY);
});

// --- Redaction: the security guarantee ---
test('scrub removes API keys, tokens, paths, IPs, and emails', () => {
  const dirty = {
    a: 'key sk-ABCDEF0123456789 and pat github_pat_11ABCDEFGHIJ',
    b: 'C:\\Users\\alice\\secrets\\claw.json',
    c: 'server at 192.168.1.42 responded',
    d: 'contact alice@example.com',
    e: 'Authorization: Bearer abcDEF123456.token',
    f: 'hash 0123456789abcdef0123456789abcdef',
    nested: ['/home/alice/.config/openclaw', 'xoxb-9999-secrettoken'],
  };
  const clean = JSON.stringify(scrub(dirty));
  assert.ok(!clean.includes('sk-ABCDEF0123456789'), 'api key removed');
  assert.ok(!clean.includes('github_pat_11ABCDEFGHIJ'), 'pat removed');
  assert.ok(!clean.includes('C:\\Users\\alice'), 'windows path removed');
  assert.ok(!clean.includes('/home/alice'), 'unix home path removed');
  assert.ok(!clean.includes('192.168.1.42'), 'ip removed');
  assert.ok(!clean.includes('alice@example.com'), 'email removed');
  assert.ok(!clean.includes('abcDEF123456.token'), 'bearer token removed');
  assert.ok(!clean.includes('0123456789abcdef0123456789abcdef'), 'long hex removed');
  assert.ok(!clean.includes('xoxb-9999-secrettoken'), 'slack token removed');
});

test('buildReport output never contains a leaked path even if inputs do', () => {
  const r = buildReport({
    platform: 'win32', appVersion: '0.6.0', now: 0,
    inspect: { wsl: { status: 'available', distributions: [{ name: 'C:\\Users\\bob\\Ubuntu' }] } },
    host: { distro: 'Ubuntu at /home/bob/openclaw', runtime: 'unavailable' },
    metrics: gamingMetrics, gateway: null, capability: null,
  });
  const blob = JSON.stringify(r);
  assert.ok(!/C:\\Users\\bob/.test(blob), 'windows path scrubbed from report');
  assert.ok(!blob.includes('/home/bob'), 'unix path scrubbed from report');
});

test('safe values (versions, GPU names, distro names) survive scrubbing', () => {
  const r = buildReport(readyWindows());
  const blob = JSON.stringify(r);
  assert.ok(blob.includes('Ubuntu-24.04'), 'distro name preserved');
  assert.ok(blob.includes('2026.9.3'), 'version preserved');
  assert.ok(blob.includes('NVIDIA GeForce RTX 4090'), 'gpu name preserved');
});

test('buildReport does not mutate inputs', () => {
  const input = readyWindows();
  const copy = JSON.parse(JSON.stringify(input));
  buildReport(input);
  assert.deepEqual(input, copy);
});

test('report is deterministic for a fixed clock', () => {
  const a = buildReport(readyWindows());
  const b = buildReport(readyWindows());
  assert.deepEqual(a, b);
  assert.equal(a.generatedAt, new Date(0).toISOString());
});
