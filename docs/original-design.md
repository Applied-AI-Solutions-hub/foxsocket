# Applied AI Command Center — first-release design

Status: design proposal, September 9, 2026. No application installation or implementation authorized.

## Purpose
An installed Windows application that joins daily priorities, PC status, device lighting and background work. It must operate independently of Codex and provide a reusable foundation for Applied AI Solutions.

## Evidence and unresolved capability checks
Read-only Windows inventory identifies a Gigabyte B650 UD AX-Y1 board, Ryzen 7 7800X3D, NVIDIA RTX 5060 Ti and approximately 32 GB RAM. RGB Fusion 3.24.1202.1, SignalRGB 2.5.77 and Tailscale 1.102.3 are installed. WSL lists Ubuntu-24.04; listing alone does not establish its version, health, running state or gateway configuration. Mouse reports HID VID_1BCF/PID_08A0; retail model and lighting support remain unknown. LED controllers, zones and current controlling application remain unverified.

SignalRGB documents a local API, with most endpoints requiring Pro. Installed-version support, entitlement and device capabilities must be verified before choosing this adapter. Do not promise mouse lighting, battery telemetry or remapping based solely on HID detection.
Source: https://docs.signalrgb.com/developer/signalrgb-api/introduction/
WSL supports systemd service management, but startup, sleep recovery and gateway availability require separate validation.
Source: https://learn.microsoft.com/en-us/windows/wsl/systemd

## Visual specification
Use the supplied dashboard image for layout and the architectural brand image for atmosphere. Reuse supplied SVG assets, preserve canonical A geometry, use v0.2 palette as proposed baseline and retain v0.1 app icon exports after visual inspection. Palette: background #0A0F1A, surfaces #0F172A, primary #0084FF, cyan #00E5F6, secondary text #94A3B8, green #00D98B, amber #FFB020. Confirm contrast before finalizing. Avoid artwork behind dense text. Reserve glows for selection and small accents. Every icon gets a label or accessible name; statuses use text as well as color. Support keyboard navigation, reduced motion, display scaling and a compact window layout.

## Home screen
Left navigation: Home, Devices & Lighting, Tasks, Files, System, Integrations, Settings. Agents & Sessions appears when configured.
Top: compact logo, command/search field, notifications, user menu. Search initially covers local tasks and app commands; natural-language execution is a later capability.
Main: Today with three priorities, quick note and focus timer; active mode with editable actions; PC snapshot; recent meaningful activity.
Right: service health with last check time, selected devices and pending actions.
Bottom or tray: persistent mode selector and gateway state. Small branded welcome artwork may collapse after onboarding. No fabricated agent counts or percentage progress.

## Core behavior
Tasks: create, edit, complete, reorder and persist locally; optional due dates and timer. Restore state after restart.
PC status: CPU/GPU load, memory, storage and uptime when a verified data provider exists. Temperatures are optional capabilities. Timestamp readings and show stale/unavailable explicitly. Event history distinguishes planned restart from unexplained interruption.
Devices: identify model, connection, controller, supported actions and last result. Show unsupported controls disabled with explanation. Assign one lighting owner per device; never silently change ownership.
Modes: Focus, Gaming, Relax, Away are editable presets. Each lists desired lighting, timer and dashboard actions. Preview and apply deliberately; record results per action. Partial failure is visible. Manual device override remains until the next explicit mode change, unless user chooses another policy. Undo restores known prior reversible settings; task completion and external actions are not implicitly reversed.
Files: only user-selected folders; open, browse and show outputs. Gateway transfers show destination, progress and failure. No broad automatic indexing.
Agents: separate optional integration; show real job state and evidence. External communications and consequential actions use explicit scope/approval. No credentials embedded in task records or exports.

