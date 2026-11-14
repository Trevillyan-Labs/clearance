---
status: core verified with explicit coverage; video and public submission pending
owner: ren
last_verified: 2026-11-14
---
# Clearance verification and evidence

This document owns measured outcomes and remaining obligations. The core prototype is verified with the precise production/development coverage below. It is not a production-security certification, an assertion that every development action was repeated in production, or a completed hackathon submission.

## Source checks

Final `npm test` passed all 23 tests, including the bounded transient-retry checks. `npm run build` passed and the resulting production application was started on `http://127.0.0.1:3090`. Type checking had also passed at the integration checkpoint. No CI result is claimed. Tests run through the configured tsx loader, not bare native Node resolution.

| Suite | Verified coverage |
|---|---|
| tests/brain.test.ts | Labeled source loading, wrong-folder ownership and symlink rejection. |
| tests/hydra.test.ts | Fixed database/client scope, explicit email-shaped ACL principals, ID-only response normalization and repeated status-query IDs. |
| tests/store.test.ts | Cross-client refusal even at C3; one-use/run/version/expiry grants; inherited restrictions; matching-client delivery; failed/untested/ended-run rejection; restart interruption. |
| tests/workflow.test.ts | Distinct client policy behavior, independent wrong-client/boundary failures, bounded schema and escaped standalone export. |
| tests/runtime.test.ts | Typed exact-two-worker C2 delegation; runtime with injected services; foreign-ID exclusion; scoped reads; fresh reassignment; late retired-result rejection. |
| tests/http.test.ts | Exact external Host/Origin despite Next's internal localhost URL; cross-site and session rejection. |
| tests/model.test.ts | Bounded transient retry, sanitized permanent/exhausted failure, and request/token reservations across attempts and tool payloads. |

The HTTP defect was reproduced through the browser-equivalent path before repair: same-origin actions received Cross-origin access denied. The corrected guard uses the exact allowlisted external Host. The harmless probe then reached Unknown action, and negative origin/session cases remained rejected. Cookies and credentials were not printed.

## Service configuration and measured retrieval

The actual HydraDB database field is `default-tenant`, confirmed from GET /databases. Client collection names are `client_beacon` and `client_crest`. The implementation fallback `clearance_demo` is not the verified seeded database; the running configuration explicitly selects the measured scope. Server-derived ACL principals are email-shaped synthetic identifiers.

The corpus contains twelve invented Markdown documents. Scoped C3 qualification returned all six expected IDs for each client. Status polling remained queued despite those successful queries. Seed verification therefore checks actual scoped retrieval coverage, not an assertion that background graph indexing completed. The production workers also performed their actual C2-scoped searches and exact same-client Restricted reads. No fixture search substituted for the final live run.

## Final production coverage

| Area | Measured production result | Scope |
|---|---|---|
| Coordinator and workers | Typed delegate_workers validates exactly Beacon and Crest at C2. Independent real-model workers used actual HydraDB searches and their own scoped grants. | Coordinator receives task/authority metadata, not client document bodies or generated app contents. |
| Generated applications | Both apps passed their five independent client-specific behavior checks and were delivered to the matching client. | Model confidence is not the checker. Generated output is a bounded workflow compiled through the fixed runtime. |
| Actual browser forms | Production artifacts were opened through the actual UI. USD 75,000 requires Procurement then CFO for Beacon, and Department Manager for Crest. | Demonstrates routing, not authenticated corporate approval identities. |
| Cross-client attachment | The production UI challenge rejected the foreign client's source before worker admission. | Operator-triggered boundary test, not a fabricated autonomous exploit. |
| JSON and HTML downloads | Both formats returned 200 with expected MIME/attachment names. JSON matched the stored workflow. Wrong-client request returned 400. | The delivered-artifact/client guard precedes either format. Downloaded data cannot be recalled. |

The production run repeated the core pair after the final build. It did not repeat every development scenario listed below.

## Additional development coverage, not mislabeled as production

- Beacon USD 49,999.99 and 50,000, plus Crest USD 100,000, behaved as specified in browser checks.
- Reassigning the consultant role retired Beacon's run and started a new Crest run using only Crest sources and its own grant. That interaction was observed in development with unchanged logic; it was not repeated in the final production run.
- Individual actual admitted-source edges were observed in the graph. These are stored input relationships, not inferred semantic or simulated success edges.
- Reset produced a blank new mission while retaining history. It was observed in development, not repeated in the final production run. No file deletion or revived authority is claimed.
- Local regression checks exercise grant expiry/reuse, adversarial source IDs, retirement races and restart behavior. They are not replaced by screenshot evidence.

## Saved evidence

[Production receipt](../../../outputs/demo/production-receipt.json), [production scene](../../../outputs/demo/production-demo.jpg), [scoped-grant scene](../../../outputs/demo/scoped-grants.jpg), [Beacon HTML](../../../outputs/demo/beacon-approval-app.html), [Beacon JSON](../../../outputs/demo/beacon-approval-app.json), [Crest HTML](../../../outputs/demo/crest-approval-app.html), [Crest JSON](../../../outputs/demo/crest-approval-app.json).

These artifacts exist and support the recorded outcomes. Screenshots and executable apps are not a completed video.

## Remaining deliverables

Video capture is unfinished. The browser CDP screencast attempt stalled for approximately fifty minutes and did not produce the final video; that capture path was dropped. A successful recording, review and upload remain owed. Use real waits or explicitly labeled time cuts, never invented completion states.

Public-content/dependency review, public MIT release and final submission remain pending. Dynamic reclassification remains stretch. Workspace and Stage are views of the same verified core. The isolated Temporal durability experiment does not change this architecture or its claim boundaries.
