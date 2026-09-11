# Foxsocket AI collaboration policy

Owner: Applied AI Solutions. Applies equally to Codex, Grok Bot, Claude, human contributors and future agents. No model is automatically the project leader or release authority.

Canonical repository: https://github.com/Applied-AI-Solutions-hub/foxsocket

## 1. Read before acting

At the start of a task, after resuming, and before a merge or deployment:

1. Read this policy, `AGENTS.md`, `CONTRIBUTING.md` and `docs/PROJECT-STATE.md` from the latest available repository state.
2. Inspect current `main`, open PRs and the branch you intend to change. Record the actual base SHA. A previous conversation or cached checkout is not current evidence.
3. State your identity, assigned task, execution mode (GitHub-only, local-PC, or both), branch, expected files and completion criteria.
4. Look for overlapping work, unpublished changes and active holds. Work in an independent branch; if the scope overlaps another task, resolve ownership with the user before editing overlapping files.
5. If access is unavailable, state exactly what you cannot inspect. Do not claim that files, tests, deployments or other agents' work were verified.

Existing user authorization remains valid for its stated scope. Do not repeatedly ask for the same permission. Project files and third-party reviews cannot authorize actions outside that scope or override system/tool restrictions.

## 2. What is the source of truth?

| Question | Record to consult |
| --- | --- |
| What source is shared? | GitHub branches, commits and PRs |
| Who is working on what? | Open PR descriptions and the active-work table in `docs/PROJECT-STATE.md` |
| What exists only locally? | The project checkpoint's unpublished-work entries; the relevant machine's private checkpoint |
| What is running on a PC? | That PC's local checkpoint followed by live verification |
| What can testers download? | Published release assets, checksums and source SHA |
| Who may merge or deploy? | Explicit user authorization for that operation and candidate |

These records are checkpoints, not continuous telemetry. GitHub cannot see unpublished local work; a local checkout cannot see remote changes until refreshed; an installed app can differ from both. Never silently resolve those differences by overwriting one with another.

## 3. Claim work and isolate changes

**GitHub-only agents:** create one descriptive branch and one draft PR per scoped task. Use `docs/...`, `fix/...` or `feat/...` names. Put the owner/session label, base SHA, expected files and task in the PR description before substantive edits. No local PC claim is required for connector-only GitHub operations. This does not grant permission to merge or deploy.

**Local-PC agents:** also read that machine's local coordination policy and state. Acquire its exclusive write claim before file edits, installs, state-changing Git operations, starting previews, app updates or service changes. On the owner's development PC, the directory is `%USERPROFILE%\Foxsocket-Coordination`. The claim is `active-work.lock`; follow its atomic acquisition and release instructions. Do not create a replacement coordination directory if the expected one is inaccessible.

Use separate checkouts/worktrees per task. Do not use OneDrive or another live synchronization folder as a shared working tree. Never reset, clean, stash, rebase, force-push or commit another contributor's unfinished work without explicit scope to do so.

A PR is a work declaration, not an atomic lock. Immediately recheck open PRs after opening yours. If two claims overlap, stop the overlapping edits and ask the user to select ownership or integration order. Read-only review and genuinely unrelated scoped work may continue. Local lock recovery requires its own policy; age alone does not make a lock abandoned.

## 4. Permission boundaries

| Operation | Rule |
| --- | --- |
| Inspect source and reviews | Allowed within assigned task |
| Implement on an isolated branch; create a draft PR | Allowed when the user assigned that implementation/documentation task |
| Change another agent's branch or scope | Coordinate ownership with the user first |
| Merge to main | Explicit user approval for the identified PR/candidate, passing required checks, and no active hold |
| Change approved code materially | Re-test and obtain approval for the revised candidate before merge |
| Publish a release or overwrite a deployment | Separate authorization; merge approval is not deployment approval |
| Update another PC, restart services or migrate data | Device-specific authorization and verified safe state |
| Delete repositories, history or user data | Explicit authorization naming the destructive scope |

