# Applied AI Command Center
## Application, routes, hardware and operations handoff

Version 0.2.0 · Prepared September 9, 2026

This document describes the application and supporting configuration created in this task. It separates implemented routes from planned features and records the unresolved Sparky issue. It supersedes earlier design-only descriptions and outdated sections in the project README.

## 1. What was created

An installed Windows Electron application branded with the supplied Applied AI Solutions artwork, SVG icons and dark navy/cyan design. It provides a personal dashboard, Sparky conversation, local tasks and notes, focus timer, PC telemetry, folder shortcuts, lighting controls and desktop preferences.

The visible application runs on Windows. Sparky uses the existing OpenClaw environment in Ubuntu-24.04 under WSL2. OpenRGB runs separately on Windows without a GUI to reach the motherboard and RAM lighting hardware. Closing the command-center window normally hides it in the tray; quitting the app does not stop OpenRGB or the existing Sparky services.

This is a working local preview, not a finished commercial release.

## 2. Architecture and communication map

```text
User
  |
  +-- Applied AI Command Center window (Windows Electron renderer)
  |      |
  |      +-- window.desktop.invoke(name, argument)
  |             |
  |             +-- Preload allowlist --> Electron main process
  |                    |
  |                    +-- JSON state file: tasks, notes, chat, preferences
  |                    +-- Windows/Node telemetry + nvidia-smi + Event Log
  |                    +-- Native folder/backup dialogs --> Windows Explorer
  |                    +-- WSL command --> OpenClaw main agent --> configured model/tools
  |                    |                     |
  |                    |                     +-- dedicated command-center conversation
  |                    +-- OpenRGB SDK TCP 127.0.0.1:6742
  |                                          |
  |                                          +-- RAM controller 1
  |                                          +-- RAM controller 2
  |                                          +-- motherboard --> fan LED headers
  |
  +-- Discord --> existing OpenClaw Discord integration
                         |
                         +-- same main agent, separate Discord conversation
```

The UI has no HTTP server or browser URL router. All seven pages are rendered inside one local `index.html`. Page names below are navigation identifiers, not web endpoints. The app does not currently provide a REST API for other applications or a mobile/web interface.

## 3. User-facing navigation routes

| Navigation ID | Screen | Implemented behavior |
|---|---|---|
| Home | Your command center | Branded header, priorities, notes, 25-minute timer, metrics, modes and activity |
| Sparky | Talk to Sparky | Send text through existing OpenClaw; show completed replies and local transcript |
| Tasks | Make room for what matters | Add, complete and delete tasks; persistent storage |
| Devices | Devices & Lighting | Discover OpenRGB controllers; select devices; set static color/brightness; restore previous lighting; enable mode sync |
| Files | Your working folders | Choose local folders and reopen them in Explorer |
| System | Inside your PC | CPU/GPU/memory/storage/uptime and recent restart events |
| Settings | Make it yours | Sign-in startup toggle, close-to-tray option, backup export |

The tray menu has Open Command Center, Focus, Gaming, Relax, Away and Quit Command Center. The single-instance lock brings the existing window forward on a second launch.

## 4. Complete internal IPC route inventory

Renderer calls go through the allowlisted `window.desktop.invoke` interface in `preload.js`. The handlers live in `main.js`. These are local IPC messages, not network endpoints.

| Route | Input | Destination and outcome |
|---|---|---|
| state | None | Returns saved state plus startup and current chat-busy status |
| save | notes, tasks, timer and/or closeToTray | Updates allowed fields and writes state.json |
| mode | Focus / Gaming / Relax / Away | Saves workspace mode; optionally applies mapped lighting; emits updated state |
| startup | Boolean | Calls Electron login-item settings for this executable |
| folder | None | Opens native folder chooser; stores up to 12 selected folders |
| open-folder | Previously selected folder path | Validates membership then opens it through Windows shell |
| export | None | Opens Save dialog and exports workspace state as JSON |
| gateway | None | Runs OpenClaw health --json inside Ubuntu; returns health and Discord lifecycle |
| chat | Nonempty text, maximum 12,000 characters | Runs a turn on the existing main agent using the app session key; stores user/reply/error entries |
| metrics | None | Reads Node OS counters, C: filesystem statistics and NVIDIA CLI telemetry |
| events | None | Queries Windows System events 41, 1074 and 6008 from the last seven days, maximum 10 |
| lighting | None | Connects to OpenRGB, enumerates controllers, returns settings and restore availability |
| lighting-apply | keys[], color #RRGGBB, brightness 0–100, sync | Snapshots prior lighting, applies static colors to selected controllers and reads back state |
| lighting-sync | Boolean | Saves whether workspace modes should drive selected devices |
| lighting-restore | None | Restores saved controller colors/modes; returns per-device confirmation |

Main-to-renderer event: `state`, emitted after a mode change. The renderer subscribes through `window.desktop.onState`.

Task limits: maximum 500 entries, each text truncated to 500 characters. Notes are limited to 50,000 characters. Activity history is capped at 80 entries. Chat currently has no retention cap. The timer saves an absolute completion time; it does not run an independent scheduler when the app is fully stopped.

