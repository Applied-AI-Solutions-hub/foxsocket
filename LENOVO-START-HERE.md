# Shared Lenovo handoff

**Start with [PR #32](https://github.com/Applied-AI-Solutions-hub/foxsocket/pull/32). Its description and newest test results are the shared record between PCs.** Do not rely on another computer's chat history or local output paths.

## Current target

- Product: Foxsocket on a fresh Windows x64 Lenovo.
- Test build: `0.6.0-alpha.3` on `fix/installer-host-prerequisites` (PR #32).
- At the time of this handoff, `main` and the published download still contain alpha.2. Recheck the PR for subsequent changes; do not silently substitute the public release for this test build.
- Purpose: prove that choosing Host installs Windows/Ubuntu prerequisites, creates the Linux account, and resumes after a restart without manual installation commands.
- Existing Sparky on the other PC stays intact. Do not copy its accounts, memory, configuration or services onto the Lenovo to make this test pass.

## Get the same installer on either PC

1. Open PR #32 and the latest successful **Windows test installer** check for its current head commit.
2. Download the **Foxsocket-Windows-test-installer** artifact from the run summary. GitHub may require sign-in. Extract the ZIP.
3. Inspect `BUILD-INFO.json`: version must match the PR's current test target and `tested_head_sha` must match the PR head. Verify the installer against the included `SHA256SUMS.txt`. Do not use an older successful run after a newer commit has failed.
4. If there is no successful artifact, report that on PR #32. A source build is a fallback: preserve local changes, fetch/check out the PR branch, use Node 24 and pnpm 11.19.0, run `pnpm install --frozen-lockfile`, `node node_modules/electron/install.js`, and `pnpm dist`. The installer is under `release/`. Building does not validate first-time installation.

## Run the clean-install test

1. Record Windows version, current Foxsocket version, and whether Ubuntu/WSL has already been installed. Do not remove existing software merely to recreate a fresh state.
2. Close Foxsocket and run the test installer. Choose **Host**.
3. Let its setup window prepare Windows and Ubuntu. The person at the Lenovo approves Windows permission prompts and chooses when to restart after saving work.
4. Sign back into the same Windows account. Setup should reopen and continue without terminal commands.
5. Confirm **Ubuntu is ready**, then open Foxsocket and refresh the Host page. Confirm Ubuntu is discovered and record any next blocker.
6. If it fails, capture the exact stage/message and stop before a manual prerequisite workaround. A workaround can hide an installer defect. Do not disable Windows protection; record any SmartScreen or security block.

This test has not yet proven a complete first agent reply. OpenClaw provider onboarding remains separate. A green automated build proves packaging and mocked setup checks, not a successful real Windows reboot.

## Keep both PCs in sync

When asked to continue this handoff, Codex should read the PR description and latest comments first, identify the current target commit/build, and work from the Lenovo's actual state. After a test, add a concise result to PR #32 so the other PC can read it. If GitHub writes are unavailable, give the user the result as one copyable note; do not claim it was posted.

Use this result format, omitting private paths, credentials and account details:

```text
Lenovo test result
Build / PR head:
Windows version:
WSL/Ubuntu state before test:
Last successful step:
Exact failure or completion message:
Restart and automatic resume:
Any manual intervention:
Next action:
```
