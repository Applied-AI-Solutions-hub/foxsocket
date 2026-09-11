# Product look — installable app feel

Status: plan for review. No UI code in this PR.
Audience: Applied AI / Foxsocket as something people download and install.
North star: [appliedai.solutions](https://appliedai.solutions/) — “Make room for your ideas.”
Interaction reference: calm chat + one clear question with stacked choices (Grok Bot pattern).

## Goal

First open after install should feel like a real personal program, not a SaaS admin console or demo dashboard.

## Diagnosis (current cheap feel)

Seen in the installed Applied Ai App checkout (`.qa` captures + CSS stack):

1. **Overview as Home** — wallpaper hero, metric tiles, feature card grid.
2. **Architecture wallpaper** on working pages (Overview, Settings).
3. **Equal-weight nav** — Sparky, Overview, Workflows, Tasks, Devices, Files, System, Settings all compete.
4. **Four-up suggestion cards** on Sparky empty state (capability grid, not a conversation).
5. **CSS archaeology** — `style.css` + `polish.css` + `finish.css` with conflicting tokens/radii.
6. **“Command Center”** naming in footer/product framing.
7. **Tiny 8–9px tracked eyebrow labels** — brochure chrome, not calm UI type.

Brand marks and cinematic assets are strong. The shell is what reads cheap.

## Principles

- Sparky is the product surface. Everything else is secondary.
- One question at a time; stacked choices, not feature grids.
- No wallpaper behind working UI. Brand art = marketing / brief startup only.
- One token set, one radius, one accent usage rule.
- Honest empty states — no fake “agents online” theater.
- Progressive disclosure: hide secondary routes until needed.
- Name it like software people install, not middleware.

## Pass order

### P0 — Intentional product (biggest win)

1. Default landing = **Sparky**. Overview is not Home (hide or bury under System).
2. Empty state = **one prompt + 3 stacked choices**. Remove the 4-up suggestion grid.
3. **Delete wallpaper heroes** on Overview, Settings, and other working pages.
4. Rename: drop “Command Center.” Product: Applied AI / Foxsocket. Tagline: **Make room for your ideas.**
5. Collapse primary nav to **Sparky · Tasks · Devices · Settings**. Files / System / Workflows behind Settings or a “More” disclosure.

### P1 — One design system

6. Merge `style.css` / `polish.css` / `finish.css` into one token source: bg, surface, border, text, muted, accent, radius (single value), focus ring.
7. Replace 8–9px tracked eyebrows with normal 12–13px secondary text.
8. One button, one input, one card. No competing gradients/borders.
9. Accent only for active nav, primary CTA, and focus — not every edge glow.

### P2 — Installer / first-run (what downloaders judge)

10. Startup: mark + one line (“Opening your workspace…”) — no architecture mural.
11. First-run: one question (“What do you want to do first?”) with 3 choices that seed Sparky.
12. Remove the three-button service footer bar. Status stays in the header pill only.
13. Sensible default window size; remember size/position; readable at 100% display scaling.

### P3 — Real-software polish

14. Honest empty states (no fabricated metric theater).
15. Settings as a quiet list — no hero banner.
16. Before/after screenshots in the tester README.

## Anti-patterns

- Metric tile rows on first open
- Feature card grids as the empty state
- Wallpaper / architecture behind copy or controls
- “Command Center” / dashboard framing
- Eight equal nav destinations
- Stacked CSS layers that fight each other
- Tiny all-caps tracked labels as decoration

## Acceptance (P0)

- Fresh install opens to Sparky chat, not Overview.
- Empty Sparky shows one question and stacked choices (not a 4-card grid).
- No architecture wallpaper on Sparky, Tasks, Devices, or Settings.
- Primary nav shows at most four items.
- No “Command Center” copy in the shell.
- Tagline matches the site: Make room for your ideas.

## Ship rules

- Small PRs, one pass at a time (P0 → P1 → P2 → P3).
- Before/after screenshots on UI PRs.
- GitHub branches/PRs only until local ↔ remote reconciliation is done.
- Do not merge without explicit approval.
- Do not duplicate local `fix/review-hardening` (`bc70a28`).
- Do not change the installed app / deploy until reconciliation says so.
- Local PC edits require Foxsocket-Coordination `POLICY.md` / `PC-STATE.md` + work claim.

## Out of scope (this plan)

3D mascot, Rive, new features, pairing flows, provider wizard, lighting backend changes.
