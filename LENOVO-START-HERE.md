# Shared Lenovo handoff — alpha.4

[PR #32](https://github.com/Applied-AI-Solutions-hub/foxsocket/pull/32) is the shared record between PCs. Read its current description and latest comments first. Do not rely on another computer's chat history or local file paths.

## Current target and changes

Use **0.6.0-alpha.4** on `fix/installer-host-prerequisites`. Main and the public release may still be alpha.2; the previous Lenovo test used alpha.3. Use the matching artifact linked in the PR description.

The alpha.3 test proved Ubuntu setup, but exposed a missing local model backend and an unrelated OpenClaw configuration gate. Alpha.4 makes native Windows local chat the main setup path. Choose Host, then **Set up local model**. Foxsocket installs Ollama, downloads the model with progress, and verifies a real reply from that exact model. No OpenAI key, Ubuntu, or OpenClaw configuration is required for this path.

The first model option is `llama3.2:1b` (about 1.3 GB); `llama3.2:3b` (about 2 GB) is also available. Ollama needs additional disk space. Start with the small model. Performance depends on the Lenovo and must be tested.

**Resume setup** is always available in the sidebar and on This PC. The model, stage, and last error are saved. After reopening a completed setup, Foxsocket rechecks a real local reply. Missing software is reported rather than silently downloaded.

Ubuntu/OpenClaw remains an optional setup under Other setup options. Existing Ubuntu, OpenClaw, models, and working Sparky on the other PC are preserved.

## Obtain the installer

Download **Foxsocket-Windows-test-installer** from the latest successful **Windows test installer** run for PR #32's current head. The PR description links the artifact. GitHub sign-in may be required. Extract the ZIP, verify SHA256SUMS.txt, and confirm BUILD-INFO.json matches the PR head. Do not reuse an alpha.3 artifact.

If the build has not passed or the artifact expired, report that on PR #32. Source build fallback: preserve local changes, check out the PR branch, use Node 24 and pnpm 11.19.0, then run `pnpm install --frozen-lockfile`, `node node_modules/electron/install.js`, and `pnpm dist`.

## Lenovo acceptance test

1. Record Windows version and current Ollama/model/Ubuntu state. Do not remove existing installations or copy working Sparky configuration to make this test pass.
2. Close Foxsocket. Launch the alpha.4 installer normally from Explorer, outside Codex's shell, so bundled developer tools do not influence readiness. Choose Host and open Foxsocket.
3. Choose the small local model and Set up local model. Confirm Ollama and model download progress appears. No API key or manual prerequisite commands should be needed.
4. Confirm the selected model's verification reply appears and setup says ready. Send a normal chat message and verify its reply too.
5. Navigate to This PC, then Resume setup / view progress. Confirm the model and result are preserved.
6. If a download fails, record the exact error and retry through Resume setup. Do not manually install a backend to conceal a product defect.
7. Save other work and restart Windows when ready. Reopen Foxsocket. Confirm it starts/reuses Ollama, rechecks a real reply, and can answer another chat message. Record whether it works after reboot and after closing/reopening the app.
8. Record any Windows/SmartScreen block without disabling protection.

Automated tests use fake runtimes/model replies. They do not prove Ollama installation or inference on this Lenovo. Hosted API testing is outside this test; no cloud credentials are needed.

## Record the result here

Codex on the Lenovo should post a concise result as a comment on PR #32. Codex on the other PC should read it before making another change. Omit credentials and private paths. If GitHub writes are unavailable, provide one copyable note and say it was not posted.

```text
Lenovo alpha.4 test result
Build / PR head:
Windows version:
Ollama/model state before test:
Installer launched from Explorer:
Ollama install/start:
Selected model and download progress:
Verification reply and normal chat reply:
Resume setup and retained errors:
After Windows restart:
Exact error / last successful step:
Any manual intervention:
Next action:
```