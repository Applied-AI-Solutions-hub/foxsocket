// Local, read-only hardware capability assessment for running a model on this PC.
//
// Security and privacy by design: every function here is pure. Nothing in this
// module reads files, opens a network connection, spawns a process, or sends
// data anywhere. Callers pass in a hardware snapshot that was already gathered
// locally (the `metrics` IPC result) plus a model catalog (data, not code), and
// get back an honest recommendation. The module never claims a capability it
// has not verified, and it never triggers a download or model start.
((root) => {
  const GB = 1024 * 1024 * 1024;

  // Default catalog is DATA you can tune, not hardcoded logic. Sizes are
  // conservative minimums for a comfortable local experience and can be
  // replaced by passing a different catalog to assess().
  const defaultCatalog = Object.freeze([
    Object.freeze({ id: 'compact',  label: 'Compact model (~7-8B)',  minVramGB: 8,  minRamGB: 16, diskGB: 8 }),
    Object.freeze({ id: 'balanced', label: 'Balanced model (~13-14B)', minVramGB: 12, minRamGB: 24, diskGB: 16 }),
    Object.freeze({ id: 'large',    label: 'Large model (~30B+)',    minVramGB: 24, minRamGB: 32, diskGB: 40 }),
  ]);

  const round1 = n => Math.round(n * 10) / 10;

  // Normalize a raw metrics snapshot into local-only capability facts.
  // nvidia-smi reports VRAM in MB; os/statfs report bytes.
  function readHardware(metrics) {
    const m = metrics || {};
    const vramGB = m.gpu && Number.isFinite(m.gpu.size) ? m.gpu.size / 1024 : 0;
    const ramGB = Number.isFinite(m.memoryTotal) ? m.memoryTotal / GB : 0;
    const freeDiskGB = m.disk && Number.isFinite(m.disk.free) ? m.disk.free / GB : null; // null = unknown, never guessed
    const gpuName = m.gpu && typeof m.gpu.name === 'string' && m.gpu.name.trim() ? m.gpu.name.trim() : null;
    return {
      gpuName,
      vramGB: round1(vramGB),
      ramGB: round1(ramGB),
      freeDiskGB: freeDiskGB === null ? null : round1(freeDiskGB),
      diskKnown: freeDiskGB !== null,
    };
  }

  function fits(model, hw) {
    if (hw.vramGB < model.minVramGB) return false;
    if (hw.ramGB < model.minRamGB) return false;
    // Only block on disk when we actually measured it; unknown disk is surfaced, not assumed.
    if (hw.diskKnown && hw.freeDiskGB < model.diskGB) return false;
    return true;
  }

  // Returns an honest, read-only recommendation. `advice` is 'local' or 'cloud'.
  function assess(metrics, catalog = defaultCatalog) {
    const list = Array.isArray(catalog) && catalog.length ? catalog : defaultCatalog;
    const hw = readHardware(metrics);
    const hasGpu = !!hw.gpuName && hw.vramGB > 0;
    const runnable = list.filter(model => fits(model, hw)).map(m => m.id);
    let recommended = null;
    if (hasGpu && runnable.length) {
      // Recommend the most capable model that fits (highest VRAM requirement).
      recommended = list
        .filter(m => runnable.includes(m.id))
        .reduce((best, m) => (m.minVramGB > best.minVramGB ? m : best)).id;
    }
    const canRunLocally = hasGpu && runnable.length > 0;
    let advice, reason;
    if (!hasGpu) {
      advice = 'cloud';
      reason = 'No compatible GPU was detected on this PC, so connecting a cloud model is recommended. Nothing is sent anywhere by this check.';
    } else if (!runnable.length) {
      advice = 'cloud';
      reason = `A GPU was detected (${hw.gpuName}, ${hw.vramGB} GB), but it is below the minimum for the local models listed here. A cloud model is recommended.`;
    } else {
      advice = 'local';
      const rec = list.find(m => m.id === recommended);
      reason = `This PC can run a model locally, so your conversations can stay on this device. Recommended: ${rec.label}.`;
    }
    return Object.freeze({
      hardware: hw,
      hasGpu,
      canRunLocally,
      runnable: Object.freeze(runnable),
      recommended,
      advice,
      reason,
      diskKnown: hw.diskKnown,
      catalog: list,
    });
  }

  const api = { assess, readHardware, defaultCatalog };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.capability = api;
})(typeof window !== 'undefined' ? window : globalThis);
