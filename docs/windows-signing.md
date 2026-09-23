# Windows publisher signing and the Lenovo policy block

Alpha.6's matching installer was **NotSigned** and Windows Application Control blocked it before launch. Its setup/chat fixes remain untested on Lenovo. A successful packaging job was not evidence of installability.

## Build behavior

- `pnpm dist` requires Azure publisher configuration and successful code signing. Missing configuration fails before packaging.
- Pull-request CI explicitly enables `FOXSOCKET_UNSIGNED_VALIDATION=1` to exercise packaging without credentials. It uploads **no installer**. Developers can use the same explicit flag for local packaging validation; never distribute that output.
- `Windows signed installer` is manually dispatched from **main only**. It uses the `windows-signing` GitHub environment. There is no PR signing trigger and no untrusted PR artifact is promoted into signing.
- electron-builder signs executables, DLLs, native modules, and external PowerShell resources. NSIS verifies the signed uninstaller before embedding it. The workflow checks the installer and packaged executable files for a valid Authenticode signature, the expected publisher, a code-signing certificate, and a timestamp. Missing or invalid evidence fails the upload.
- `BUILD-INFO.json` records signed-file hashes, publisher, certificate thumbprint, timestamp authority, source/checkout SHAs, and run URL. The installer checksum is generated after signing. Windows policy acceptance remains explicitly pending.

## One-time publisher setup (not yet completed)

An owner must provision an [Azure Artifact Signing account](https://learn.microsoft.com/en-us/azure/artifact-signing/quickstart), complete Microsoft's identity validation, and create a **Public Trust** certificate profile. This external identity/account requirement cannot be replaced with a self-signed certificate. No signing account or certificate was found on the development PC; GitHub environment configuration has not been verified.

1. In GitHub Settings → Environments create `windows-signing`. Require reviewer approval, prevent self-review where available, and restrict deployment branches to **main only**. Protect main and require review of workflow/build changes. Configure these protections before adding credentials.
2. Create an Azure service principal with **Artifact Signing Certificate Profile Signer** (formerly Trusted Signing Certificate Profile Signer) scoped to the chosen profile. Store its `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, and `AZURE_CLIENT_SECRET` as **environment secrets**, never repository-wide secrets or checked-in files. Rotate the secret per your account policy. This implementation uses electron-builder v26's documented environment authentication.
3. Add environment variables `WINDOWS_SIGNING_PUBLISHER` (exact certificate common name), `AZURE_SIGNING_ENDPOINT` (regional HTTPS endpoint), `AZURE_SIGNING_ACCOUNT`, and `AZURE_SIGNING_PROFILE`.
4. After reviewed changes reach main, dispatch **Windows signed installer** on main and approve that exact reviewed commit. Only the signing build step receives credentials. Do not allow arbitrary refs or PR code to use this environment.
5. Download the resulting `Foxsocket-Windows-signed-test-installer` artifact. Verify its version, commit, signature records, and checksum before testing. A green PR validation run has no downloadable installer.

See [electron-builder v26 signing configuration](https://www.electron.build/v26/docs/features/code-signing/code-signing-win/) and [Microsoft Smart App Control testing](https://learn.microsoft.com/en-us/windows/apps/develop/smart-app-control/test-your-app-with-smart-app-control).

## Acceptance still required

Keep Smart App Control/Application Control enabled. On the Lenovo, test Explorer launch, clean installation, app startup, local model setup/chat, Windows restart, and uninstall. Record the installed uninstaller's signature too. Exercise optional Host/Ubuntu setup separately, including its PowerShell scripts and downloaded prerequisites; a signature on Foxsocket does not grant blanket permission to dependencies or scripts. Report additional policy failures with their exact blocked file and CodeIntegrity event rather than relaxing policy.

Each Lenovo iteration must start with the user's requested clean install. The previous cleanup was incomplete because deletion of model/cache backups was denied by the agent's execution policy. That separate denial is not fixed by installer signing. Record remaining state; do not call it a pristine baseline. Do not delete unrelated Sparky data or change Windows protection. A disposable Windows test environment may help repeated clean tests, but does not prove acceptance on the protected Lenovo.
