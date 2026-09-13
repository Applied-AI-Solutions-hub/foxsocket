const { test } = require('node:test');
const assert = require('node:assert/strict');
const { assess, readHardware, defaultCatalog } = require('./capability');

const GB = 1024 * 1024 * 1024;
// Build a metrics-shaped snapshot (nvidia-smi reports VRAM in MB; RAM/disk in bytes).
const snap = ({ gpu, vramMB, ramGB, freeDiskGB }) => ({
  gpu: gpu ? { name: gpu, size: vramMB } : null,
  memoryTotal: ramGB * GB,
  disk: freeDiskGB === undefined ? null : { free: freeDiskGB * GB },
});

test('high-end gaming GPU can run every tier and is advised to run locally', () => {
  const a = assess(snap({ gpu: 'NVIDIA GeForce RTX 4090', vramMB: 24576, ramGB: 64, freeDiskGB: 500 }));
  assert.equal(a.advice, 'local');
  assert.equal(a.canRunLocally, true);
  assert.deepEqual(a.runnable, ['compact', 'balanced', 'large']);
  assert.equal(a.recommended, 'large');
  assert.equal(a.hardware.vramGB, 24); // 24576 MB -> 24 GB
});

test('mid-range GPU fits smaller tiers and recommends the largest that fits', () => {
  const a = assess(snap({ gpu: 'NVIDIA GeForce RTX 4070', vramMB: 12288, ramGB: 32, freeDiskGB: 100 }));
  assert.equal(a.advice, 'local');
  assert.deepEqual(a.runnable, ['compact', 'balanced']);
  assert.equal(a.recommended, 'balanced');
});

test('entry GPU only fits the compact tier', () => {
  const a = assess(snap({ gpu: 'NVIDIA GeForce RTX 3060', vramMB: 8192, ramGB: 16, freeDiskGB: 50 }));
  assert.deepEqual(a.runnable, ['compact']);
  assert.equal(a.recommended, 'compact');
});

test('no GPU recommends cloud and never claims local capability', () => {
  const a = assess(snap({ gpu: null, ramGB: 32, freeDiskGB: 200 }));
  assert.equal(a.advice, 'cloud');
  assert.equal(a.canRunLocally, false);
  assert.equal(a.recommended, null);
  assert.deepEqual(a.runnable, []);
});

test('a GPU below the smallest tier still recommends cloud', () => {
  const a = assess(snap({ gpu: 'NVIDIA T500', vramMB: 4096, ramGB: 16, freeDiskGB: 100 }));
  assert.equal(a.advice, 'cloud');
  assert.deepEqual(a.runnable, []);
});

test('plenty of VRAM but too little RAM cannot run locally', () => {
  const a = assess(snap({ gpu: 'NVIDIA GeForce RTX 4090', vramMB: 24576, ramGB: 8, freeDiskGB: 500 }));
  assert.equal(a.advice, 'cloud');
  assert.deepEqual(a.runnable, []);
});

test('unknown disk is surfaced, not assumed, and does not block a fitting GPU', () => {
  const a = assess(snap({ gpu: 'NVIDIA GeForce RTX 4090', vramMB: 24576, ramGB: 64 })); // freeDiskGB omitted -> disk null
  assert.equal(a.diskKnown, false);
  assert.equal(a.hardware.freeDiskGB, null);
  assert.equal(a.advice, 'local');
  assert.deepEqual(a.runnable, ['compact', 'balanced', 'large']);
});

test('measured-but-insufficient disk removes the tiers that would not fit', () => {
  const a = assess(snap({ gpu: 'NVIDIA GeForce RTX 4090', vramMB: 24576, ramGB: 64, freeDiskGB: 10 }));
  assert.equal(a.diskKnown, true);
  assert.deepEqual(a.runnable, ['compact']); // balanced(16GB)/large(40GB) excluded by 10GB free
  assert.equal(a.recommended, 'compact');
});

test('a custom catalog is honored instead of the default', () => {
  const catalog = [{ id: 'tiny', label: 'Tiny', minVramGB: 2, minRamGB: 4, diskGB: 2 }];
  const a = assess(snap({ gpu: 'Intel Arc', vramMB: 4096, ramGB: 16, freeDiskGB: 50 }), catalog);
  assert.equal(a.advice, 'local');
  assert.deepEqual(a.runnable, ['tiny']);
  assert.equal(a.recommended, 'tiny');
});

test('missing/empty metrics degrade safely to cloud advice', () => {
  for (const input of [undefined, {}, { gpu: null }]) {
    const a = assess(input);
    assert.equal(a.advice, 'cloud');
    assert.equal(a.canRunLocally, false);
  }
});

test('assess does not mutate its inputs', () => {
  const metrics = snap({ gpu: 'NVIDIA GeForce RTX 4090', vramMB: 24576, ramGB: 64, freeDiskGB: 500 });
  const copy = JSON.parse(JSON.stringify(metrics));
  assess(metrics);
  assert.deepEqual(metrics, copy);
});

test('default catalog is frozen data', () => {
  assert.equal(Object.isFrozen(defaultCatalog), true);
  assert.equal(defaultCatalog.length, 3);
});

test('readHardware converts units correctly', () => {
  const hw = readHardware(snap({ gpu: 'GPU', vramMB: 16384, ramGB: 31.9, freeDiskGB: 123.4 }));
  assert.equal(hw.vramGB, 16);
  assert.equal(hw.ramGB, 31.9);
  assert.equal(hw.freeDiskGB, 123.4);
  assert.equal(hw.gpuName, 'GPU');
});
