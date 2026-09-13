# Real-hardware acceptance: testing the real deal

This is the checklist for proving Foxsocket actually works end to end — a genuine
agent reply through the app — on real hardware. It complements the automated
suites, which validate logic and UI against mocked services but **cannot** prove
a live reply.

## Why the cloud/Linux dev box can't do it

The live path is Windows-only by design: the app reaches the agent through
`wsl.exe` (`main.js`, `host-manager.js`), readiness detection returns
`supported:false` off Windows (`setup.js`), and hardware telemetry uses
`nvidia-smi.exe` / `statfs('C:\\')`. So a real reply requires the rig below.

## The rig

Windows 11 x64 with WSL2 + Ubuntu-24.04 + OpenClaw, plus one model on-ramp:

- **Cloud path** — an AI provider account + key. Fastest to stand up; has per-use cost.
- **Local-GPU path** — a gaming PC with an NVIDIA GPU + a local runtime (e.g. Ollama)
  running a model that fits the tier the Devices panel recommends. Best for a
  repeatable internal test rig; no provider billing.

## Step 0 — Run the in-app diagnostics first

Settings → **Readiness diagnostics** → **Run diagnostics**. This runs the real
checks (`setup.inspect`, `setup.inspectWslHost`, `metrics`, `gateway`) and prints
a **redacted, shareable** report. Attach it to every test result. It contains no
credentials, file paths, or network addresses, and nothing is uploaded. A
`checks-passed` result still requires Step 5 — a responding gateway is not proof
of a working agent.

## End-to-end acceptance (record a checkpoint result for each)

1. **Install & launch.** Installer (or `pnpm start`). The offline workspace
   (tasks, notes, folders, settings) works with no agent connected.
2. **Prepare Linux.** `wsl --install -d Ubuntu-24.04`, reboot if asked, create the
   Linux user. **Checkpoint:** diagnostics shows the environment under WSL.
3. **Install OpenClaw & connect a model.** `curl -fsSL https://openclaw.ai/install.sh | bash`,
   then `openclaw onboard`. Choose the **cloud provider** (sign in / paste key in
   OpenClaw's own prompt — never in the app) **or** point at the **local Ollama**
   model. **Checkpoint:** the provider/model test passes.
4. **Background service.** `openclaw gateway install`, `openclaw gateway status --json`
   (and `gateway start` if stopped). **Checkpoint:** diagnostics `Background gateway` = pass.
5. **Real reply through the app.** Select the environment/agent in Connection setup
   and send a message. **Checkpoint (the real deal):** the correct agent replies in
   the app, the conversation survives close/reopen, and the app stays usable when
   the Host is offline.
6. **Reboot persistence.** Restart Windows and re-verify Steps 4–5. This is the
   riskiest checkpoint; `docs/managed-host.md` flags Windows startup recovery as
   not-yet-proven.

## Security while testing (non-negotiable)

- Keys/passwords go only into OpenClaw's own prompts, never the app chat or reports.
- Share the redacted diagnostics report, not raw terminal output.
- Never disable Windows protections to get past SmartScreen; record the exact message instead.

## What can be automated vs. what needs hardware

| Layer | Where it runs | Status |
| --- | --- | --- |
| Pure logic (`setup`, `updates`, `host-manager`, `capability`, `diagnostics`) | anywhere (`node --test`) | automated |
| UI against mocked IPC (`*-smoke.cjs`) | any machine with a display / Xvfb | automated |
| Diagnostics plumbing (non-Windows honest `unsupported`) | CI (`diagnostics-smoke.cjs`) | automated |
| WSL + OpenClaw + a real reply | Windows; GPU for the local path | **manual, this checklist** |

CI notes: `windows-latest` runners can run the cross-platform unit tests and the
Electron smokes, but WSL2 is unreliable there (nested virtualization) and GPUs are
unavailable — the live agent-reply and local-GPU tests need a **self-hosted
Windows + GPU runner**.
