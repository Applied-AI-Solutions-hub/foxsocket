# Fresh-PC setup: beginner walkthrough

## Start with a local model

In alpha.6, choose Host in the installer, open Foxsocket, and choose **Set up local model**. Local chat runs directly on Windows. It does not require Ubuntu, OpenClaw, a cloud account, or an API key.

1. Start with the recommended Llama 3.2 3B model. The model download is about 2 GB; Ollama requires additional disk space. A larger model may need more memory than this computer has.
2. Foxsocket downloads Ollama from its official website, checks the installer signature, installs it for your Windows account, and starts the local service.
3. Foxsocket downloads your chosen model. The progress panel shows actual transferred bytes/total when available, or an activity indicator when Windows or Ollama has not supplied a total.
4. Setup verifies the selected model is installed and checks basic arithmetic and instruction following through the local chat prompt. The panel shows those replies; this is not a guarantee of general answer quality. A running Ollama server alone is not a successful setup result.
5. Choose Start a conversation and send your first message.

## Resume or retry

**Resume setup** is always in the sidebar. **This PC** also has a Resume setup / view progress button. Your selected model, last stage and error remain saved. If a download fails, fix the reported condition and retry here; Ollama can reuse downloaded layers. If you close Foxsocket during setup, it asks whether to keep working or exit and resume later.

After Windows restarts, reopen Foxsocket. A previously completed local setup is rechecked with a fresh reply, and an installed Ollama service is started if needed. If a model or runtime has been removed, setup explains what is missing. It does not silently download software during a status check.

Record any security or SmartScreen message without disabling Windows protection. Do not paste private paths, credentials or unredacted logs into public test reports.

## Hosted provider settings

Models also contains the existing hosted provider settings. Provider API access can have separate billing from a chat subscription. Saving a model name or checking account access does not prove the selected model can answer; send a message to establish a real reply. The current Lenovo acceptance test uses local Ollama and does not need a cloud key.

## Optional Ubuntu / OpenClaw integration

Choose Resume setup, then **Ubuntu / OpenClaw setup** under Other setup options. This is separate from native Windows local chat. Existing Linux environments are preserved. If Linux is missing, **Set up Ubuntu** opens the bundled Windows preparation helper. Windows may request administrator permission and a restart; the helper resumes after sign-in. Its progress window shows current activity and available command output, and retains the last stage/error across restart.

OpenClaw preparation still needs an independently configured OpenClaw agent and provider. The embedded OpenClaw account wizard is not complete. A healthy OpenClaw gateway is not proof of a model reply. Do not use that unfinished optional path as a prerequisite for local chat.

Client pairing and remote-device conversation sync are not implemented in this alpha.

## References

- Ollama Windows requirements and installation: https://docs.ollama.com/windows
- Llama 3.2 models and license: https://ollama.com/library/llama3.2
- Shared Lenovo test target and results: https://github.com/Applied-AI-Solutions-hub/foxsocket/pull/33
Ollama may open its own welcome window. No sign-in or onboarding there is required for Foxsocket; return to Foxsocket for setup progress.
