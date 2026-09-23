# Fresh-PC setup: beginner walkthrough

This guide is bundled with the app so setup help does not depend on having a working agent. Starting with the 0.6.0-alpha.3 build, Host installation includes Windows/Ubuntu preparation with restart recovery. OpenClaw account onboarding remains a separate step. Remote Client pairing is planned and is not implemented in this alpha.

## First, choose what this computer will do

**Client:** use an agent running on another computer. The other computer is its Host and must be awake and reachable. You do not need OpenClaw, a Linux environment, or a separate provider account on a Client just to chat with that Host.

**Host:** run your own agent on this computer. We will prepare its runtime, connect your chosen AI provider, name the agent, choose access, and verify a reply. Private networking is added afterward if you want access from another device.

Choose Host to run your own agent here. Choose Client if you already have a Host elsewhere. Do not erase a working setup during troubleshooting.

## Host, step 1: prepare Windows

Connect to the internet, finish Windows' first-run setup, and complete any already-pending restart. Keep the laptop plugged in during installation. Our app should detect what is installed and explain the next required step.

The current app integration uses OpenClaw in WSL. WSL is Windows' way of running a small Linux environment in the background. The setup screen lists installed Linux environments rather than assuming that everyone already has Ubuntu.

OpenClaw also has a Windows Hub companion that can provision its own WSL environment. Its native and Hub routes need separate compatibility testing with our app before we offer them as supported alternatives. [Official Windows guide](https://docs.openclaw.ai/platforms/windows)

## Host, step 2: prepare the Linux environment

1. Choose **Host** in the Foxsocket installer. Its setup window checks for existing Linux environments and prepares Windows if needed. If Foxsocket is already installed, choose **Set up Ubuntu** on the Host page.
2. Approve the Windows permission prompt. Keep the PC online and plugged in while components download.
3. If setup offers **Restart Windows**, save your work first. Setup reopens after you sign back into the same Windows account; it does not restart without your confirmation.
4. Setup downloads Ubuntu 24.04, creates a regular `foxsocket` Linux account, enables its service manager, and verifies both. No terminal commands or Linux password prompt are needed. This app-managed account has no password or blanket sudo access.
5. Choose **Open Foxsocket**, then **Prepare Host**. Existing Linux installations are preserved and can be selected in the app.

**Checkpoint:** setup reports **Ubuntu is ready**. This verifies Linux, not an AI provider or agent reply. If an operation fails, the same window displays diagnostics and **Try again**. If firmware virtualization is disabled, it must be enabled in the PC's firmware before Windows can run WSL2. **Continue later** retains progress and unfinished setup reopens at next sign-in. No existing distribution is removed and WSL is never shut down globally.

## Host, step 3: install OpenClaw

Inside the Ubuntu window, use the installer linked by OpenClaw's official guide:

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

This downloads and runs OpenClaw's installation script. It can install a supported Node runtime and OpenClaw and start onboarding. Do not paste this command into the Windows PowerShell tab. If a Linux administrator password is requested, enter the password you chose in Ubuntu.

**Checkpoint:** the installer finishes and onboarding appears, or `openclaw --version` displays a version. A download failure is not a reason to change agent settings; check the connection and the reported installer error first. [Official installation guide](https://docs.openclaw.ai/install)

## Host, step 4: connect your AI access

If onboarding did not start, type `openclaw onboard` inside Ubuntu. For our guided Host trial, use **Custom setup** when offered so the person can choose the agent name and access level. Prompts vary by installed version; record that version in the test notes.

1. Choose the provider or existing supported account connection you intend to use. The app must explain the choice and let you change it.
2. Complete sign-in on the provider's own page, or enter an API key in OpenClaw's private credential prompt when that is the chosen method. Never put passwords, keys, or sign-in codes in the app's support chat or diagnostic report.
3. Review the provider's access and payment requirements before agreeing. A subscription to a chat app does not automatically establish that this particular connection is supported.
4. Let onboarding verify the selected connection. If verification fails, stay on this step. Retry after correcting the reported account issue, choose another supported connection, or pause setup.

**Checkpoint:** the selected connection passes its test. Installing OpenClaw alone does not complete this step. Current OpenClaw guidance distinguishes the Quick start defaults from Custom setup's name and access choices. [Onboarding guide](https://docs.openclaw.ai/start/wizard)

## Host, step 5: name the agent and choose access

Choose a name you like. Sparky is the current owner's agent; it is not a required public product name. The product name, device name, and agent name are separate.

Review which folders or tools the agent may use. For the first test, grant only the access needed for conversation and the task being tested. Add other integrations later. Discord, lighting, web-search credentials, and extra skills are not required just to receive the first reply. An app display name is not proof that OpenClaw's agent configuration has been changed; verify the chosen agent in OpenClaw.

## Host, step 6: verify background operation

If onboarding has left a foreground Gateway running in the Ubuntu terminal, press **Ctrl+C** once to stop that foreground instance after setup finishes. Then install the managed background service:

```bash
openclaw gateway install
```

Check the result with:

```bash
openclaw gateway status --json
```

If the service is installed but stopped, use `openclaw gateway start`, then check again. If service installation reports a systemd problem, preserve the message and follow the Windows/WSL guide with assistance. Do not overwrite Linux configuration blindly.

**Checkpoint:** the managed Gateway is reachable after closing the terminal. After a Windows restart, test again. A successful check before reboot does not prove that the WSL boot chain is configured. The app window's close behavior and the Host's background-service behavior are separate. [Windows background setup](https://docs.openclaw.ai/platforms/windows) · [Gateway commands](https://docs.openclaw.ai/cli/gateway)

## Host, step 7: receive a real reply

OpenClaw's dashboard can be reopened with `openclaw dashboard` inside Ubuntu. Send a short message such as “Reply with hello.” Confirm an actual reply, then test a separate message through our app after selecting the detected environment and agent in Connection setup.

**Checkpoint:** the correct agent replies through our app, the conversation remains after closing and reopening it, and the app remains usable when the Host is offline. A healthy Gateway by itself is not a completed conversation test.

## Client: connect to your Host

The following is a future flow, not a supported test path in 0.6.0-alpha.1. Private app pairing is not implemented.

1. Install and open our app; choose **Client** and give this device a recognizable name.
2. If Tailscale is missing, use the official Windows installer linked by the app. Complete its installation and any Windows permission prompt.
3. Open Tailscale and sign in to the same private network as your Host, or accept the owner's invitation to that network. Do not exchange account passwords.
4. Confirm that Tailscale is connected on both devices. Being on the same network alone does not authorize access to the agent.
5. In our app, request pairing with the intended Host. On that Host, approve the exact device and requested access. Expired or rejected requests should return to a retryable step.
6. Select an available agent and send a message. If the Host is asleep, the app should explain that and retain your draft.

[Official Tailscale Windows instructions](https://tailscale.com/docs/install/windows)

## When something goes wrong

Record the current step, app/OpenClaw versions, the error code or a redacted description, and whether a restart happened. Keep credentials and private network details out of the report. The app should retain the current step and offer one specific next action. Do not display “ready” until the relevant live checks pass.

Assistance should be one step at a time: say what to click, describe what should appear, confirm the checkpoint, and only then proceed. If the screen differs from this guide, use the exact installed version and official documentation to resolve the difference.
