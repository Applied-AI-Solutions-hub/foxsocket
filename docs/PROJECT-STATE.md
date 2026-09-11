# Foxsocket shared project checkpoint

Checkpoint date: 2026-09-11. This is a public coordination record, not live PC telemetry. Verify current refs and PR state before acting. Each entry needs an owner, source/evidence, scope, status and next action. Do not store private paths, credentials, conversations or machine inventories here.

## Active hold

Public operating-policy proposal: `docs/PUBLIC-OPERATING-POLICY.md` defines the intended coordinator-led workflow and build-in-public procedures. No coordinator, standing merge grant, new messaging permission or automation was activated by drafting it.

**Pause merges and deployments until local review fixes, remote main and the installed/workflow source are reconciled.** The user has been advised of this hold in the current coordination task. Do not infer that creating this policy PR lifts it. Obtain the user's explicit decision before merging or deploying. Independent scoped branches and draft PRs may continue.

## Known work

| Work | Owner | State/evidence | Next action |
| --- | --- | --- | --- |
| README improvements | Grok Bot | Remote main includes merged PR #1, commit 22fdc0e | Preserve during integration |
| Visual-pass plan | Grok Bot | Remote main includes merged PR #2, commit 64da418 | Use as design context; not proof of implemented UI |
| Chat-first empty state | Grok Bot | User reports PR #3 open on GitHub; inspect latest PR before overlapping edits | Leave open during reconciliation |
| Review hardening | Codex | Local-only commit bc70a28 on fix/review-hardening; not available from GitHub at this checkpoint | Publish a reviewed integration PR after comparing current main and overlapping PRs |
| Installed/workflow integration | Existing local workflow task; owner to confirm integration lead | Local report says installed payload differs from public alpha and includes workflow functionality | Verify actual source and preserve features before any installed update |
| AI collaboration policy | Codex | docs/ai-collaboration-policy; documentation-only proposal based on 64da418 | Review policy without lifting merge/deployment hold |
| Claude | User has added Claude; no task ownership recorded yet | Access mode and branch unknown | Read policy and declare assigned scope before editing |

## Checkpoint rules

- Update only facts you verified; label user reports and unknowns.
- Record local-only work here without publishing private machine details. A local SHA is not a downloadable remote commit.
- A merged PR does not imply a release, installed update or successful device test.
- PR descriptions hold task-level progress. Update this overview only for material scope, dependency, hold or completion changes.
- Propose updates on your task branch. Resolve stale checkpoint edits at merge time instead of dropping other agents' entries.
- Keep old evidence explicitly dated; do not present it as current health.
