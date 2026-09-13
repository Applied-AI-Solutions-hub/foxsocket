// Builds a readiness self-test report from checks the app already runs, then
// scrubs it so it is safe to share. This is the evidence artifact for real
// hardware testing: it proves the stack is (or isn't) ready WITHOUT ever
// exposing credentials, file paths, or network addresses.
//
// Pure and deterministic: no I/O here. The caller gathers inputs (setup.inspect,
// setup.inspectWslHost, metrics, gateway, capability) and passes them in.
const capability = require('./capability');

const REPORT_VERSION = 1;
const PRIVACY =
  'This report was generated locally on your device. It contains no credentials, API keys, file paths, or network addresses, and nothing was uploaded.';

// Defense in depth: even though inputs are already structured (and setup.js keeps
// raw stderr out), scrub every emitted string so a stray secret can never leak.
const PATTERNS = [
  [/\b(?:sk|rk|pk|api)[-_][A-Za-z0-9]{8,}/gi, '[redacted-key]'],
  [/\b(?:ghp|gho|ghs|ghu|github_pat)_[A-Za-z0-9_]{8,}/g, '[redacted-token]'],
  [/xox[baprs]-[A-Za-z0-9-]{8,}/g, '[redacted-token]'],
  [/\bBearer\s+[A-Za-z0-9._\-]+/gi, 'Bearer [redacted]'],
  [/[A-Za-z]:\\[^\s"']+/g, '[path]'],
  [/\\\\[^\s"'\\][^\s"']*/g, '[path]'],
  [/\/(?:home|Users|root)\/[^\s"']*/g, '[path]'],
  [/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[ip]'],
  [/\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g, '[email]'],
  [/\b[A-Fa-f0-9]{32,}\b/g, '[redacted]'],
];

function scrubString(s) {
  let out = s;
  for (const [re, rep] of PATTERNS) out = out.replace(re, rep);
  return out;
}
function scrub(value) {
  if (typeof value === 'string') return scrubString(value);
  if (Array.isArray(value)) return value.map(scrub);
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value)) out[key] = scrub(value[key]);
    return out;
  }
  return value;
}

function hardwareSummary(metrics) {
  const hw = capability.readHardware(metrics);
  return {
    gpu: hw.gpuName,
    vramGB: hw.gpuName ? hw.vramGB : null,
    ramGB: hw.ramGB || null,
    freeDiskGB: hw.diskKnown ? hw.freeDiskGB : null,
  };
}

function buildReport(input) {
  const { platform, appVersion, now, inspect, host, metrics, gateway, capability: cap } =
    input || {};
  const isWindows = platform === 'win32';
  const checks = [];
  const add = (id, label, status, detail) => checks.push({ id, label, status, detail });
  const capText = cap ? cap.reason : 'Hardware has not been read yet.';

  add(
    'platform',
    'Operating system',
    isWindows ? 'pass' : 'info',
    isWindows
      ? 'Windows detected.'
      : `Full readiness runs on Windows with WSL. This machine reports "${platform || 'unknown'}", so only local app logic can be verified here — not a live agent reply.`
  );

  const finish = (overall, summary) =>
    scrub({
      reportVersion: REPORT_VERSION,
      generatedAt: new Date(Number.isFinite(now) ? now : Date.now()).toISOString(),
      appVersion: appVersion || 'unknown',
      platform: platform || 'unknown',
      overall,
      summary,
      checks,
      hardware: hardwareSummary(metrics),
      localModel: cap
        ? { advice: cap.advice, canRunLocally: cap.canRunLocally, recommended: cap.recommended }
        : null,
      privacy: PRIVACY,
    });

  if (!isWindows) {
    add('localModel', 'Local model option', 'info', capText);
    return finish(
      'unsupported',
      'A real agent needs a Windows PC with WSL and OpenClaw. On this system only local app logic can be checked, not a live reply.'
    );
  }

  const wsl = inspect && inspect.wsl;
  const distros = (wsl && wsl.distributions) || [];
  add(
    'wsl',
    'Linux environment (WSL)',
    wsl && wsl.status === 'available' && distros.length
      ? 'pass'
      : wsl && wsl.status === 'available'
      ? 'warn'
      : 'fail',
    wsl && wsl.status === 'available'
      ? distros.length
        ? `${distros.length} environment(s) available: ${distros.map(d => d.name).join(', ')}.`
        : 'WSL is available but no Linux environment is installed yet.'
      : 'WSL was not detected. Install it before continuing.'
  );

  if (host) {
    add(
      'runtime',
      'OpenClaw runtime',
      host.runtime === 'installed' ? 'pass' : 'fail',
      host.runtime === 'installed'
        ? `OpenClaw ${host.version || '(version unknown)'} detected in ${host.distro}.`
        : `OpenClaw was not found in ${host.distro}. Install it, then re-check.`
    );
    add(
      'gateway',
      'Background gateway',
      host.gateway === 'reachable' ? 'pass' : 'fail',
      host.gateway === 'reachable'
        ? 'The gateway responded.'
        : 'The gateway did not respond. Install or start it, then re-check.'
    );
  } else {
    add('runtime', 'OpenClaw runtime', 'skip', 'No Linux environment is selected yet. Choose one on the Host page, then re-run.');
    add(
      'gateway',
      'Background gateway',
      gateway && gateway.ok ? 'pass' : 'skip',
      gateway && gateway.ok ? 'A gateway responded.' : 'Not checked without a selected Linux environment.'
    );
  }

  add(
    'inference',
    'Real agent reply',
    'warn',
    'Not proven by diagnostics. A responding gateway is not the same as a working agent — confirm by sending a message and receiving a reply in a conversation.'
  );
  add('localModel', 'Local model option', 'info', capText);

  const byId = id => checks.find(c => c.id === id);
  const anyFail = checks.some(c => c.status === 'fail');
  const techPass = ['wsl', 'runtime', 'gateway'].every(id => byId(id) && byId(id).status === 'pass');
  const overall = !anyFail && techPass ? 'checks-passed' : 'incomplete';
  const summary =
    overall === 'checks-passed'
      ? 'Technical checks passed. Finish by confirming a real reply in a conversation — a responding gateway is not proof of a working agent.'
      : 'Some checks still need attention before this PC can host an agent. See the items marked fail or warn below.';
  return finish(overall, summary);
}

module.exports = { buildReport, scrub, REPORT_VERSION, PRIVACY };
