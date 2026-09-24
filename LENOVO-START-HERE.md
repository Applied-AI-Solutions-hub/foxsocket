# Shared Lenovo handoff — alpha.6

**The owner has chosen to use Lenovo as a development PC.** Continue development with the **Foxsocket-Windows-UNSIGNED-DEVELOPMENT** CI artifact or `pnpm dev:fresh`. See [development setup](docs/development.md) (DEVELOPMENT.md in the artifact) for the explicit owner-controlled Windows setting and commands. No signing account is needed for development.

The previous alpha.6 artifact was blocked by Windows Application Control. That does not halt development: use the current unsigned development artifact on the owner-configured development PC. Read [PR #33](https://github.com/Applied-AI-Solutions-hub/foxsocket/pull/33) and match the commit/checksum, not just alpha.6. Free public signing remains separate and pending.

## Changes from the alpha.5 report

- Setup now brings progress into view when started and preserves scroll position, keyboard focus, and expanded details during updates. Model downloads use plain-language status, with raw layer identifiers under Download details.
- Progress saves and UI notifications are limited to one per 250 ms within each phase. Phase changes, errors, and completion save immediately. Abrupt interruption can lose the last fraction of a second of displayed progress; Ollama retains its own resumable download layers.
- Lighting controls and nonfunctional phone/tablet cards were removed to focus the workspace on agents.

- Local chat uses a short neutral prompt instead of the shipped household identity, device graph, and automatic memory instructions. New starter files contain no personal or device facts. Existing agent files are preserved; local chat does not read or modify their graph memory.
- Setup uses the same local prompt builder as chat and checks arithmetic and a short formatting instruction. A server connection or an arbitrary reply alone cannot pass. Passing two checks does not prove general answer quality.
- Installer registration is considered stale when no known application executable exists. Valid legacy install locations are retained exactly. Automatic application-folder appending is disabled to avoid `Agent Workspace/Foxsocket` nesting. Already nested installations stay in place for safe upgrades.
- Foxsocket explains that Ollama may open a welcome window and that no onboarding/sign-in there is required. The backend's installer currently launches that UI; Windows permission prompts are not hidden.

## Test the exact installer

Extract the current development artifact, verify SHA256SUMS.txt and the version/head in BUILD-INFO.json, and launch from Explorer after the owner has configured Windows for development. Expect the development installer to be unsigned. Record the Windows policy state with the results. Do not substitute the older public release.

The user requires a clean install for each Lenovo iteration. The previous cleanup was incomplete: deletion of leftover model/cache backups was denied by the agent's execution policy. Resolve and document the actual baseline before testing; do not call that state pristine or silently substitute an upgrade. Preserve unrelated user data and working Sparky. Do not manually install a backend to hide a failure.

1. Record the detected installation and final path. A removed installation must not produce a misleading legacy upgrade claim. An actual legacy installation may retain its existing folder without appending another Foxsocket folder. Fresh Windows-profile installation and legacy upgrade both need acceptance evidence; do not erase data merely to obtain it.
2. Open Host → Resume setup. Existing model choices are retained. Select **Recommended · Llama 3.2 3B** (about 2 GB download) and run setup. Record the exact selected model.
3. Observe runtime/model-layer progress, and whether Ollama opens its own window. Foxsocket should explain that no action there is needed. At 1268 × 666, starting setup should reveal the progress heading. Scroll elsewhere and expand Download details while it runs: subsequent updates should preserve both. Return to Foxsocket for the result.
4. Confirm both basic checks pass. If either fails, record the visible reply and do not mark answer validation passed.
5. Choose **New chat** to avoid carrying alpha.5's unrelated conversation into the test. Ask: `This is an installation test. What is 7 plus 5? Answer in one short sentence.` Expect 12. Then ask: `Reply with only the word blue.` Expect blue. Try another ordinary question and assess its answer yourself.
6. Close and reopen the app. Repeat in a new chat, then confirm the previous conversation remains accessible.
7. After saving other work, restart Windows, reopen Foxsocket, and repeat a normal chat request. This Windows restart test was not completed on alpha.5.
8. Check sidebar navigation, Models, Resume setup, the details toggle, resizing, and the absence of sliding animations. If a download fails, verify Resume setup and retained errors; do not claim interrupted-download recovery without observing it.
9. Uninstall Foxsocket and record the result and signature status. Record any additional blocked executable or script, including optional Ubuntu setup. Successful tests with Smart App Control off do not count as protected consumer-PC acceptance.

## Report on PR #33

Codex on the Lenovo should post version/head/checksum, Windows version, starting installation/model state, final installation path, selected model, exact arithmetic/format replies, app reopening and Windows restart results, backend welcome-window behavior, progress/retry observations, and any manual intervention. Separate passed, failed, and untested items. Omit credentials, private paths, and unrelated conversations.

Carry unresolved findings forward. No public release or full Lenovo acceptance is implied by a successful CI build.

## Known open work

The earlier Lenovo retest passed automatic runtime/model installation and app reopening, but failed the two-turn arithmetic → one-word-blue instruction. That answer-quality issue remains open. Download inactivity feedback and cancel controls, explicit ownership/start/stop controls for Ollama, agent naming and compatible OpenClaw skills, full Windows reboot/inference, and uninstall acceptance remain pending. Closing Foxsocket does not currently promise to stop Ollama; do not terminate a shared runtime or erase unrelated models as a workaround.