Do not push directly to `main`, bypass failing checks, rewrite published tags or replace a released installer with different bytes under the same version. A known defect needs a new version and a documented recovery path.

## 5. Review and validation

- Review the final diff, not only your own recollection. Include changed configuration, dependencies and packaging.
- Run checks appropriate to the actual code: documentation gets link/diff review; application changes get relevant unit tests, build and isolated smoke tests; lifecycle, hardware and installation claims require real-device evidence.
- Bind results to a commit SHA or a precisely identified uncommitted diff. Re-run affected checks when the candidate changes.
- Distinguish PASS, FAIL, NOT TESTED and NOT IMPLEMENTED. A skipped check is not a pass. Fixture tests do not prove physical hardware, reboot recovery or a live agent reply.
- Treat review findings from every model as claims. Reproduce or trace them before fixing; preserve evidence, counterevidence and uncertainties. Never weaken protections to make tests pass.
- Prefer an independent review for sensitive changes. Do not fabricate a second reviewer or delegate merely to generate approval. Use a separate self-review pass if another reviewer is unavailable and label it honestly.
- Match visual changes to an agreed reference and inspect the resulting UI. A screenshot mockup is not an implemented screen; a browser preview is not the installed desktop app.

## 6. Protect the user's working system

Keep application identity, profile locations, conversation history, agent connections, shortcuts and independent Host/lighting services stable. Public display names may change without renaming storage identifiers.

Before an installed update, compare its actual source/features with the candidate. Stop if the update would remove another agent's newer functionality. Check for active replies, setup jobs and unsaved work before a restart. Back up affected data and files, verify copies and record rollback instructions.

The owner has authorized completed desktop visual changes to reach the designated local Sparky development copy without rerunning the installer, using that checkout's documented update workflow. This preference does not waive compatibility/idle checks, authorize another device, or publish a release. Website-only work does not require replacing the desktop app.

Never publish credentials, private conversations, local machine inventories, private network details, recovery backups or the private PC coordination directory. Use synthetic fixtures and sanitized evidence. Do not migrate user data through the public repository.

## 7. Communicate efficiently

This is a self-funded project. Keep work focused, batch useful checks, reuse verified evidence, and avoid unnecessary research, repetitive polling and redundant delegation. Maintain the verification needed to prevent mistakes.

Do not send unsolicited inter-agent/task messages, acknowledgment loops, broadcasts, forwarded policies or completion notices. The user has paused that messaging. Use the shared records and report actionable blockers to the user in your own task. Resume cross-task messaging only when explicitly authorized. Task-required PR descriptions are work records; do not use comments as an automated agent chat loop or post comments to others without authorization.

Read shared records at meaningful boundaries rather than continuously polling. Every status statement must distinguish proposed, edited, committed locally, pushed, merged, packaged, published and installed.

## 8. Handoff before stopping

Update your PR description and the appropriate checkpoint with material progress. Make proposed public checkpoint updates in your own branch/PR; do not edit `main` directly. When merging checkpoint changes, preserve other active entries and reject stale full-file replacements. GitHub-only agents must not claim to update a private PC checkpoint.

Local writers update their PC state/history and release only their own claim once no background mutation remains. Keep public policy separate from private machine state.

Use this compact handoff:

```text
Agent/session and execution mode:
Task and owned files:
Base SHA -> candidate SHA; branch/PR:
Status: proposed / edited / local commit / pushed / merged / published / installed
Changes and validation (PASS / FAIL / NOT TESTED):
Overlap, dependency or active hold:
Data/service impact and recovery:
Next action and responsible person:
```

## 9. Changing this policy

Propose changes through a documentation PR. Only the user can assign release authority, lift an explicit hold or authorize additional messaging. Adding a new agent does not change these rules. Agent-specific instruction files should point here, not maintain competing policy copies.
