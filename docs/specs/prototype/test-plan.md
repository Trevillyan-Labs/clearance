---
status: active prototype test plan
owner: ren
last_verified: 2026-11-14
---
# Clearance lean test plan

The approved compressed path retains focused boundary checks and one real end-to-end run, followed by reset/repeat. Tests occupy roughly 15 to 20 percent of implementation effort, plus rehearsal. No separate proof system or new testing framework. Tests were written before their implementation in the assigned backend/workflow lanes; passing source checks do not establish live service behavior.

## Commands and current evidence

Canonical command: `npm test`, which runs Node with the tsx loader. At this checkpoint all 17 tests pass. Direct native Node without that loader is not the repository's current runner and cannot resolve the workflow test's extensionless imports.

| Existing suite | Count | What passed | Requirement |
|---|---:|---|---|
| tests/brain.test.ts | 2 | Twelve labeled sources load; wrong-folder ownership and symlink routing refuse. | R2, R9 |
| tests/hydra.test.ts | 3 | Exactly one client collection/nonempty ACL in request; normalization returns ranked IDs only; status polls repeat source IDs. These are local adapter checks, not real API calls. | R2 |
| tests/store.test.ts | 5 | Wrong-client reads/grants fail at C3; grants are run-scoped/one-use/expiring; all observed-input restrictions inherit; matching-client delivery only; ended/failed/untested runs refuse; restart does not revive active authority. | R1, R5-R7, R10 |
| tests/workflow.test.ts | 4 | Same transaction routes differently; wrong-client workflow fails independent cases; schema is bounded; standalone export uses fixed runtime and inert configuration. | R3, R4 |
| tests/runtime.test.ts | 3 | Actual runtime with injected model/search excludes adversarial foreign IDs from model inputs; scoped approval produces checked artifacts; reassignment starts fresh history; late retired-run output is ignored. | R1, R5-R7 |

`npm run typecheck` and `npm run build` passed at the integration checkpoint. Repeat after review fixes settle. No CI result is claimed. If CI is added for public submission, use these ordinary commands rather than another harness.

## Remaining focused integration checks

| Check | Minimum evidence | Status |
|---|---|---|
| Coordinator | Capture the actual model request: task/client/ceiling metadata only. Invalid client or above-ceiling proposal is refused server-side. | Pending runtime integration |
| Live index | Ingest the twelve synthetic sources into one database/two collections; wait for readiness; perform same query in both scopes and verify attributed IDs and admitted inputs. No wildcard/empty ACL. | Pending HydraDB account/API setup |
| Real workers | Two independent xAI histories search, request their own Restricted threshold read, and generate valid workflow JSON. No prior client's messages, generated app or expected-case answers enter another worker. | Model-only trial passed for both clients with explicitly injected fixture search; real HydraDB integration pending. |
| Grant lifecycle | Approve each requested same-client read through the UI; show consumption and Restricted artifact inheritance. Wrong client remains denied even with high clearance. | Pending UI/runtime rehearsal |
| Boundaries through real routes | Attempt foreign source attachment and foreign artifact preview/download. Refuse before context/response body. Retire a run with a pending model response; late output does not become a valid artifact. | Pending integrated routes |
| Actual apps | Run both exported HTML apps in a browser. Enter USD 75,000 and confirm Beacon Procurement+CFO versus Crest Department Manager, plus the independently defined threshold boundary cases. | Model-only trial HTML verified in browser at USD 75,000 for both clients and Crest USD 100,000. Full integrated boundary rehearsal pending. |
| Graph and freshness | Compare displayed source edges to observed-input records. Reassign consultant role and inspect a new empty history before destination reads. Coordinator remains metadata-only. | Pending UI/runtime rehearsal |
| Full demonstration | Complete the selected three-minute story, measure latency, reset and repeat without stale grant/run resurrection. A labeled time cut is allowed for the recording; fabricated states are not. | Pending rehearsal |

One integrated run can satisfy multiple rows. Repeat only the relevant checks after a repair, then the final complete rehearsal. Do not broaden tests merely to increase the count.

## Acceptance decision

Core is ready only when real HydraDB search, real model generation, matching-client software behavior, grant/denial, client delivery and fresh reassignment have been exercised through the user-facing flow. Offline fixture runs can validate layout or local logic but cannot replace live-service evidence. A failed required boundary blocks presenting that claim as working.

Dynamic reclassification and a second presentation variant are outside this core acceptance. Their absence is not a failure of the agreed noon scope.
