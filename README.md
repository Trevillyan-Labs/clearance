# Clearance

Build client software without crossing client context boundaries.

A fictional consulting firm uses client-bound workers to search a labeled synthetic Markdown brain through HydraDB, request narrow same-client read grants, and generate tested standalone approval apps. The same purchase routes differently under each client's policy. Wrong-client inputs and delivery are refused before they can cross the application boundary.

## Status

Build authorized and in progress. The backend, worker tool loops, scoped grants, workflow compiler and two UI views are implemented. Local tests and production build pass. A real model-only trial generated both correct apps using explicitly injected fixture search, and their HTML behavior was checked in a browser. Real HydraDB indexing/search and the complete integrated rehearsal remain pending. Fixture search is not live-service acceptance.

One HydraDB database contains client collection namespaces. The local immutable Markdown wiki is canonical; workers get permitted passages, never its full checkout. A metadata-only coordinator proposes assignments within server-owned ceilings. A simple source graph shows recorded reads and outputs.

## Run and verify

Node with SQLite support is required. Dependencies are declared in package.json.

- `npm test`: local checks using the configured tsx loader.
- `npm run typecheck` and `npm run build`: TypeScript and production-build checks.
- `npm run dev`: local development server on 127.0.0.1:3090.
- `npm run seed`: synthetic HydraDB ingestion once service access is configured.

Supply `HYDRADB_API_KEY` and `XAI_API_KEY` through runtime environment injection from a secret manager. Optional `CLEARANCE_HYDRA_DATABASE` defaults to `clearance_demo`. Never put credentials into source or commit credential files. The live UI does not substitute fixture search when HydraDB is unavailable. `scripts/model-smoke.ts` is a separately labeled model-only trial with fixture retrieval.

Open `/` for Workspace or `/?view=stage` for the compact recording view. Both use the same server state and actions. This localhost console belongs to a trusted operator with access to both fictional engagements; it is not a multiuser authentication demo.

## Prototype documents

- [Requirements](docs/specs/prototype/prd.md)
- [Technical design](docs/specs/prototype/tech-spec.md)
- [Test plan](docs/specs/prototype/test-plan.md)
- [Build plan and noon target](docs/specs/prototype/build-plan.md)
- [Decisions](docs/specs/prototype/decision-ledger.md)
- [Three-minute storyboard](outputs/clearance-consulting-review.md)
- [Outstanding work](TASKS.md)

MIT licensed; private until public-content/dependency review. Only new implementation, invented fixtures and public dependencies belong here. No private project designs/source, real client records or credentials. This is a controlled local prototype, not a production security platform or arbitrary-agent sandbox. One polished core precedes optional presentation variants; reclassification is stretch.
