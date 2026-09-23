// PR builds compile only. Installers for people must use a verified publisher.
module.exports = function windowsSigning(env) {
  if (env.FOXSOCKET_UNSIGNED_VALIDATION === '1') {
    if (env.GITHUB_ACTIONS === 'true' && env.GITHUB_EVENT_NAME !== 'pull_request') {
      throw new Error('Unsigned CI packaging is only permitted for pull_request validation.');
    }
    return { forceCodeSigning: false, signExecutable: false };
  }
  const fields = {
    publisherName: 'WINDOWS_SIGNING_PUBLISHER',
    endpoint: 'AZURE_SIGNING_ENDPOINT',
    certificateProfileName: 'AZURE_SIGNING_PROFILE',
    codeSigningAccountName: 'AZURE_SIGNING_ACCOUNT',
  };
  const missing = Object.values(fields).filter(name => !env[name]?.trim());
  if (missing.length) {
    throw new Error(`Trusted Windows signing is not configured (${missing.join(', ')}). See docs/windows-signing.md. No distributable installer will be built.`);
  }
  return {
    forceCodeSigning: true,
    signExecutable: true,
    azureSignOptions: Object.fromEntries(Object.entries(fields).map(([key, name]) => [key, env[name].trim()])),
  };
};
