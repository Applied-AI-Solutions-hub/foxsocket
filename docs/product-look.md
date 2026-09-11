# Product look — installable Foxsocket feel

Status: plan for review. No UI code in this PR.
Audience: **Foxsocket** as something people download and install.
Company: Applied AI Solutions (maker credit only — not the product name on the shell).
North star: [appliedai.solutions](https://appliedai.solutions/) — “Make room for your ideas.”
Interaction reference: calm chat + one clear question with stacked choices (Grok Bot pattern).

## Mission (why the UI must feel this way)

Foxsocket exists to make **personal AI agents easier to adopt** — on **your own hardware**, in the **cloud**, or both — without turning “run an agent” into a research project.

The product grew out of a real personal-agent setup (local host + chat front door). The public app should carry that intent forward: a calm place to think and work with an agent under your control. The shell should sell **adoption**, not a command-center dashboard.

Design implication: first open = Sparky + one clear question. Host readiness stays honest when setup is incomplete. Wallpaper metrics and feature grids fight the mission.

## Branding

| Role | Name |
| --- | --- |
| Product (window title, sidebar, installer, Start Menu) | **Foxsocket** |
| Agent / chat surface | Sparky |
| Host / client labels | Foxsocket Host / Foxsocket Client |
| Maker (About, credits, legal) | Applied AI Solutions |
| Tagline | Make room for your ideas. |

Keep the existing A-mark assets (`canonical-mark.svg`, `icon.png` / `icon.ico`). Do **not** use “Applied AI”, “Applied AI Command Center”, or “Command Center” as the product name on the working UI.

Local brand files today live under the Applied Ai App assets folder and still say Applied AI Solutions in wordmarks — reuse the mark geometry; replace on-screen product naming with Foxsocket.

Align `branding.js`: `productName: 'Foxsocket'`, `maker: 'Applied AI Solutions'`, `tagline: 'Make room for your ideas.'`

## Goal

First open after install should feel like a real personal program named Foxsocket, not a SaaS admin console or demo dashboard.

## Diagnosis (current cheap feel)

Seen in the installed Applied Ai App checkout (`.qa` captures + CSS stack):

1. **Overview as Home** — wallpaper hero, metric tiles, feature card grid.
2. **Architecture wallpaper** on working pages (Overview, Settings).
3. **Equal-weight nav** — Sparky, Overview, Workflows, Tasks, Devices, Files, System, Settings all compete.
4. **Four-up suggestion cards** on Sparky empty state (capability grid, not a conversation).
5. **CSS archaeology** — `style.css` + `polish.css` + `finish.css` with conflicting tokens/radii.
6. **“Command Center”** naming in footer/product framing.
7. **Tiny 8–9px tracked eyebrow labels** — brochure chrome, not calm UI type.
8. **Product naming drift** — shell still reads Applied AI / Command Center while the public product is Foxsocket.

Brand marks and cinematic assets are strong. The shell naming and chrome are what read cheap.

## Principles

- Foxsocket is the product; Sparky is the surface you live in.
- UI serves agent adoption (local hardware and/or cloud), not admin theater.
- One question at a time; stacked choices, not feature grids.
- No wallpaper behind working UI. Brand art = marketing / brief startup only.
- One token set, one radius, one accent usage rule.
- Honest empty states — no fake “agents online” theater.
- Progressive disclosure: hide secondary routes until needed.
- Name it like software people install (Foxsocket), not middleware.

## Pass order

### P0 — Intentional product (biggest win)

1. Default landing = **Sparky**. Overview is not Home (hide or bury under System).
2. Empty state = **one prompt + 3 stacked choices**. Remove the 4-up suggestion grid.
3. **Delete wallpaper heroes** on Overview, Settings, and other working pages.
4. Rename shell to **Foxsocket**. Drop “Command Center” / Applied AI as product name. Tagline: **Make room for your ideas.** Maker line: Applied AI Solutions.
5. Collapse primary nav to **Sparky · Tasks · Devices · Settings**. Files / System / Workflows behind Settings or a “More” disclosure.

### P1 — One design system

6. Merge `style.css` / `polish.css` / `finish.css` into one token source: bg, surface, border, text, muted, accent, radius (single value), focus ring.
7. Replace 8–9px tracked eyebrows with normal 12–13px secondary text.
8. One button, one input, one card. No competing gradients/borders.
9. Accent only for active nav, primary CTA, and focus — not every edge glow.

### P2 — Installer / first-run (what downloaders judge)

10. Startup: Foxsocket mark + one line (“Opening your workspace…”) — no architecture mural.
11. First-run: one question (“What do you want to do first?”) with 3 choices that seed Sparky.
12. Remove the three-button service footer bar. Status stays in the header pill only.
13. Sensible default window size; remember size/position; readable at 100% display scaling.
14. Installer / Start Menu / window title say **Foxsocket** (not Applied AI Workspace / Command Center).

### P3 — Real-software polish

15. Honest empty states (no fabricated metric theater).
16. Settings as a quiet list — no hero banner.
17. Before/after screenshots in the tester README (Foxsocket-branded).

## Anti-patterns

- Metric tile rows on first open
- Feature card grids as the empty state
- Wallpaper / architecture behind copy or controls
- “Command Center” / dashboard framing
- Using Applied AI as the product name on the shell
- Eight equal nav destinations
- Stacked CSS layers that fight each other
- Tiny all-caps tracked labels as decoration

## Acceptance (P0)

- Fresh install opens to Sparky chat, not Overview.
- Empty Sparky shows one question and stacked choices (not a 4-card grid).
- No architecture wallpaper on Sparky, Tasks, Devices, or Settings.
- Primary nav shows at most four items.
- Shell product name is **Foxsocket**; no “Command Center” copy.
- Tagline matches the site: Make room for your ideas.
- Applied AI Solutions appears only as maker/credit, not as the app name.

## Ship rules

- Small PRs, one pass at a time (P0 → P1 → P2 → P3).
- Before/after screenshots on UI PRs.
- GitHub branches/PRs only until local ↔ remote reconciliation is done.
- Do not merge without explicit approval.
- Do not duplicate local `fix/review-hardening` (`bc70a28`).
- Do not change the installed app / deploy until reconciliation says so.
- Local PC edits require Foxsocket-Coordination `POLICY.md` / `PC-STATE.md` + work claim.

## Out of scope (this plan)

3D mascot, Rive, new features, pairing flows, provider wizard, lighting backend changes, redesigning the A-mark geometry.