## Desktop and gateway architecture
Desktop interface owns interaction and presentation. A Windows companion owns permitted telemetry and device adapters. A separate optional gateway owns queued jobs, schedules and integrations; it may run in the existing Ubuntu environment after validation. Personal tasks, settings and PC status remain usable if gateway is unavailable.
Use typed, versioned messages between components and a capability registry rather than hardware-specific conditions scattered through screens. Keep personal configuration separate from reusable application code. Store local tasks, modes and activity in a versioned database with migration and backup strategy; use OS credential storage for secrets.
Default communications are local and authenticated. Remote access is opt-in; installed Tailscale is not evidence that access is configured. Gateway must not expose arbitrary shell execution as an unrestricted dashboard command.
Desktop framework and gateway language remain open until a small implementation feasibility evaluation is authorized. Linux is optional, not a prerequisite for everyday controls.

## Lifecycle
Close window: minimize to tray when enabled, with first-use explanation. Tray: Open, modes, pause automations, status, Quit. Distinguish quitting the UI from stopping background work. Startup with Windows is opt-in and documented as sign-in startup for initial scope. Before-sign-in hosting is a separate requirement. PC sleep or power-off means local gateway is unavailable; do not promise 24/7 availability.
After restart: restore tasks and UI state, reconnect with bounded retry, mark interrupted jobs, and avoid replaying non-idempotent actions. Resume missed schedules using an explicit per-rule skip/run-once policy. Never reset mouse or lighting settings merely because UI reopens.

## Implementation sequence, after authorization
1. Asset audit, screen specification and interactive design prototype with clearly labeled sample data.
2. Installed desktop shell, local task persistence, tray controls and verified basic telemetry.
3. One verified lighting adapter and one actual device; confirm entitlement and absence of controller conflict.
4. Modes across supported devices, partial failure handling and override behavior.
5. Optional gateway connection in validated Ubuntu environment, files and one bounded job integration.
6. Installer/update work, recovery tests, backup/export and product documentation.
Each increment must remain usable independently. Broader device adapters and multi-PC support follow measured demand.

## Acceptance criteria for eventual implementation
- Brand assets remain crisp at supported scaling and controls work by keyboard.
- Tasks survive application and Windows restart.
- Metrics match trusted providers within documented tolerance; disconnected feeds never appear current.
- Lighting commands affect only chosen supported devices and report actual outcomes.
- Unsupported mouse features remain unavailable without misleading controls.
- Modes report partial failures and respect manual override.
- Tray, sign-in startup, quit and sleep recovery follow documented behavior.
- Gateway outage does not block local tasks or PC status; interrupted actions do not execute twice.
- Installer supports clean upgrade and uninstall with explicit data retention choice.
- Idle CPU/memory budget is measured and agreed before release; no continuously busy polling.

## Product path
Keep adapters, branding tokens and personal settings separate. Maintain versioned source, documented device support and licenses for dependencies/assets. Before public distribution, add signed packaging, update verification, broader hardware testing, onboarding, diagnostic export with redaction and support documentation. Preserve local operation and make cloud/AI accounts optional integrations.

## Decisions needed
Current lighting application and controlled zones; mouse retail model; desired first three daily actions; gateway purpose (agents, remote access, automation or files); whether availability beyond Windows sign-in is required. These do not block screen planning, but they block a verified device integration commitment.

## Device clarification and runtime evidence
User identifies the mouse as Skytech Gaming and confirms a keyboard should be included. Exact mouse and keyboard models, keyboard brand, and software-controlled lighting capabilities remain unverified. Include separate keyboard and mouse cards with capability-based lighting, connection and profile controls; do not assume macros, remapping or battery readings exist. Model labels may be entered manually when Windows exposes only generic HID descriptions.
Read-only process check found SignalRgb, SignalRgbLauncher and SignalRgbService running. This does not prove device ownership or Pro entitlement. WSL verbose inventory confirms Ubuntu-24.04 is Running with VERSION 2; no distribution was started or configured by this check.
Next compatibility evidence: whether mouse and keyboard appear individually in SignalRGB Devices, and their displayed names. Devices absent from the application may have hardware-only lighting; determine this before including synchronized control in release scope.

