# Foxsocket visual pass plan

Status: in progress — first implementation PR targets chat empty state + quieter chrome.

North star: https://appliedai.solutions/ — Make room for your ideas.

Interaction reference: conversational assistant UX (chat-first, one clear question at a time, selectable choices) — not a feature wall or admin SaaS dashboard.

## Live shell note

The packaged app loads workspace.css + host-ui.css via index.html (not the older style.css / polish.css / finish.css stack). Prefer editing workspace.js / workspace.css for user-visible product UI. Legacy dashboard CSS remains for historical reference until retired.

## Goal

Make Foxsocket feel like a high-quality product: calm, intentional, progressive. Features appear when they matter, usually through conversation or a single next step — not slammed onto the page as equal-weight cards.

## Interaction model

1. Chat / conversation is the center.
2. One question at a time with a few concrete choices.
3. Progressive disclosure for metrics, lighting, and advanced detail.
4. No feature wall.
5. Honest states only.

## First implementation PR

- Site tagline in branding.js and sidebar
- Empty chat: one question + stacked choice rows (not a 2x2 suggestion grid)
- Slimmer details rail
- Lighting tucked behind a details disclosure on Devices
- Choice-card styles in workspace.css

## Later PRs

Token unification, Host/settings polish, sidebar/header chrome, motion QA screenshots.

## Out of scope

3D mascot, Rive, pairing, provider wizard — visual and interaction honesty only.
