# Clearance morning handoff

The core live demonstration works. The production server is running at [Stage view](http://127.0.0.1:3090/?view=stage), with both successfully generated applications delivered and a recorded cross-client refusal visible. [Workspace](http://127.0.0.1:3090/) gives the fuller inspection view. These are two presentations of the same system, not separate prototypes.

## What is ready

- Real HydraDB retrieval over twelve invented Markdown documents in one database, `default-tenant`, with `client_beacon` and `client_crest` collections.
- A metadata-only coordinator uses a typed delegation tool. Each worker receives a separate client-bound history and C2 baseline clearance.
- Each worker requests an exact, expiring, one-use read of its own C3 appendix. Granting it does not open the other client or promote the worker generally.
- Both real model-generated workflows pass five independent cases and compile into standalone HTML apps. At $75,000, Beacon requires Procurement and CFO; Crest requires Department Manager. Both final production apps were opened and verified in the browser.
- Recorded source-to-worker-to-artifact edges, actual context manifests, HTML and JSON downloads, client-bound delivery, and an operator-triggered cross-client refusal.
- Fresh reassignment and blank reset with preserved history were exercised during development. The production pair repeated successfully after reset and restart. No old grant was used to resume a worker.
- Twenty-three local tests and the production build pass. Live JSON matches its stored workflow; default HTML works; wrong-client download returns refusal. No CI pass is claimed.

The [test plan](../docs/specs/prototype/test-plan.md) owns the detailed acceptance evidence. [Production receipt](demo/production-receipt.json) records the final run. [Full demo screenshot](demo/production-demo.jpg) and [scoped-grant screenshot](demo/scoped-grants.jpg) show actual states.

## The morning demo

Use the [three-minute runbook](demo-runbook.md). Start with the current successful state to inspect the result. For a fresh take, click **New demo session**, then **Run both engagements**. Approve both requested reads promptly, deliver both apps, compare the same purchase, challenge the client boundary, and show fresh reassignment.

In the measured production run, source-readiness verification took about 2.6 seconds; both grant requests appeared within about 15 seconds of starting. Generation after each approval took under two seconds in that run. These are observed timings, not latency guarantees. The complete start-to-delivery interval was about 97 seconds including operator delays, leaving a practical three-minute story when rehearsed.

Downloadable examples are saved here: [Beacon HTML](demo/beacon-approval-app.html), [Beacon JSON](demo/beacon-approval-app.json), [Crest HTML](demo/crest-approval-app.html), [Crest JSON](demo/crest-approval-app.json). They contain only synthetic data and work without service keys.

## What remains

The final video is not recorded or uploaded. Browser screencast capture stalled, so no slideshow or fabricated sequence has been substituted. The actual app, screenshots and timed narration are ready for a normal screen recording.

The MIT repository remains private and the implementation is under [PR #1](https://github.com/Trevillyan-Labs/clearance/pull/1). Public release, merge approval and hackathon submission remain separate steps. The dependency declaration review is in [THIRD_PARTY.md](../THIRD_PARTY.md). Dynamic reclassification remains stretch and is not in the demonstration.

The isolated [Temporal experiment](temporal-experiment.md) passed approval wait, worker termination and durable resume with synthetic metadata. Temporal was not added to the core. Boat was not provisioned or integrated. Neither optional experiment is represented as part of the working Clearance security boundary.

## Operating notes

Credentials were read from the secret manager into process memory, not saved in source. The live database must be selected explicitly with `CLEARANCE_HYDRA_DATABASE=default-tenant` if restarting. Supply the two API keys through runtime injection and run `npm start` from the built checkout. Do not run a second server on port 3090.

The model ledger records 26 requests and about $0.46 reserved against the $20 ceiling at this checkpoint. That is a conservative application reservation, not a reconciled provider invoice. No purchase or plan upgrade was made.

HydraDB's source-status endpoint continued to report queued even when scoped queries returned every expected source. Startup verifies actual attributed retrieval; this does not establish completed graph indexing. The prototype is a trusted local operator console with bounded tools, not an independently authenticated enterprise deployment or a universal defense against arbitrary agents.
