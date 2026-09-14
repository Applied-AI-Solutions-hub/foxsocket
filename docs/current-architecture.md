# Foxsocket alpha: current architecture

`index.html` loads `workspace.js`, `host-ui.js`, `updates-ui.js`, the branding module and the built UI-effects bundle. The old `app.js`/finish renderer is historical and is excluded from new packages. `main.js` owns window/lifecycle and IPC; `preload.js` exposes only named operations. Production startup has no smoke-test execution path. Standalone fixture smoke scripts use isolated profiles.

## Routes and responsibilities

| Screen | Renderer | Main-process boundary |
| --- | --- | --- |
| Conversation | workspace.js | chat, gateway, conversation-new/select |
| Workspaces and Tasks | workspace.js | folder, open-folder, save |
| Devices | workspace.js | lighting, lighting-apply/sync/restore, metrics |
| Host | host-ui.js | host-status/check/prepare; setup discovery and configured-agent selection |
| Settings | workspace.js, updates-ui.js | startup, save, export/import, updates-state/check/open |

The Host runs through OpenClaw in WSL, independently of the desktop window. Provider onboarding and remote app pairing are unfinished. A running gateway is not proof of a successful model reply. Existing OpenClaw tools retain their configured permissions; Foxsocket is not a separate model sandbox.

## Data and recovery

Local state remains in the existing profile for compatibility. Portable exports allowlist conversation text, notes and tasks. They omit session keys, connection/setup metadata, folders and hardware snapshots. Portable backups are plaintext and must be handled as private documents.

Restore validates version, types and sizes before confirmation. It makes a private full-state recovery copy under the profile's `backups` directory before replacing content. Connection, identity, services and hardware settings stay local. Imported conversations receive new agent session IDs; model-side memory and access to the original sessions are not restored. Legacy raw-state recovery remains a manual operation. No existing history is automatically truncated. Encryption and storage-retention UX remain follow-up work.

## Runtime integrity

Both managed installation and the optional copied terminal command use `runtime-install.js`. The bundled manifest pins the exact observed bootstrap script SHA-256 and requested OpenClaw version. A changed script fails before bash execution; a new reviewed manifest is required. This protects bootstrap consistency, not upstream compromise before pinning or all transitive package downloads. The script still relies on upstream package distribution. No fresh runtime was installed during source validation.

## Releases

Updates use public GitHub releases; the application no longer collects access tokens. Existing encrypted token files are untouched but unused. CI and test-installer workflows do not publish releases or modify branch protection. Required-check enforcement must be enabled separately in GitHub after the checks are available. Test artifacts are not public releases; publish only a newly versioned, device-tested installer.
