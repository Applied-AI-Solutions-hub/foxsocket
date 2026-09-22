# Gateway daemon

Scope: public source at main commit `728227a` plus the standalone-gateway work described below, not yet merged. This describes source and sandboxed-Linux test results, not a Windows install. Do not treat this page as a finished feature until the "Not complete" section is empty and each item has passed on an actual Windows PC.

## Direction

The harness (persona + persistent working-memory graph + provider-agnostic model calls, currently `foxsocket-agent.cjs` / `foxsocket-llm.cjs` / `foxsocket-providers.cjs`) is the base of Foxsocket: one process, on the PC, running independent of any window. Electron's UI, `web/`'s device check-ins (Kit, Nox), and any future client are addons that talk to that one process over its HTTP API. They are not separate implementations of it.

This mirrors how OpenClaw's own gateway is treated elsewhere in this repo (see [Host status](managed-host.md)): a background service that outlives the app window, with an explicit rule against two copies of it fighting over the same resource, and reachability tracked as a separate concern from whether a model actually answers.

## Implemented

- `foxsocket-gateway.cjs`: a dependency-free Node `http` server exposing `GET /health`, `POST /chat`, `GET/POST /providers`, `POST /providers/test`. No Electron or Next dependency; runs with plain `node`.
- Canonical data directory: `%APPDATA%\Foxsocket` on Windows (falls back to `FOXSOCKET_DATA_DIR` or `~/.foxsocket` elsewhere), matching Electron's existing `userData` path for this app (`productName: "Foxsocket"`) so an existing install's `agent/` graph and `foxsocket-providers.json` are picked up without migration.
- Bearer-token auth (`gateway-token`, generated on first run, timing-safe compare) required on every route except `/health`. `/health` stays open as a liveness ping; it returns no key material.
- Single-instance backoff: on startup, probes its own port before binding; if another Foxsocket gateway is already answering, it logs and exits `0` instead of crash-looping on `EADDRINUSE`. Mirrors the "never fight an unidentified foreground gateway" rule `host-manager.js` already applies to OpenClaw.
- Best-effort file logging (`gateway.log` in the data directory) for startup, shutdown, auth rejections, and failed completions. Deliberately never logs request/response bodies — `/providers` carries raw API keys and `/chat` carries actual household conversation.
- Single-flight lock on `/chat` (409 while one request is in flight), same semantics as the existing Electron `busy` guard.
- Test suite: `gateway.test.cjs`, 10 cases (`npm run test:gateway`), covering auth, the token file, the graph-patch-fence persistence path, the 409 lock, log content (and that it excludes message bodies), and `probeExisting` against a real running server.
- Manually verified live in a Linux sandbox: started detached, hit every route over real HTTP, confirmed 401 with no/wrong token and 200 with the generated token, confirmed a genuinely unreachable local model returns 502 (not a crash), confirmed a keyless cloud provider returns the same user-facing message main.js already shows (`Add your Claude API key in Foxsocket settings.`), and started a second instance against the same port to confirm it backs off instead of crashing.

## Not complete

- **Windows Scheduled Task** to launch the gateway at logon so it survives reboot without Electron running. `host-startup.ps1` is not a template for this as-is — it exists to wake a WSL distro and start systemd inside it, which this daemon doesn't need; a native-process launch task will be simpler, but it hasn't been written or tested on Windows.
- **`main.js` is not repointed at the gateway.** Its `chat`, `providers-get`, `providers-save`, `providers-test`, and `gateway` IPC handlers still call `foxsocket-llm.cjs` / `foxsocket-providers.cjs` / `foxsocket-agent.cjs` in-process, exactly as landed in `728227a`. Until this changes, Electron and the standalone gateway are two independent processes with two independent copies of the harness state, even though they resolve to the same data directory — running both at once risks concurrent writes to the same `GRAPH.json`.
- **`web/`'s "host" device is not repointed at the gateway either.** `web/lib/device-chat.js` still runs its own copy of `foxsocket-agent.cjs` against `web/data/`, a directory the gateway never touches. Kit and Nox's check-ins currently land nowhere the gateway (or Electron) can see.
- **No supervisor/restart policy for the daemon itself** beyond "don't start a duplicate." If the process crashes for a reason other than a port conflict, nothing currently restarts it.
- **No test has run on Windows.** Everything in "Implemented" was verified on Linux; `%APPDATA%` resolution, file permissions (`0o600` on a token file), and the eventual Scheduled Task are Windows-specific and unverified.
- **The single-instance check has a race window.** Two processes starting within the same ~800ms could both probe, both see nothing, and both try to bind. Only one will win; the other logs a bind error and exits — it won't corrupt anything, but it also isn't the same guarantee as an exclusive lock file. Acceptable for "Electron and a boot-time task rarely start in the same second," not for a supervisor that retries aggressively.
- **`/health` is unauthenticated by design and returns the full data-directory path.** Harmless on localhost; worth trimming (or gating behind the token) before this is ever reachable beyond loopback, e.g. once FoxPocket or another device reaches it over Tailscale.

## Validation

`npm run test:gateway` (10 tests). Also run `npm run test:setup`, `npm run test:updates`, `npm run test:host` — none of them touch the gateway file, and all still pass, which only confirms this addition didn't regress the existing harness/host logic, not that the gateway itself works end to end on Windows.

Before this is "finished": smoke-test the daemon on an actual Windows PC (start it, confirm `%APPDATA%\Foxsocket` is used, confirm the token file and log land there, confirm a real Ollama/cloud reply round-trips), then do the `main.js` and `web/` rewiring above, then re-verify all of it together — not just the pieces in isolation.
