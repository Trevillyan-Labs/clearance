---
status: implemented core verified with stated coverage
owner: bill
last_verified: 2026-11-14
---
# Clearance technical design

## One page for Bill

Build two runnable vendor-approval mini-apps for a fictional consulting firm's clients. The same task and transaction give different correct results because each worker receives only its client's policy. Show a narrow read approval, refusal of another client's source, and a fresh context when the consultant role is reassigned.

1. **One client per worker.** A metadata-only coordinator model proposes assignments and clearances; the server enforces client/clearance ceilings. Bind authority for the lifetime of each run. No switch-client tool, shared conversation or cross-client grant.
2. **One Markdown brain and one HydraDB database.** Client collections are namespaces inside that database. Every immutable wiki file carries explicit client/class/version labels. HydraDB supplies real search/ranking; the server resolves permitted IDs to canonical local text. Workers never get the full checkout. Git branches are not confidentiality controls.
3. **Narrow exceptional access.** Initial workers default to Confidential (C2). A Restricted (C3) read needs a one-use, five-minute, same-client/source/run/version grant. This does not change baseline clearance or release the resulting content.
4. **Bounded software generation.** The model emits a small workflow configuration; a deterministic compiler produces standalone HTML using a trusted runtime. Independent fixture cases check the generated behavior. No arbitrary generated scripts execute during construction.
5. **One local application.** Next.js/TypeScript, SQLite, two client lanes, a simple graph of recorded source reads, client previews/downloads. No graph database, event bus, dynamic wiki writer or content-bearing global manager. Boat and Temporal are optional explored ideas, not dependencies.
6. **Independent MIT work and a polished core first.** Invented data and fresh source only. Public release follows content/dependency review. Use existing authorized access within a maximum USD 20 application-inference ceiling; no purchase or upgrade. HydraDB promo eligibility is not an API key. Prioritize the complete core demo, then a second presentation variant only if time remains. Reclassification is stretch.

Bill authorized the compressed process: write the lean plans and implement bounded phases without routine approval prompts. Material boundary/scope changes remain decisions to surface. This is a one-off prototype with focused rigor at context and delivery boundaries, not a production security platform. [Build plan](build-plan.md) owns estimates and progress.

## Approach and current evidence

The local server owns immutable engagement runs. The coordinator receives only allowed engagement/task IDs, ceiling and run status; it proposes assignments, not access grants. Each worker has its own model history. Search returns ranked source IDs from its fixed HydraDB client collection. The broker resolves IDs to labeled Markdown bodies, validates access, and records all admitted inputs. Generated workflow JSON is validated, independently checked, compiled and delivered only to its matching client.

The final production build has repeated indexed retrieval, coordinator/worker calls, scoped grants, independently checked apps and matching-client delivery. Production browser and download probes passed. Reassignment/reset and additional routing boundaries retain their development-run evidence; they are not claimed as repeated production checks. The [test plan](test-plan.md) owns exact coverage and remaining release deliverables. HydraDB status polling remains queued even though scoped queries retrieve the expected sources; no completed graph-indexing claim follows. One collection namespace is not proof of vendor infrastructure isolation.

![A metadata-only coordinator proposes client-bound workers; trusted scope checks mediate indexed wiki reads and grants, and tested software reaches only its matching client.](architecture.svg)

Legend: [NEW] identifies prototype components; [EXTERNAL] identifies vendor services.

## 1. Authority and wiki

**1.1 Coordinator and run, a contract.** Coordinator model input is fixed task metadata, allowed client IDs, task clearance ceilings and coarse run status. Exclude client source titles/bodies, thresholds, generated workflows, drafts and expected test answers. Its typed delegate_workers tool call must contain exactly one Beacon worker and one Crest worker, each at C2. The server validates the exact allowed client set, uniqueness, count and clearance; no model can raise the ceiling or add a worker. The server creates run ID, engagement, clearance, collection and destination. Workers cannot rebind these fields. Operator routes are local/session-controlled with same-origin checks; bind loopback. Worker has no general HTTP, filesystem, shell or MCP toolbox.

**1.2 State, a contract.** SQLite stores typed logical records in one small records table: source labels/versions/hash, runs, grants, observed inputs, artifacts and events. Runs are active, completed, retired or interrupted. Artifacts are ready, failed or delivered. Each source has engagementId, classification, contentVersion and policyVersion; each observed input records the exact versions and class seen. The store returns deserialized copies, not mutable authority objects. No distributed transactions or queue.