## Local API feasibility result
A read-only GET to the documented SignalRGB /api/v1/lighting endpoint returned HTTP 403 Forbidden. The local server is reachable, but this endpoint is not accessible in the current session. Official documentation associates Pro-required endpoint 403 responses with an unsigned-in user or missing Pro entitlement; this response does not determine which condition applies. No authentication, subscription or application setting was changed. Scene control through this API remains blocked pending entitlement/access verification. Do not purchase or enable anything as part of design.

## Devices screen interaction specification
Use three initial categories: PC lighting, mouse, keyboard. Each device card presents identity, connection, controller, capability status and last check. The PC lighting card lists verified zones only; do not infer fan count from motherboard identity. Unknown devices show “Compatibility not yet verified.” A hardware-only device can remain in the user's inventory with a note explaining its physical controls; it must not display a working software color picker. An API access failure appears at the integration level and does not imply disconnected hardware. Modes display which devices will participate before application, with unavailable devices clearly excluded and explained.

## SignalRGB screenshot evidence supplied by user
The supplied Photo 1 shows a Gigabyte B650 UD AX-Y1 controller under Fan & RGB Controllers, and two Aura Compatible RAM entries under Other Devices. User reports mouse and keyboard are not listed. The ASUS keyboard at the top is a promotional banner, not a detected device. This confirms discovery of the motherboard controller and two RAM lighting entries, not successful API control, attached fan/strip topology, or mouse/keyboard incompatibility. First-release device design should show these discovered PC components and retain mouse/keyboard lighting as unverified pending exact model information. Do not interpret the controller badge marked 10 as ten fans or zones without further evidence.

## Peripheral label photos
User supplied underside photos. Keyboard label clearly identifies Skytech Gaming K-1000. Mouse label appears to read Skytech Gaming M-1200N; retain tentative transcription because the photo is soft. Current search of official Skytech sources did not establish a model-specific software lighting interface. SignalRGB supported-device search surfaced Skytech prebuilt PCs but did not establish support for these peripheral models (https://signalrgb.com/devices/). Combined with the user's device screen, synchronized peripheral lighting remains unverified, not conclusively impossible. Design them as identified accessories with lighting control unavailable pending demonstrated support. Continue PC-centered design without requiring replacement peripherals or a paid subscription.

## User direction: optional integration failures must not block progress
User explicitly directs that unresolved mouse/keyboard lighting must not bottleneck the command center; check existing open-source solutions on GitHub or Hugging Face, then defer unsupported details. This supersedes treating peripheral compatibility as a blocker for design completion. Preserve the integration extension points and explicit unverified status.
Targeted searches found no verified ready-to-use solution for these exact Skytech models on GitHub or Hugging Face. An OpenRGB upstream device request references USB 1bcf:08a0, matching the detected mouse ID: https://gitlab.com/CalcProgrammer1/OpenRGB/-/issues/3513 . This is a research lead, not proof of model compatibility or working support; no linked software was downloaded or executed.

## Home screen decisions for review
Default landing page has Today at upper left (three priorities, quick add, note and timer), PC status at upper right (CPU/GPU, memory, storage, uptime with timestamps), and a full-width mode strip below. Lower area shows meaningful activity and selected quick actions: Add task, Start focus, Open folder and View devices. Gateway is a compact status card with unavailable/unconfigured states, never a mandatory setup gate. Agents are hidden until an integration exists. Personal task and UI accent changes work independently of peripheral lighting. Main scene actions report which verified devices participate. Preserve the reference's dark navy/cyan appearance and compact sidebar; reserve cinematic branding for the header and welcome view.
First-release design can proceed with the confirmed PC inventory and conditional device controls. The next review concerns daily workflow and visual hierarchy, not peripheral procurement or reverse engineering. Implementation still requires a separate user instruction.

