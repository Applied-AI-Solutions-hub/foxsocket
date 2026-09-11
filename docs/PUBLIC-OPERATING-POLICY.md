# Applied AI Solutions: building a business in public

Policy ID: OPS-001 · Version: 0.1 · Owner: Applied AI Solutions · Proposed: 2026-09-11

**Status: public proposal.** This document describes the operating model we intend to adopt. It does not appoint a coordinator, grant spending or merge authority, lift an existing hold, or activate automation. Adoption and any standing authority must be explicitly recorded by the owner.

## Our commitment

We build useful software and show how the business behind it improves. Our public work should make it possible to follow a customer need through a decision, an implementation, a test and an outcome.

Our edge is a repeatable process: clear ownership, bounded authority, evidence before claims, and visible learning. Using more AI agents is not itself a business result. We judge the process by useful work delivered, reliability, customer outcomes and sustainable cost.

Foxsocket is the first application of this policy. We will publish what works, what fails and what we change, without exposing the people who trust us or pretending unfinished capabilities are available.

## 1. Roles and accountability

| Role | Accountability |
| --- | --- |
| Owner | Sets product direction, risk tolerance, budget and delegated authority; approves reserved decisions |
| Coordinator | Maintains the queue, assigns bounded work, resolves overlap, routes reviews, checks evidence and brings exceptions to the owner |
| Implementer | Produces the assigned change, tests it and corrects findings within the approved scope |
| Reviewer | Independently examines the actual candidate and distinguishes defects, preferences and untested claims |
| Device tester | Verifies installation, upgrades, UI and service behavior on an authorized device |
| Release operator | Publishes only the authorized, tested artifact and verifies distribution and recovery information |

A role belongs to a named assignment, not a model brand. Codex, Grok, Claude and future tools follow the same rules. An implementer cannot count self-review as independent approval. The coordinator need not ask the owner to relay ordinary work between roles once a bounded communication grant exists.

## 2. Approve the work boundary, not every keystroke

The owner approves a work brief containing the outcome, acceptance criteria, exclusions, budget and authority. Within that boundary, assigned agents may implement, test, correct ordinary review findings and update the authorized work record without seeking repeated approval.

| Decision | Intended delegated treatment after adoption |
| --- | --- |
| Bug correction, test improvement, documentation correction within an approved task | Implementer proceeds; reviewer checks |
| Implementation detail that preserves agreed behavior and interfaces | Coordinator resolves without an owner decision |
| Overlap between assigned branches | Coordinator sets integration order or reassigns work within existing grants |
| Merge of a qualifying change | Coordinator may approve only if an active grant covers the candidate, checks pass and no hold applies |
| New feature, material design departure, new dependency with cost or expanded access | Escalate to owner unless explicitly covered by the brief |
| Public release, production/device deployment, destructive data operation, new credential scope or purchase | Owner approval unless a specific active grant already covers it |

Classify by impact, not by labels such as “small,” “docs-only” or “P0.” A one-line change can alter permissions or lose data. A failing check, unknown data compatibility, disputed scope or unsupported safety claim blocks progression regardless of the task label.

An authority grant must record: approving owner, named operator/role, allowed operations and repository/device, constraints, maximum spend if applicable, start/end or task-completion expiry, reporting requirements, revocation condition and approval evidence. No grant may be inferred from this proposal. Record public scope in `PROJECT-STATE.md`; keep sensitive approval evidence private with a sanitized reference. Expired or revoked grants do not renew automatically.

## 3. Standard work procedure

1. **Intake:** write one problem and one measurable outcome. Identify who benefits and current evidence. Reject duplicate work before assigning it.
2. **Assign:** name implementer, reviewer and test owner; declare files/components, base SHA, dependencies, budget and exclusions. Claim local resources where required.
3. **Build:** use an isolated branch and a draft PR. Preserve other contributors' work. Keep implementation within the brief.
4. **Review:** reviewer records actionable findings against the exact candidate SHA. Separate correctness blockers from optional suggestions. Do not require owner approval for ordinary corrections within scope.
5. **Correct:** implementer addresses findings; reviewer rechecks affected behavior. If two correction rounds do not converge, the coordinator investigates or narrows the task rather than allowing an endless loop.
6. **Validate:** run appropriate automated checks and real-device tests. A GUI change needs rendered evidence; a Host startup claim needs a real restart test; fixture success cannot substitute for either.
7. **Integrate:** reconcile with current main, validate the final candidate and merge only under the applicable approval/grant. Preserve agreed plans and acceptance criteria unless their change was authorized.
8. **Release:** assemble a newly versioned artifact, source SHA, checksum, changes, known limitations and recovery plan. Publish only with release authority. Verify the download and expected update behavior.
9. **Learn:** record what shipped, what users experienced, cost where measured, defects and the next improvement. Update the procedure if the work exposed a repeatable failure.

States: `proposed -> assigned -> implementing -> review -> validation -> ready -> merged -> released`. `blocked` and `changes requested` must name the missing condition and next responsible role. “Merged,” “released” and “installed” are different facts.

## 4. One queue, concise records, no message loops

Use GitHub issues/PRs for public work records and `PROJECT-STATE.md` for material ownership, dependency and hold changes. Do not create competing task lists for each model. Private PC checkpoints describe unpublished/device state and are not copied into public Git.

Once explicitly authorized, routine coordination uses one work brief, one structured review, correction updates only when needed, and one completion record. Avoid acknowledgments, broadcasts, forwarded notices and repetitive status polling. No agent needs to announce the same state in multiple chats.

