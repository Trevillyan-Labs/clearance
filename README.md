# Clearance

One company brain. Five workers. Different clearances.

A fictional consulting firm uses client-bound workers to search a labeled synthetic Markdown brain through HydraDB, request narrow same-client read grants, and generate tested standalone approval apps. The same purchase routes differently under each client's policy. Wrong-client inputs and delivery are refused before they can cross the application boundary.

## Shared company brain revision

The approved five-worker proposal demonstration is implemented at `/`. It adds shared company knowledge, unequal worker clearances, scoped approval and an intern versus chief-of-staff policy comparison. Requirements and architecture are in [the revised PRD](docs/specs/company-proposal/prd.md) and [technical specification](docs/specs/company-proposal/tech-spec.md). The original verified demonstration remains at `/legacy`. The revised live run completed all five workers and two C3 partner applications; 37 tests and the production build pass. Browser comparison, architecture and calculators were verified. See [v2 verification](docs/specs/company-proposal/test-plan.md). Prior evidence below applies to v1 only.

## V1 status

Core prototype verified with explicit coverage limits. The production build repeated the live HydraDB/model flow for both clients, scoped grants, independent behavior checks and matching-client delivery. Actual production browser forms and cross-client refusal passed; HTML and JSON downloads passed their production probes. Fresh reassignment and reset were observed in development with unchanged logic, not falsely claimed as repeated in production. Video capture, public release and submission remain unfinished. The [test plan](docs/specs/prototype/test-plan.md) owns exact evidence and coverage.

One HydraDB database contains client collection namespaces. The local immutable Markdown wiki is canonical; workers get permitted complete document bodies, never its full checkout. HydraDB supplies ranked IDs; the server does not forward vendor snippets or enriched text. A metadata-only coordinator proposes assignments within server-owned ceilings. A simple source graph shows recorded reads and outputs.

## Run and verify

Node with SQLite support is required. Dependencies are declared in package.json.

- `npm test`: local checks using the configured tsx loader.
- `npm run typecheck` and `npm run build`: TypeScript and production-build checks.
- `npm run dev`: local development server on 127.0.0.1:3090.
- `npm run start`: serve the built production application at the same local address. The verified production process is currently running there; do not start a second process on that port.
- `npm run seed`: synthetic ingestion and real scoped-retrieval verification. Queued status is not reported as completed graph indexing.

Supply `HYDRADB_API_KEY` and `XAI_API_KEY` through runtime environment injection from a secret manager. For the verified run, set `CLEARANCE_HYDRA_DATABASE=default-tenant`; `default-tenant` is the actual HydraDB database value, with collections `client_beacon` and `client_crest`. The implementation fallback is `clearance_demo`, which is not the verified seeded database. Never put credentials into source or commit credential files. Use the same explicitly configured database as the verified seeded run; an unseeded default is not equivalent. The live UI does not substitute fixture search when HydraDB is unavailable. `scripts/model-smoke.ts` is a separately labeled model-only trial with fixture retrieval.

Open `/` for Workspace or `/?view=stage` for the compact recording view. Both use the same server state and actions. This localhost console belongs to a trusted operator with access to both fictional engagements; it is not a multiuser authentication demo.

## Prototype documents

- [Requirements](docs/specs/prototype/prd.md)
- [Technical design](docs/specs/prototype/tech-spec.md)
- [Test plan](docs/specs/prototype/test-plan.md)
- [Build plan and noon target](docs/specs/prototype/build-plan.md)
- [Decisions](docs/specs/prototype/decision-ledger.md)
- [Demo runbook and recording status](outputs/demo-runbook.md)
- [Saved production receipt](outputs/demo/production-receipt.json)
- [Saved production screenshot](outputs/demo/production-demo.jpg)
- [Outstanding work](TASKS.md)

MIT licensed; private until public-content/dependency review. Only new implementation, invented fixtures and public dependencies belong here. No private project designs/source, real client records or credentials. This is a controlled local prototype, not a production security platform or arbitrary-agent sandbox. One polished core precedes optional presentation variants; reclassification is stretch.
