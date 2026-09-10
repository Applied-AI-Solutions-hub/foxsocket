# Foxsocket

**Your agent. Your devices. Connected.**

An open-source personal AI desktop workspace by Applied AI Solutions, with Sparky as its mascot. This is an early Windows alpha, not a completed agent hosting platform.

## Download the Windows test build

[Download Foxsocket 0.6.0-alpha.2](https://github.com/Applied-AI-Solutions-hub/foxsocket/releases/tag/v0.6.0-alpha.2)

1. Open the release link and expand **Assets**.
2. Download **Foxsocket Setup 0.6.0-alpha.2.exe**. The source ZIP is for developers.
3. Run the installer, choose the installation location, then launch Foxsocket.
4. Choose **Host** to assess this PC for running an agent. Use the Host page to inspect what is missing.

No GitHub account, Git, Node.js, or OneDrive is needed to install the app. The Windows x64 installer is unsigned. If Windows blocks it, record the exact message for the test report; do not disable Windows protection.

## What to test

- Installation, launch, window resizing, closing and reopening.
- Local tasks, notes, working folders and settings persisting across restarts.
- Host readiness reporting on a fresh PC, including missing-dependency states.
- Connecting an existing configured OpenClaw agent in WSL.
- Public GitHub update checks on startup.

## What is not finished

The clean-PC Linux initialization flow, model/provider account wizard and automatic starter-agent provisioning are incomplete. The app cannot yet take a PC with no OpenClaw through to its first agent reply entirely on its own. Do not expect a working agent immediately after installation on a fresh PC.

Tailscale is the intended private connection path for Host/Client use. Remote application pairing, iPhone/iPad clients and cross-device conversation sync are not implemented in this alpha. A connected Tailscale network alone does not enable these features. Windows background-task recovery and reboot persistence need further testing.

Lighting is optional and requires compatible hardware plus a separate local OpenRGB SDK server. Support is device-specific.

The clean starter manifest defaults to **Sparky** and allows renaming. It contains no personal account, credentials, conversations or private memory. Agent configuration currently must already exist before connection. The new 3D mascot model is not integrated in this alpha.

## Report a test result

[Open an issue](https://github.com/Applied-AI-Solutions-hub/foxsocket/issues/new). Include app version, Windows version, Host/Client choice, steps, expected result and actual result. Remove tokens, conversations, personal paths, IP addresses and account information from screenshots or logs.

## Build from source

Use Windows with Node.js 22 or later and pnpm 10:

```powershell
git clone https://github.com/Applied-AI-Solutions-hub/foxsocket.git
cd foxsocket
pnpm install --frozen-lockfile
pnpm start
```

Run `pnpm dist` to build the Windows installer into `release`. Run `node --test host-manager.test.cjs setup.test.cjs updates.test.cjs` and `pnpm test:ui` for checks. Read [Contributing](CONTRIBUTING.md) and [Host implementation status](docs/managed-host.md).

The original code is [MIT licensed](LICENSE). See [third-party notices](THIRD-PARTY-NOTICES.md). Existing package/application identifiers remain stable for profile compatibility, so some internal names still refer to Applied AI Command Center.
