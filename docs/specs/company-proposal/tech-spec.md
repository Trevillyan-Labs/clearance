# Shared company brain technical specification

Status: implemented and locally qualified, 2026-11-14. V1 modules and routes remain intact.

## Architecture
Browser operator console -> local Next.js Node server -> policy store -> HydraDB ranked IDs -> authoritative Markdown content -> isolated worker model history -> strict contribution schema -> trusted proposal assembler -> restricted partner artifact.

The coordinator holds task metadata and starts five fixed server-authorized worker profiles. It does not receive a global client corpus or delegate arbitrary privileges. Each worker owns an independent message history. These are conversation boundaries inside one process, not VM isolation.

One existing HydraDB database contains company_firm, proposal_beacon and proposal_crest collections. Every query uses server-selected scopes and email-shaped class ACLs. Returned IDs are rechecked against current local labels before any source body enters a model prompt. Provider snippets, titles and graph context are not trusted as authority. No fixture fallback disguises failed live retrieval.

A separate SQLite company store persists mission state, source admissions, grants, contributions, artifact manifests and audit events. Restart interrupts unfinished workers and expires grants. Reset archives prior missions. Immutable source fixtures avoid relabeling races in this prototype.

Grant approval is a local operator action. The pricing worker may request only the named discount-policy capability; server maps it to one source. Admission consumes the approved grant once. Already admitted context is not erased by expiry. New work requires a fresh context to remove previously seen information.

Strict role schemas bound every contribution. Assembly selects shared roles and exactly one client role, never the other client's contribution. It inherits admitted source restrictions and compiles escaped data into a fixed interactive HTML calculator. Commercial-policy reviewer separately supplies constraints, checked against pricing contribution. Margin decisions use exact integer arithmetic.

## Deployment view
Implemented: Vercel UI and authenticated proxy reach a persistent Mac Node process through a temporary authenticated tunnel and gateway. Markdown and SQLite remain local; HydraDB and the model API are remote. See [hosted deployment decisions and verification](../hosted-demo/decision.md).
Proposed: Remote Boat VMs would run delegated workers and call the same policy gateway. VMs would receive scoped capabilities, not HydraDB administrator credentials or the entire brain. Temporal is an independently tested experiment, not part of the implemented orchestration.

The localhost guard is retained behind the gateway. The hosted demo requires Vercel authentication and the Mac, gateway and tunnel to remain running. Durable hosting and a custom domain remain follow-on work; merely publishing the local routes is not sufficient.

## Prototype checks
Policy tests cover scope before class, grant consumption/expiry, output inheritance and audience. Compiler tests cover exact financial boundaries and foreign-client exclusion. Live qualification must exercise real Hydra retrieval, five model workers, approval resume, both calculators and browser architecture/comparison views. State and browser evidence must distinguish implemented behavior from future topology.
