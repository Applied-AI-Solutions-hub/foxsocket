# Foxsocket

**Your agent. Your devices. Connected.**

Open-source personal AI desktop workspace by [Applied AI Solutions](https://appliedai.solutions), with Sparky as its mascot.

This is an **early Windows alpha** for testers. It is not a finished agent hosting platform yet.

> **Current test build: alpha.4.** [PR #32](https://github.com/Applied-AI-Solutions-hub/foxsocket/pull/32) contains the matching installer download and shared Lenovo test instructions. Choose Host, then **Set up local model**. Foxsocket installs Ollama, downloads your model with progress, and verifies a real reply. Local chat runs directly on Windows; Ubuntu/OpenClaw is an optional separate integration. The release link below remains the older public alpha.2.

## Quick start (Windows testers)

1. Download the installer: [**Foxsocket.Setup.0.6.0-alpha.2.exe**](https://github.com/Applied-AI-Solutions-hub/foxsocket/releases/download/v0.6.0-alpha.2/Foxsocket.Setup.0.6.0-alpha.2.exe)
2. Run it, pick an install location, then launch Foxsocket.
3. Choose **Host** to assess this PC for running an agent (or **Client** if you are joining another Host).
4. On the Host page, inspect what is missing — that readiness report is a core test.

Release page (notes + checksums): [v0.6.0-alpha.2](https://github.com/Applied-AI-Solutions-hub/foxsocket/releases/tag/v0.6.0-alpha.2)

Optional integrity check: download [`SHA256SUMS.txt`](https://github.com/Applied-AI-Solutions-hub/foxsocket/releases/download/v0.6.0-alpha.2/SHA256SUMS.txt) from the same release.

### Installer notes

- No GitHub account, Git, Node.js, or OneDrive is required to install the app.
- Windows x64 only. The installer is **unsigned**. If Windows or SmartScreen blocks it, **record the exact message** in your test report — do **not** disable Windows protection.
- Prefer the `.exe` installer. The source ZIP on the release is for developers.

## What to test

Focus on these paths:

- Install, launch, resize, close, and reopen
- Local tasks, notes, working folders, and settings persisting across restarts
- Host readiness on a fresh PC, including missing-dependency states
- Connecting an **existing configured** OpenClaw agent in WSL
- Public GitHub update checks on startup

## What works vs what does not

### In this alpha

- Native Windows local-model setup with Ollama installation, model downloads, a real selected-model reply check, and persistent Resume setup navigation (alpha.4 test build).
- Desktop install and workspace basics (tasks, notes, folders, settings)
- Host readiness / service controls for an existing OpenClaw setup
- Clean **Sparky** starter manifest (rename allowed; no personal credentials or memory bundled)
- Startup update checks against the public GitHub release

### Not finished yet

- Fresh-PC validation of the new Ollama/model setup and revalidation after restarting Windows
- Embedded OpenClaw provider account wizard and automatic OpenClaw starter provisioning
- End-to-end “fresh PC → first agent reply” remains an acceptance test; local chat no longer requires OpenClaw configuration
- Remote application pairing, iPhone/iPad clients, and cross-device conversation sync
- Treating a connected Tailscale network as app pairing (Tailscale is the intended private path; pairing itself is not implemented)
- Proven Windows background-task recovery and reboot persistence
- The new 3D mascot model (not integrated)

Lighting is optional and needs compatible hardware plus a separate local OpenRGB SDK server. Support is device-specific.

More Host detail: [Host implementation status](docs/managed-host.md).

## Report a test result

[Open an issue](https://github.com/Applied-AI-Solutions-hub/foxsocket/issues/new) and include:

- App version (`0.6.0-alpha.2` or what About shows)
- Windows version
- Host or Client
- Steps, expected result, actual result
- Exact SmartScreen / blocker text if install was blocked

**Do not** paste tokens, conversations, personal paths, IP addresses, or account details in screenshots or logs.

## Build from source (developers)

Windows with Node.js 22+ and pnpm 11:

```powershell
git clone https://github.com/Applied-AI-Solutions-hub/foxsocket.git
cd foxsocket
pnpm install --frozen-lockfile
pnpm start
```

- `pnpm dist` — Windows installer into `release`
- `node --test host-manager.test.cjs setup.test.cjs updates.test.cjs` and `pnpm test:ui` — checks

See [Contributing](CONTRIBUTING.md) and [Host implementation status](docs/managed-host.md).

## License

Original code is [MIT](LICENSE). See [third-party notices](THIRD-PARTY-NOTICES.md).

Existing package and application identifiers stay stable for profile compatibility, so some internal names still refer to Applied AI Command Center.

## Documentation

See the [documentation index](docs/README.md) for current guides, design proposals and historical release notes.
