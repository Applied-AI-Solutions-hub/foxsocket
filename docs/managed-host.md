# Managed Host build

The Host page replaces the terminal-command walkthrough with a live control screen. The public starter is a clean Sparky persona, with an editable name and a user-selected model. It must never be populated by exporting the owner's working Sparky agent.

## Implemented

- Host navigation, responsive control screen, real prerequisite/service/startup checks, progress and recoverable errors.
- Hidden execution through WSL `--exec`. OpenClaw arguments stay positional, including chat messages containing shell metacharacters.
- Reuse an existing configured agent. If the CLI is missing, a supported Linux environment can install pinned OpenClaw 2026.9.3 with the official user-prefix installer.
- Register or enable the Linux user service without killing an unidentified foreground gateway or overwriting an existing agent configuration.
- Enable lingering and a per-user hidden Windows logon task to keep WSL available. The task is self-contained and does not depend on the app window or a helper file in the install directory.
- Check that the unit is active/enabled, has a restart policy, can run without a terminal, and has a responding gateway. Provider inference and remote pairing are separate checks.
- Existing agent selection and connection remain available. Tailscale status is shown separately from app pairing.
- Drafts in this version survive app restarts using local storage.
- Two-tier diagnosis, split at the point where OpenClaw itself becomes able to run:
  - **Before OpenClaw can run**, Foxsocket diagnoses it directly, using safe signal it already has rather than a generic failure message: a failed runtime install is classified by curl's own documented exit code (DNS failure, connection blocked, timeout, TLS/certificate problems consistent with a corporate proxy, disk full), and a missing systemd is split into "not enabled in this distro's `/etc/wsl.conf`" (user-fixable) versus "enabled in `wsl.conf` but this WSL kernel doesn't actually support it" (needs `wsl --update`). Still text-only classification — nothing is edited or repaired automatically at this tier.
  - **Once OpenClaw is installed**, `openclaw doctor --json` runs as part of every check and its findings (gateway, channels, plugins, model routing, config, sandbox) are attached to the checks — advisory only, a finding never blocks a Host from reaching `ready`. A separate `repair(distro)` operation runs `openclaw doctor --fix --non-interactive` and re-verifies afterward; it is never invoked by `prepare()` automatically, only as its own explicit action.

IPC: `host-status` reads the current operation; `host-check(distro)` starts inspection; `host-prepare(distro)` starts preparation; `host-repair(distro)` runs OpenClaw's own doctor repair and re-verifies; `host-progress` reports safe structured state. Credentials and raw CLI output are not sent to the renderer. The manager serializes all four operations against one another.

## Public starter decision

`starter-agent.json` is a bundled, app-owned starter manifest, not an OpenClaw configuration and not yet an automatically provisioned agent. Its agent ID is independent of its display name. The user's selected provider/model must be configured before the first conversation test. The starter contains no credentials, personal memory, Discord identity, private network identity, or data copied from the owner's agent.

The public setup must guide this complete path:

1. Inspect the PC and choose Host or Client.
2. Prepare Linux and the runtime, with explicit Windows permission/restart handling.
3. Name the starter agent and choose cloud or local execution.
4. For cloud execution, select a supported model and connect the user's own provider account. For local execution, assess memory/GPU/storage and show the model download before starting it. Model licenses and required runtime support must be checked before bundling.
5. Review permissions, provision the starter, and verify an actual model reply.
6. Prepare and verify the background service.
7. Sign in to Tailscale and pair authorized devices. A connected tailnet alone does not prove app pairing.

## Not complete

The fresh-PC Linux installation/initialization flow, embedded provider account wizard, starter provisioning, model downloads, remote app pairing, and mobile clients are not implemented by this patch. Existing provider configuration is reused. Missing configuration is an explicit incomplete state, never a green setup result. New provider access may require browser sign-in, a key, a subscription, or usage charges.

The diagnosis and repair logic above (`host-manager.js`, `host-main.js`) is implemented and unit-tested, but **not yet wired into any UI**. There is no renderer panel showing doctor findings or a runtime-failure's classified reason, and no button that calls `host-repair`. It is reachable only from `preload.js`'s allowlist and `ipcMain`, not from anything a tester can click. `openclaw doctor`'s exact `--json` field names beyond `ok`/`findings` are inferred from documentation, not from a real captured payload — verify against actual `openclaw doctor --json` output on a real install before trusting the parsing beyond those two fields.

Startup is configured after Windows sign-in, not before login. The PC must be awake for remote access. Actual Windows reboot and fresh-PC provisioning still need testing. Do not publish this patch as a finished beginner onboarding flow.

## Validation

Run `node --test host-manager.test.cjs setup.test.cjs updates.test.cjs`, `pnpm test:ui`, `pnpm exec electron host-smoke.cjs`, and `pnpm exec electron updates-smoke.cjs`. Host UI checks cover progress, retry, existing agent selection, honest Tailscale status, and 1440/1000/760 pixel widths.

`host-manager.test.cjs` (15 cases as of this patch) covers the diagnosis/repair logic against a mocked `execute`: doctor findings attach without blocking readiness, `repair()` calls `openclaw doctor --fix --non-interactive` and re-verifies, a failed repair reports cleanly, runtime-install failures are classified by mocked exit codes (6/7/28/35/60/23, plus an unrecognized code falling back to the generic message), and the two systemd sub-cases produce distinct guidance. None of this has run against a real `openclaw doctor` on Windows yet — the mock's `{ok, findings}` shape is inferred from documentation. Verify the real output shape before relying on it further.

Background Windows startup recovery and actual reboot behavior have not passed end-to-end validation. A stopped task was observed during development; this remains a release limitation.

The Electron lifecycle checks (`pnpm exec electron host-lifecycle-smoke.cjs` and the same command with `--preparing`) verify that normal close exits the app and that an active preparation job finishes before exit. These isolated checks do not prove actual Windows startup recovery.
