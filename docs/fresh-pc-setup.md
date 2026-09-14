# Set up a Foxsocket Host

This alpha supports local Windows Hosts with an existing WSL Linux environment. Client pairing and the integrated provider-account wizard are not available yet.

1. Complete Windows setup and pending restarts. Install WSL and finish creating a regular Linux user if the readiness check reports them missing. Linux must use systemd.
2. Choose Host in Foxsocket, select the detected distribution, and check its status.
3. Choose Prepare Host. Foxsocket first checks the environment. Only confirmed absence of OpenClaw permits download. The bootstrap script is hash-verified before execution; a mismatch stops setup. Downstream package verification is not covered by that bootstrap hash.
4. If account configuration is required, use OpenClaw's onboarding in that distribution. The managed CLI is at `$HOME/.local/share/agent-workspace/openclaw/bin/openclaw`; an existing installation may instead be on PATH. Run the appropriate CLI with `onboard`. Provider credentials belong in OpenClaw, not Foxsocket chat or diagnostics.
5. Return to Prepare Host. It installs/enables the user gateway service, enables Linux user lingering if needed, and registers a limited-privilege Windows sign-in task. The task keeps the selected Host available independently of the app window.
6. Select your configured agent and send a test message. A responding gateway alone does not prove that your model works.

## Background behavior and removal limitation

Closing Foxsocket does not stop the independent Host. The current desktop uninstaller does not remove the Host's Windows sign-in task, Linux service, runtime, or user data. Automatic Host removal is unfinished; inspect the exact task and distribution before manual removal. Do not delete unrelated tasks or agent data.

## Recovery

If inspection times out or fails, wait for Linux to finish starting and retry. Foxsocket must not replace an existing runtime merely because a probe fails. Do not repeatedly reinstall to resolve provider-account errors.

Find the app version at the bottom of Settings. Include that version and a redacted error description in a bug report; never share keys, conversations, raw settings, or private paths.
