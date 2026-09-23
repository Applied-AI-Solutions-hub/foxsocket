// Sparky Reflex client for Node / Electron main processes. No dependencies (Node 18+ fetch).
// Every call resolves to null/{ok:false} instead of throwing, so apps can fall back to their LLM.

function createReflex({ url = 'http://127.0.0.1:18791', routes, instructions, minConfidence = 0.55, timeoutMs = 2500 } = {}) {
  if (!routes || Object.keys(routes).length < 2) throw Error('Sparky Reflex needs at least two routes.');

  async function route(text) {
    try {
      const res = await fetch(url + '/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: String(text).slice(0, 4000), routes, instructions }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) return null;
      const r = await res.json();
      if (!r.route || !(r.route in routes)) return null;
      return { route: r.route, confidence: r.confidence, confident: r.confidence >= minConfidence, probabilities: r.probabilities, ms: r.elapsed_ms };
    } catch {
      return null;
    }
  }

  async function status() {
    try {
      const res = await fetch(url + '/health', { signal: AbortSignal.timeout(1500) });
      const h = await res.json();
      return { ok: h.ok === true, device: h.device, model: h.model, loaded: h.loaded === true };
    } catch {
      return { ok: false };
    }
  }

  return { route, status };
}

module.exports = { createReflex };