The coordinator sends the owner a consolidated update at the agreed cadence and escalates only actionable exceptions. An escalation must include the decision needed, recommendation, alternatives and effect on delivery, cost or risk. Do not ask “what next?” when the approved queue already contains runnable work.

Separate chat sessions are not an automation system. Before calling the process unattended, verify that the coordinator can dispatch each worker, receive completion evidence, retry safely and stop within its budget. Until then, describe the process as assisted and identify manual handoffs. Do not fabricate integrations or assume GitHub updates wake an agent.

The current restriction on unsolicited inter-task messaging remains until the owner grants a specific coordination channel and scope. Policy adoption alone must not restart acknowledgment loops.

## 5. What we publish

| Publish by default within an authorized public task | Protect or obtain separate consent |
| --- | --- |
| Roadmap, work briefs, decision summaries and acceptance criteria | Customer/personally identifying information and private conversations |
| Source changes, review findings and test evidence | Tokens, credentials, private infrastructure and raw machine inventories |
| Releases, known limitations and correction notes | Unpatched exploitable details requiring coordinated remediation |
| Experiments, unsuccessful approaches and lessons | Customer contracts, confidential commercial terms and unpublished financial records |
| Measured outcomes and approved aggregate costs | Personal data, screenshots or testimonials without permission |

Public transparency means publishing conclusions, decision reasons, evidence and tradeoffs. It does not require private reasoning transcripts, raw agent conversations or internal secrets. Summarize and redact deliberately; do not upload first and clean up later.

Build logs must identify AI-assisted work and human approvals accurately. Do not manufacture contributors, customers, reviews, revenue or test results. Do not call a prototype shipped, an alpha production-ready, or a plan implemented. External marketing posts, customer communications and financial disclosures still require authority for that channel.

## 6. Public progress and business learning

At an agreed weekly cadence, prepare one concise public build note. Publication uses the approved channel and authority; do not automatically post it across services.

The note contains: the problem addressed, linked changes, evidence of behavior, remaining limitations, lessons from failures, and the next testable outcome. If nothing shipped, say what was learned or blocked rather than inventing progress.

For growth experiments, record a hypothesis, intended audience, success measure, time/budget limit, data/consent boundary and stop condition before spending or contacting people. Examples include testing whether clearer setup guidance increases completed onboarding or whether a better issue template reduces support rework. Report outcomes even when the hypothesis fails.

Compare claims against measurements:

| Measure | Definition and discipline |
| --- | --- |
| Delivery time | Elapsed time from approved assignment to accepted change; show blocked time separately |
| First-run completion | Completed first real agent replies divided by observed setup attempts; label sample size and collection method |
| Escaped defects | Confirmed defects found after acceptance/release, linked to fixes |
| Rework | Correction rounds or reopened tasks; use to improve the process, not inflate blame |
| Owner involvement | Decisions requiring the owner per accepted task; aim to reduce unnecessary handoffs |
| Cost per accepted outcome | Measured tool/API/build cost for accepted work; mark unavailable costs unknown, never zero |

These are proposed metrics, not claims that telemetry already exists. Use consented, minimized data. Raw counts of commits, tokens or agent messages are not proof of business growth. Avoid cross-period comparisons with incompatible definitions or tiny samples presented as certainty.

## 7. Cost and quality controls

Set a proportionate task budget or stop condition. Use the least expensive capable workflow, batch independent reads, reuse relevant verified results and rerun only checks affected by changes. Do not skip meaningful verification to appear efficient.

Delegate only when the independent role adds value or the procedure requires it. Stop and report when repeated retries do not produce new evidence, scope expands, or the agreed budget would be exceeded. A coordinator may reduce scope within the brief; additional spending requires authority. Never run an unbounded agent loop.

## 8. Incidents and corrections

If a change threatens data, access or service reliability: stop the affected rollout, preserve sanitized evidence, contain the issue within authorized actions and alert the owner through the approved channel. Do not delete history or silently replace a released binary.

Restore from a tested compatible backup or prepare a forward fix. Verify recovery. Publish an appropriate incident summary after sensitive details are handled: what happened, who/what was affected, what was corrected and which procedure changed. Correct inaccurate public claims visibly. Transparency must not amplify an active exploit or expose users.

## 9. Minimal records

**Work brief**

```text
Problem / intended user outcome:
Owner, coordinator, implementer, reviewer, test owner:
Approved scope / exclusions / affected components:
Base SHA / branch / dependencies:
Acceptance criteria and evidence required:
Budget or stop condition:
Authority grant and expiry / escalation triggers:
```

**Completion/build note**

```text
Outcome and status (source / release / installed):
PR, tested SHA, artifact/version if applicable:
Tests: PASS / FAIL / NOT TESTED; evidence:
Customer or business result: measured / reported / unknown:
Cost: measured / partial / unknown:
Known limitations / recovery:
What we learned / next action:
```

## 10. Adoption and maintenance

Adopt through owner approval recorded in the policy PR. Record the named coordinator and active grants separately; list any holds that remain. Tools enforce configured controls, not prose: verify branch protections, required checks and integration access before representing them as active.

This policy defines business governance. `AI-COLLABORATION-POLICY.md` defines contributor mechanics; each machine's private policy defines local resource safety. If they conflict, stop the conflicting operation and clarify the narrow conflict; continue unrelated authorized work. Specific current owner instructions and higher-priority safety/tool requirements take precedence.

Review this policy after an incident, a material workflow change, or an agreed periodic review. Amend it through a small public PR with the reason and expected effect. Keep old decisions traceable. Our public operating process should improve alongside the product.