## 5. Sparky and Discord routes

### Command-center conversation

```text
Sparky screen -> IPC chat -> Windows execFile(wsl.exe, argument array)
 -> Ubuntu-24.04 -> openclaw agent --agent main
    --session-key <saved app key> --message <user text>
    --json --timeout 180
 -> existing OpenClaw gateway/agent -> configured model and tools
 -> JSON result.payloads[].text -> app transcript
```

The outer process timeout is 200 seconds. Only one app-originated chat request is allowed at a time. This lock does not serialize Discord traffic. Replies are returned as completed text; token streaming and attachments are not implemented. The app does not pass `--deliver`, so it does not explicitly instruct OpenClaw to deliver its reply to Discord. The agent still retains its independently configured tools and their permissions.

Observed app session key:
`agent:main:command-center-<saved-uuid>`

A UUID-based key is created once if none exists and then saved in local state. It is not regenerated for every message.

### Discord conversation

The existing OpenClaw Discord integration routes the user's DM to:
`agent:main:discord:direct:<user-id>`

Both observed conversations use agent `main` and model `ollama/qwen3.5:9b`. They have different session IDs and different conversation histories. Shared identity/configuration does not mean every message or memory from one conversation is automatically present in the other. Discord history is not displayed or synchronized into this app.

### Unresolved issue

The user reported a conflict between Discord and the command center. The local app transcript shows that an email-summary request received a reply claiming `outlook_mail` was unavailable. A read-only configuration check found `outlook_mail` explicitly listed in `tools.alsoAllow`. Therefore, that assistant response is not sufficient evidence that the integration lacks permissions.

Gateway logs include warnings about the minimal tool profile and exec/process access. Those warnings do not establish the cause of the Outlook issue. A recent Discord trajectory also showed a model error. No routing, permission, model or session-history changes were made during that investigation. The root cause remains unresolved. Do not describe the two routes as proven to have equal effective tool access.

## 6. Network and service routes

| Endpoint | Purpose | Current evidence |
|---|---|---|
| TCP 127.0.0.1:6742 | OpenRGB SDK | Active listener; app uses this exact address |
| 127.0.0.1:18789 and [::1]:18789 | Existing gateway listener | Observed Windows listeners; app reaches gateway through OpenClaw CLI rather than hardcoding this port |
| 127.0.0.1:11434 | Ollama listener | Observed Windows listener; exact upstream URL selected by OpenClaw was not audited in this document |
| HTTP 127.0.0.1:16038/api/v1/lighting | Earlier SignalRGB feasibility check | Returned 403; replaced by OpenRGB in app version 0.2.0; no active listener observed in latest check |

No internet-facing command-center listener was created. The broader pre-existing gateway/Tailscale network configuration was not comprehensively audited. The renderer's Content Security Policy disallows direct network connections; privileged operations occur in the main process.

## 7. Hardware routes and lighting behavior

| Device | Route | Verified configuration |
|---|---|---|
| RAM 1 | OpenRGB -> ENE DRAM -> SMBus 0x71 | 8 LEDs |
| RAM 2 | OpenRGB -> ENE DRAM -> SMBus 0x73 | 8 LEDs |
| Motherboard | OpenRGB -> B650 UD AX-Y1 -> USB 048D:5702 | 126 configured LEDs total after header setup |
| Case fan lighting | Motherboard D_LED1 / D_LED2 | 60 configured LEDs each, copied from prior SignalRGB logs; user confirmed cyan fan response |
| Other board zones | Same motherboard controller | Six one-LED zones exposed by OpenRGB |
| Skytech mouse | No supported route established | Label tentatively M-1200N; not detected by OpenRGB/SignalRGB |
| Skytech K-1000 keyboard | No supported route established | No software lighting integration established |

The 60-LED lengths are inherited configuration values, not physically counted LEDs. Fans are represented through motherboard headers, not independently discovered fan objects. The app controls lighting only: fan RPM, cooling curves, voltages, GPU clocks and BIOS settings are not changed.

Lighting operations are serialized within the app. Device keys combine name, location and serial rather than relying on index alone. Each operation reconnects and enumerates controllers, with an eight-second timeout. Selected devices must expose Static mode and configured LEDs.

Brightness scales RGB channel values. Before applying, the app saves prior colors and mode. Readback checks the reported mode and colors; this confirms OpenRGB software state, not light output measured by a sensor. Restore verifies reported mode, not a full physical color comparison.

| Workspace mode | Applied color when sync enabled |
|---|---|
| Focus | #00c9f4 |
| Gaming | #b58bff |
| Relax | #56dfbc |
| Away | #000000 (selected LEDs off) |

Mode sync is opt-in. A failed lighting operation is recorded without blocking the workspace-mode change. No automatic mode application occurs merely from opening the app.

Saved OpenRGB profile: `Applied AI - Verified Hardware.orp`. This startup profile is a snapshot; future app changes do not automatically rewrite it.

## 8. Startup and background operation

Configured behavior is at Windows user sign-in, not before login.

