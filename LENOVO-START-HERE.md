# Shared Lenovo handoff — alpha.6

**STOP: the previous alpha.6 artifact is unsigned and was blocked by Windows Application Control before launch. Its functional fixes have not been tested on Lenovo.** Read [PR #33](https://github.com/Applied-AI-Solutions-hub/foxsocket/pull/33), including the latest test comments. Wait for a new artifact from **Windows signed installer**, with valid signature records in BUILD-INFO.json. Ordinary PR checks no longer publish installers. [Signing setup and current blocker](docs/windows-signing.md).

## Changes from the alpha.5 report

- Local chat uses a short neutral prompt instead of the shipped household identity, device graph, and automatic memory instructions. New starter files contain no personal or device facts. Existing agent files are preserved; local chat does not read or modify their graph memory.
- Setup uses the same local prompt builder as chat and checks arithmetic and a short formatting instruction. A server connection or an arbitrary reply alone cannot pass. Passing two checks does not prove general answer quality.
- Installer registration is considered stale when no known application executable exists. Valid legacy install locations are retained exactly. Automatic application-folder appending is disabled to avoid `Agent Workspace/Foxsocket` nesting. Already nested installations stay in place for safe upgrades.
- Foxsocket explains that Ollama may open a welcome window and that no onboarding/sign-in there is required. The backend's installer currently launches that UI; Windows permission prompts are not hidden.

## Test the exact installer

Once a signed artifact is available, extract the ZIP, verify SHA256SUMS.txt and the version/head/signature records in BUILD-INFO.json. Check that Windows shows a valid expected publisher signature, then launch from Explorer with protection still enabled. Do not retry the blocked unsigned alpha.6 artifact or substitute the older public release.

The user requires a clean install for each Lenovo iteration. The previous cleanup was incomplete: deletion of leftover model/cache backups was denied by the agent's execution policy. Resolve and document the actual baseline before testing; do not call that state pristine or silently substitute an upgrade. Preserve unrelated user data and working Sparky. Do not manually install a backend to hide a failure.

1. Record the detected installation and final path. A removed installation must not produce a misleading legacy upgrade claim. An actual legacy installation may retain its existing folder without appending another Foxsocket folder. Fresh Windows-profile installation and legacy upgrade both need acceptance evidence; do not erase data merely to obtain it.
2. Open Host → Resume setup. Existing model choices are retained. Select **Recommended · Llama 3.2 3B** (about 2 GB download) and run setup. Record the exact selected model.
3. Observe runtime/model-layer progress, and whether Ollama opens its own window. Foxsocket should explain that no action there is needed. Return to Foxsocket for the result.
4. Confirm both basic checks pass. If either fails, record the visible reply and do not mark answer validation passed.
5. Choose **New chat** to avoid carrying alpha.5's unrelated conversation into the test. Ask: `This is an installation test. What is 7 plus 5? Answer in one short sentence.` Expect 12. Then ask: `Reply with only the word blue.` Expect blue. Try another ordinary question and assess its answer yourself.
6. Close and reopen the app. Repeat in a new chat, then confirm the previous conversation remains accessible.
7. After saving other work, restart Windows, reopen Foxsocket, and repeat a normal chat request. This Windows restart test was not completed on alpha.5.
8. Check sidebar navigation, Models, Resume setup, the details toggle, resizing, and the absence of sliding animations. If a download fails, verify Resume setup and retained errors; do not claim interrupted-download recovery without observing it.
9. Verify the installed uninstaller's signature, uninstall Foxsocket, and record whether Application Control allowed it. Record any additional blocked executable or script, including optional Ubuntu setup, without changing Windows protection.

## Report on PR #33

Codex on the Lenovo should post version/head/checksum, Windows version, starting installation/model state, final installation path, selected model, exact arithmetic/format replies, app reopening and Windows restart results, backend welcome-window behavior, progress/retry observations, and any manual intervention. Separate passed, failed, and untested items. Omit credentials, private paths, and unrelated conversations.

Carry unresolved findings forward. No public release or full Lenovo acceptance is implied by a successful CI build.