**1.3 Wiki, a contract.** The canonical brain directory contains beacon and crest Markdown folders. Frontmatter fields: id, title, engagement, classification 0..3 and version. Parser validates known ownership against folder, unique IDs, explicit class/version, bounded body and no symlinks. Manifest adds content hash and policyVersion. Content and labels are immutable during the noon session. No worker receives or browses the full wiki. Approved common methodology is copied into both clients using separate client-owned IDs; generated output cannot enter that shared pack. Correct source labeling remains an assumption tested on synthetic fixtures, not automatic semantic classification.

**1.4 Admission, a control.** Require active run, exact matching client and either sufficient baseline clearance or an exact unused/unexpired read grant. In one synchronous transaction validate source/run/version, consume a needed grant and record the observed input. No await separates those operations. Return canonical text only after admission. Wrong-client/unknown requests give the worker no foreign title or body. Model claims and git branch names supply no authority.

## 2. Retrieval, grants and fresh contexts

**2.1 HydraDB, a contract.** Seed the labeled wiki into the verified HydraDB database default-tenant, using client_beacon and client_crest collections. This is the database field value reported by GET /databases, not a collection or vague tenant label. Configure the runtime to this database explicitly; the implementation fallback clearance_demo is not the measured seeded scope. Poll status and separately verify that real scoped retrieval returns the expected source IDs. In the measured service, status remained queued while C3 queries returned all expected sources for each client. The seed check verifies actual retrieval coverage; it does not report graph indexing as completed. Every search derives database/collection from trusted run state, never tool arguments. Use knowledge retrieval, fast mode, graph_context false, query_apps false and explicit nonempty email-shaped synthetic clearance ACL principals, derived server-side from client and class. These are identifier strings, not email delivery addresses. No missing, empty or wildcard ACL; no multi-client collection query. Empty allowed scope returns empty without querying.

Accept ranked source IDs only; discard vendor text, titles, graph enrichment, summaries and raw error bodies. Deduplicate in rank order, verify source identity/version/client, then admit eligible complete canonical Markdown bodies from the fixed small corpus. Permission is document-level. No vendor snippets, enriched answers or arbitrary-path reads enter worker context. A wrong-client ID returned by the vendor is denied again. No local-search replacement is presented as live HydraDB. Class/collection request shape has local coverage and real scoped retrieval has now been exercised. Queued status remains a vendor-observation limit. The final production C2 searches and exact scoped reads have been exercised; this does not establish completion of background graph indexing.

**2.2 Worker, a behaviour.** Each worker has an explicit fresh xAI tool-calling history constructed from its fixed task and admitted inputs. No prior response ID, shared assistant memory, old draft or other worker output. Tools search the fixed client brain, request a same-client source capability, and submit bounded workflow JSON. At most six model requests per attempt, 20-second search timeout, 60-second model timeout and one transient retry inside the cap. Server tracks usage and the accepted ceiling. Provider failure is reported, not disguised as successful generation.

**2.3 Grant, a control.** Request maps to a server-known same-client Restricted source, not an arbitrary path or client override. Pending grant fixes run, client, source/content/policy versions and five-minute expiry. Operator approves once. Admission consumes once; baseline clearance stays C2. Different run/client/version or expired/reused grant is denied. Output inherits the Restricted input even if uncited. Retiring or restarting an active run expires pending authority. A worker waiting for approval does not stop the other engagement.

**2.4 Wrong-client demonstration, a behaviour.** Operator tries to attach a foreign source card through the same admission function used by retrieval. Refusal occurs before any body reaches the model. The UI labels this as an operator-triggered boundary test, not an autonomous attack invented by the model. Higher clearance does not bypass client ownership. Valid work continues.

**2.5 Reassignment, a behaviour.** End the old run, retain its history/artifacts under its original client, and start a new run with a new history. No old summary, draft, tools, source text or continuation handle transfers. Ignore late responses from retired/interrupted runs. Same operator identity does not imply shared worker context.

## 3. Generated software and delivery