| Entry | How it starts | Visibility |
|---|---|---|
| Applied AI Command Center | HKCU Run entry | Visible app window |
| Applied AI Lighting Bridge | Scheduled task at logon, highest privileges | OpenRGB --server, no GUI, loopback-only SDK |
| Ollama Background | Startup shortcut -> wscript -> ollama.exe serve | Hidden server |
| Sparky Gateway Discord Bot | Pre-existing task using Start-DiscordBot.vbs | Existing hidden launcher retained |
| Sparky OpenClaw Node Keepalive | Pre-existing task using Start-OpenClawNodeHidden.vbs | Existing hidden launcher retained |
| SignalRGB | Prior Run entry backed up and removed | No automatic launch from that entry |

OpenRGB command:
`OpenRGB.exe --server --server-host 127.0.0.1 --server-port 6742 --profile "Applied AI - Verified Hardware"`

The lighting task ignores duplicate task instances, has no execution time limit, permits battery operation and retries failures up to three times at one-minute intervals. The manually started lighting process can run while the scheduled task reports Ready; that is not itself a failure.

The full startup experience has not been tested through a reboot. Other pre-existing startup apps were not comprehensively disabled or tested. A separate custom HKCU Run name was used for the command center; its interaction with Electron's Settings startup toggle needs validation to avoid duplicate registration or misleading toggle state.

## 9. Files and data locations

Windows paths below use this user's installation.

| Item | Location |
|---|---|
| Source project | %USERPROFILE%\Documents\Codex\2026-09-09\wh\outputs\command-center |
| Installed app | %USERPROFILE%\AppData\Local\Programs\Applied AI Command Center\Applied AI Command Center.exe |
| Current installer | Source project\release\Applied AI Command Center Setup 0.2.0.exe |
| Local app state | %USERPROFILE%\AppData\Roaming\applied-ai-command-center\state.json |
| OpenRGB runtime | %USERPROFILE%\AppData\Local\AppliedAI\OpenRGB |
| OpenRGB profile | %USERPROFILE%\AppData\Roaming\OpenRGB\Applied AI - Verified Hardware.orp |
| Startup backups | %USERPROFILE%\AppData\Local\AppliedAI\startup-backup |
| Hidden Ollama launcher | %USERPROFILE%\AppData\Local\AppliedAI\start-ollama-hidden.vbs |
| Existing Linux OpenClaw config | /home/<gateway-user>/.openclaw/openclaw.json |
| Existing Sparky workspace | /home/<gateway-user>/workspace |

Source roles: main.js owns IPC, persistence, native commands and lifecycle; preload.js exposes the restricted bridge; app.js renders screens and handles interaction; lighting.js implements OpenRGB operations; style.css and assets define appearance; package.json and pnpm-lock.yaml define packaging/dependencies. The PowerShell startup helpers are operational artifacts, not bundled application routes.

Local state uses temporary-file write followed by rename. It contains personal notes, chat text, selected paths, mode, timer and lighting snapshots. It is not encrypted by this application. Provider credentials are not copied into the app. Backup exports contain personal content and should be handled accordingly.

## 10. Validation and remaining work

Verified: installation and launch; navigation smoke tests; task write/read; real PC metrics; Sparky greeting round trip; OpenRGB discovery; lighting apply/readback/restore; user-observed RAM and fan lighting; hidden OpenRGB connectivity; saved profile presence; startup task/registry configuration.

Not yet verified or implemented: full reboot recovery, equal Sparky tool availability across channels, shared conversation history, fan-by-fan mapping, mouse/keyboard lighting, automatic startup-profile updates, streaming chat, rich task editing, recurring tasks, gateway file upload, backup import, signed distribution and automatic app updates.

Additional implementation concerns from current source: malformed state falls back to empty defaults; no import/recovery UI exists. Chat timeout does not cancel guaranteed upstream work. Some UI copy still mentions zero-length fan zones despite subsequent configuration. Startup registration should be consolidated. None of these were silently changed while preparing this document.

The next engineering priority is diagnosing the reported Sparky/Discord conflict from actual tool traces and clarifying whether the desired product behavior is separate conversations with shared long-term memory or one synchronized conversation.

## 11. Reference material

- Electron context isolation: https://www.electronjs.org/docs/latest/tutorial/context-isolation
- Electron IPC: https://www.electronjs.org/docs/latest/tutorial/ipc
- OpenRGB SDK: https://openrgb.org/sdk.html
- OpenRGB LED zone sizing: https://openrgb.org/resize.html
- Node OpenRGB client: https://github.com/Mola19/openrgb-sdk
- SignalRGB API (previous approach): https://docs.signalrgb.com/developer/signalrgb-api/introduction/

Primary evidence for this handoff is the current source, Windows startup entries/listeners, local OpenClaw diagnostics and the user's physical lighting confirmation. No passwords, API keys or bot tokens are included.


Fan lighting fix (0.4.1): B650 UD AX-Y1 uses Direct mode; Static reported successful writes but left fan lights dark. User confirmed Direct restored the lights. RAM retains Static mode. The verified OpenRGB startup profile was saved with Direct mode. Reboot recovery remains unverified.
