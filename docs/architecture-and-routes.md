# Architecture and routes

Scope: public source at main commit `728227a`, reviewed 2026-09-21. This describes product code, not a maintainer's installed machine. The published Windows prerelease is separately versioned; consult its release notes. Open PRs are not installed functionality.

## Components

| Component | Source | Responsibility |
|---|---|---|
| Electron main process | [main.js](../main.js) | Window lifecycle, persistent workspace state, privileged IPC and chat invocation |
| Renderer bridge | [preload.js](../preload.js) | Exposes the permitted IPC interface |
| Workspace | [workspace.js](../workspace.js), [workspace-main.js](../workspace-main.js) | Conversation workspace and local actions |
| Host management | [host-manager.js](../host-manager.js), [host-main.js](../host-main.js) | WSL inspection and supported preparation operations |
| Setup | [setup.js](../setup.js), [starter-agent.json](../starter-agent.json) | Local setup record and clean starter manifest |
| Release checks | [updates.js](../updates.js), [updates-main.js](../updates-main.js) | GitHub release discovery; does not install updates |
| Optional lighting | [lighting.js](../lighting.js) | Local OpenRGB integration; hardware support must be checked per device |
| Harness | [foxsocket-agent.cjs](../foxsocket-agent.cjs), [foxsocket-llm.cjs](../foxsocket-llm.cjs), [foxsocket-providers.cjs](../foxsocket-providers.cjs) | Persona, persistent working-memory graph, provider-agnostic model calls. Called in-process by `main.js` today; see [Gateway daemon](gateway-daemon.md) for the standalone-daemon work in progress |

The desktop renderer is not a public web or remote-control API. Local IPC handlers are implementation interfaces, not network routes. Read the source modules for their current argument contracts rather than using a historical route inventory.

## Agent conversation

As of `728227a`, desktop chat no longer invokes OpenClaw or WSL. `main.js`'s `chat` IPC handler calls `foxsocket-llm.cjs` directly, in-process, against whichever provider is active in `foxsocket-providers.cjs` (a local Ollama model, or a user-supplied ChatGPT/Claude/Grok key). `foxsocket-agent.cjs` supplies the persona (`agent/TYPE.md`, `IDENTITY.md`, `SOUL.md`, `USER.md`, `HEARTBEAT.md`) and the persistent working-memory graph (`agent/GRAPH.json`); the model is expected to emit a `:::foxsocket-graph:::` fence when something should persist, which the harness parses back into the graph.

This in-process harness is being pulled out into a standalone daemon (`foxsocket-gateway.cjs`) so it runs independent of the Electron window and is reachable by more than one client over HTTP. See [Gateway daemon](gateway-daemon.md) for what's implemented and what isn't yet.

The paragraphs below (OpenClaw CLI arguments, Discord session identity, WSL tool discovery) describe the Host-management surface — preparing and monitoring an OpenClaw gateway inside WSL as an optional agent backend — not the desktop chat path itself. See [Host status](managed-host.md) and [fresh-PC setup](fresh-pc-setup.md) for that surface's implemented boundaries. A clean starter manifest does not provision a working model or copy an owner's personal assistant.

## Local data and lifecycle

Workspace state is saved as `state.json` in Electron's `userData` directory. The existing package/profile identity is retained for compatibility. A source checkout, an installed payload and a user profile are distinct; never overwrite a user's profile while replacing code.

The source refuses to replace unreadable saved state with empty defaults. Backup export exists; confirm the specific release's import/recovery capabilities before relying on them. A chat timeout does not prove upstream work was cancelled, so do not blindly resubmit consequential actions.

Host service startup and application startup are separate. Configuring a task or observing a running service is not proof of cold-boot recovery. Optional lighting needs a separate compatible local OpenRGB server and must not be treated as a prerequisite for conversation.

## Documentation boundary

Keep actual machine inventories, network names, account/session IDs, personal incidents, startup entries, runtime credentials and local deployment paths in private operating records. Public docs describe reproducible product behavior and explicitly scoped test evidence. Historical personal-machine notes have been removed from this page; they are not current product requirements.