**3.1 Workflow, a contract.** Fields: bounded title, currency USD, positive safe-integer thresholdCents from 1 through 1,000,000,000,000, belowApprovers and atOrAboveApprovers. Role arrays are unique/nonempty and drawn from Procurement, CFO and Department Manager. Reject unknown workflow fields and unsupported roles. Title is bounded plain text: markup-looking characters are escaped on output, never interpreted as HTML or executable code. The validator does not claim semantic detection of dangerous prose. Integer cents below threshold use belowApprovers; at/above use atOrAboveApprovers. Currency input parsing avoids floating-point ambiguity.

**3.2 Compiler, a behaviour.** Valid workflow becomes an interactive amount form and routing view. Export one standalone HTML app and its JSON configuration. Configuration is embedded as inert escaped JSON; the fixed trusted runtime uses textContent. No model-authored executable code, network calls, secrets or external assets in the export. This is domain-specific application compilation, not arbitrary coding. Any approver buttons represent an explicitly labeled simulation, not authenticated identities.

**3.3 Independent checks, a control.** Client cases are written independently of generation and never handed to the model as expected answers. Below/at/above threshold and the shared USD 75,000 transaction compare exact policy-defined approver sequences. Beacon explicitly requires Procurement followed by CFO; the order check is intentional. Valid-but-wrong-client configuration fails its client's checks. The exported runtime implements the same bounded routing rule as the checker; its browser behavior is verified separately rather than inferred from configuration checks. Failed/empty check results cannot deliver. At most one bounded fresh regeneration, never relabel a failed workflow as passing.

**3.4 Inheritance and delivery, a control.** Artifact client comes from the run; class is at least the highest class of all observed inputs. Finalization validates active run and full input versions in one synchronous transaction before saving. Delivery in another synchronous transaction requires completed-valid run, matching destination, unchanged input ownership/versions and passing checks. No await between check and state commit. Destination ceiling is Restricted (C3) inside that same client, not declassification. Preview/download routes require matching-client eligibility, including guessed artifact IDs. The privileged operator can view both lanes, but a scoped preview receives only its own artifact. Downloaded information cannot be recalled.

## 4. Presentation and lifecycle

**4.1 Console and graph, a behaviour.** Two client lanes show document labels, immutable worker authority, pending grants, admitted-input manifest, generated app and checks. A fixed-layout graph draws source-to-worker-to-artifact edges from stored admission/artifact events. No fake progress or inferred cross-client semantic edges. The coordinator panel exposes metadata planning only. Color is accompanied by text.

**4.2 Reset and restart, a behaviour.** New demo uses new IDs; no history/file deletion or authority resurrection. Retire old active runs and expire grants. On server restart active runs become interrupted. Completed artifacts retain client ownership; no automatic agent resume. Dynamic label changes and reclassification are excluded until the core passes.

**4.3 Access and failure, a control.** Fetch existing credentials through the approved runtime secret mechanism, never commit/print/write them or expose them in a browser. A sponsor promo is not a credential. Real service access is now configured for the development run; future missing access must still stop live execution rather than silently substitute fixture search. Offline fixture mode, if used for UI checks, is visibly labeled and cannot satisfy real-service acceptance. No provider training/retention or hostile-host isolation guarantee is inferred.

## Implementation and alternatives

Implemented source seams: lib/types.ts, lib/store.ts, lib/brain.ts, lib/hydra.ts, lib/workflow.ts and brain/beacon plus brain/crest. Runtime/model adapter, local routes and Workspace/Stage views are integrated. JSON and HTML downloads passed production probes with matching configuration, MIME/attachment names and wrong-client refusal. Bounded transient retry is implemented and included in the final consolidated source checks. Video, public release and submission are not completed. The store also supplies the graph, so no second provenance service is needed. No private implementation is reused.

One universal collection plus client filters is flexible but adds omission risk. One database with separate client collection namespaces and immutable run binding removes client selection from workers while preserving one index service. Recheck returned source ownership because trusted backend credentials can still access both collections. Boat and Temporal are not needed for this bounded lifecycle; adopting either would be an explicit later choice.

[Test plan](test-plan.md) | [Build plan](build-plan.md) | [Decisions](decision-ledger.md)

Public references: [NIST ABAC](https://csrc.nist.gov/pubs/sp/800/162/upd2/final), [HydraDB guide](https://docs.hydradb.com/llms.txt), [event rules](https://evolve-8090.devpost.com/rules). No real consulting firm data or endorsement is used.
