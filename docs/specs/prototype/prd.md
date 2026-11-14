---
status: draft
owner: bill
last_verified: 2026-11-14
---
# Clearance prototype requirements

## Problem and vision

An enterprise operator wants to delegate work without granting every worker access to every document or reviewing every routine step. This is a product hypothesis from the concept discussion, not a validated customer study.

Why-chain: useful delegation requires context; company context has different audiences; blanket access ignores those differences; the operator must accept exposure or repeatedly intervene. The addressable consequence is lost control or lost time. A further why about universal trust adds no testable scope, so the analysis stops here.

Clearance lets an operator give a team a mission, assign each worker authority once, and intervene only for a narrow exception. Restrictions follow the resulting work. The prototype tests whether this is understandable and useful in one launch scenario.

## Noon outcome

By noon Pacific November 14, a local demonstration should complete a launch with real HydraDB search and model generation. The operator inspects each worker's inputs, grants one restricted read, changes the classification of a source feeding a pending public page, sees publication blocked, then generates a fresh permitted page while unrelated work remains usable.

Target stage sequence: three minutes, with latency measured during rehearsal. Success requires one complete live run and a reset/repeat. A longer five-minute presentation can inspect the same outcomes.

## Scope and jobs

One invented company, one launch mission, twelve immutable documents, four ordered classes (Public 0, Internal 1, Confidential 2, Restricted 3), three initial workers and two destinations (public and privileged operator). Assign clearance when spawning a worker. Changing clearance creates a new run, never reuses a contaminated context.

Preset roles: Public marketing, Internal sales and Confidential pricing. Outputs: a usable landing page rendered from structured content, a sales brief, and a pricing recommendation. A restricted read exception serves the pricing recommendation but never grants publication authority. Recovery uses remaining Public product facts.

## Requirements and lean acceptance

| ID | Requirement | Observable acceptance |
|---|---|---|
| R1 | Start workers with server-owned identity, mission and assigned clearance. | Three independent contexts; no worker can raise its clearance or alter policy. |
| R2 | Search through HydraDB and disclose only currently permitted sources. | Same query under different clearances admits only permitted content. Unknown/missing-policy/guessed restricted IDs reveal no title, snippet or body. Search failure is visible, never replaced with local search. |
| R3 | Approve a narrowly scoped exceptional read. | Operator sees worker, source, purpose and expiry. Only that run can consume it once for the exact source version; other workers remain unchanged. |
| R4 | Preserve restrictions across generation. | Artifact class includes every input admitted to the run, even when the model cites only Public sources. Read approval never lowers output class. |
| R5 | Produce useful artifacts with separate publication authority. | Public-only run renders a landing page. Higher-class outputs remain operator-only. Generated HTML/script cannot execute. |
| R6 | Apply classification changes to pending work. | Reclassifying a contributing source blocks publication and flags descendants. Unrelated work remains eligible. In-flight generation cannot return a stale publishable result. |
| R7 | Recover without carrying restricted information forward. | New Public worker receives original public task and permitted sources, never old draft/history. Its page can publish; old artifact stays blocked. |
| R8 | Explain actual activity. | Graph and cards reflect real reads, generation, grants and publication decisions. Operator can inspect admitted input manifests; public page receives only released content. |
| R9 | Keep the work independently publishable. | New implementation, invented fixtures, MIT license, dependency disclosure; no proprietary source, private records or credentials. |

R1-R3 enable bounded delegation, R4-R7 preserve control, R8 makes intervention understandable, R9 enables use at the hackathon.

## Non-goals

No automatic classification, semantic declassification, arbitrary shell/code execution, general MCP toolbox, multi-organization compartments, SSO, durable agent memory, production hosting, real email, payments or document upload. Classification cannot erase information already seen or delivered. Four classes are a demo taxonomy, not military accreditation.

No runtime Software Factory integration is required by noon; it can manage the build if accessible. HydraDB search is required. Provenance graph is application-owned, not claimed as a vendor authorization feature.

## Interaction and evidence

One trusted local operator. Workers cannot call operator routes. Public preview is a separate read-only page. Keyboard-accessible controls; class/status uses words and color. Record ordinary events for starts, searches, admitted reads, grants, artifacts, reclassification and publication outcomes. Measure mission/search/generation duration and provider token counts when available. No benchmark or production guarantee follows from a synthetic run.

## Risks

HydraDB and model access must work early. Documentation is not live qualification. Boundary correctness retains rigor; scale and polish are lower priority. A recorded successful run may be a disclosed backup, never presented as live.

## System context

![The operator controls Clearance; it searches HydraDB and generates with a model, while viewers receive released output only.](context.svg)

[Technical design](tech-spec.md) | [Delivery outlook](delivery-outlook.md) | [Decisions](decision-ledger.md)
