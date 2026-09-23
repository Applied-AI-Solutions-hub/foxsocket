const { test } = require('node:test');
const assert = require('node:assert/strict');
const signing = require('./windows-signing.cjs');

test('missing or partial publisher configuration cannot produce a distributable build', () => {
  assert.throws(() => signing({}), /Trusted Windows signing is not configured/);
  assert.throws(() => signing({ WINDOWS_SIGNING_PUBLISHER: 'Example' }), /AZURE_SIGNING_ENDPOINT/);
});
test('configured distribution requires executable signing', () => {
  const config = signing({ WINDOWS_SIGNING_PUBLISHER: 'Example', AZURE_SIGNING_ENDPOINT: 'https://eus.codesigning.azure.net/', AZURE_SIGNING_PROFILE: 'public-trust', AZURE_SIGNING_ACCOUNT: 'example' });
  assert.equal(config.forceCodeSigning, true);
  assert.equal(config.signExecutable, true);
  assert.equal(config.azureSignOptions.publisherName, 'Example');
});
test('unsigned validation cannot be enabled in a dispatched CI release', () => {
  assert.throws(() => signing({ FOXSOCKET_UNSIGNED_VALIDATION: '1', GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: 'workflow_dispatch' }), /only permitted/);
  assert.equal(signing({ FOXSOCKET_UNSIGNED_VALIDATION: '1', GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: 'pull_request' }).signExecutable, false);
});
