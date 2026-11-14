---
status: revised proposed design, not approved or implemented
owner: bill
last_verified: 2026-11-14
---
# Clearance: immutable engagement workers

## One page for Bill

Build two working vendor-approval mini-apps for a fictional consulting firm's clients. The same task and same transaction yield different correct behavior because each worker sees only its client's policy. Show an attempted cross-client read rejected, then demonstrate that reassigning the consultant role starts a fresh context.

1. **One engagement per worker, forever.** Bind client, clearance and destination at spawn. No switch-client tool and no cross-client grant. This removes a major class of contamination paths rather than adding approval screens.
2. **One HydraDB collection per client.** The trusted server fixes query scope and checks every returned source again before context admission. Approved common methodology is copied into each small corpus. Higher clearance never changes collection. Account credentials remain server-only.
3. **Generate a bounded application.** The model writes an approval-workflow configuration. A deterministic compiler emits a standalone HTML app using a small trusted runtime; independent fixture cases check behavior. No arbitrary model-generated scripts execute. The downloadable app, configuration and functioning form show exactly what was built.
4. **One local application and state store.** Next.js/TypeScript plus SQLite, two client lanes and client-scoped previews. Local policy and input manifests remain explicit. No general policy engine, graph database, event bus, cloud deployment or shared memory.
5. **New MIT work only.** Invented clients/documents and fresh code. The repository stays private until public-content/dependency review. No proprietary assets are copied. Use existing service access; the previously proposed $20 application-inference ceiling remains a proposal, not approval or a purchase.
6. **Reduced noon scope.** Two initial workers and one fresh replacement, one app type, cross-client denial, actual model-input inspection, behavior tests and matching-client delivery. Dynamic reclassification and scoped read grants move out of the noon slice. The same sensitivity checks still apply to every read.

One-off demo, with focused rigor on read/delivery boundaries and actual generated behavior. No production-security or general app-generation promise. No build authority inferred from the request to improve this design. [Delivery outlook](delivery-outlook.md) owns estimates.

## Approach and measured baseline

A trusted local server owns two engagement contexts. HydraDB ranks documents in a fixed client collection. The broker accepts only attributable source IDs, resolves them to canonical immutable synthetic bodies, checks client and sensitivity, and records every admitted input. The model emits a bounded workflow configuration. Validation, independent behavior checks and client-scoped delivery produce the running mini-app. The operator UI reads state but does not orchestrate through a model that sees both clients.

Baseline: private MIT repository and design documents only. No application code, live HydraDB probe, model connection or latency measurement. Separate collection scoping and source provenance are documented capabilities awaiting live qualification. A collection is an application scoping mechanism, not proof of vendor infrastructure isolation.

![Client-bound workers use a trusted scope-checking broker; generated workflows are tested and delivered only into their matching client lane.](architecture.svg)

Legend: [NEW] means prototype component; [EXTERNAL] means existing vendor service.

## 1. Immutable run and data contracts

**1.1 Run, a contract.** Trusted server creates runId, engagementId, clearance 0..3, fixed taskId, collection and destination. None is accepted from model tool arguments. No client rebinding of existing run. Control routes require local operator session and same-origin checks; bind loopback. Worker has no HTTP, filesystem, shell or broad MCP tool.

**1.2 State, a contract.** SQLite stores engagements(id,collection), documents(id,engagementId,contentVersion,class,bodyHash,fixturePath), runs(id,engagementId,clearance,status), observed_inputs(runId,docId,contentVersion,classAtRead), artifacts(id,runId,engagementId,inheritedClass,workflowJson,status), deliveries(id,artifactId,engagementId), events(id,runId,type,sourceId,artifactId,timestamp). Fixture contents/policy are immutable for an active demo session. Missing ownership/class or unknown ID fails closed. Source IDs cannot select arbitrary filesystem paths.

**1.3 Admission, a control.** Require source.engagementId == run.engagementId AND source.class <= run.clearance AND active run. In one synchronous SQLite transaction validate and record observed input. Handoff only to that run's context. Denials return a generic reason with no other-client body/title. Sensitive details remain in privileged operator diagnostics. No global summary or cross-client cache. No cache at all in noon scope.

**1.4 Ingestion, a control.** Separate manifest and fixture folder per client; validate unique versioned IDs and ownership before ingesting into its collection. Copy only the manually approved synthetic methodology fixture into both with client-owned IDs. No model-generated content may enter this shared pack. Ingested IDs/body hashes must match the canonical fixture manifest. Badly labeled source data is a known threat; sentinel checks cover intended routing, not automatic semantic classification.

## 2. Retrieval and worker execution

**2.1 Search, a contract.** search_brain(query) is bound to server-owned run identity. Query exactly its fixed collection, type knowledge, mode fast, graph_context false, query_apps false and nonempty derived ACL for allowed class principals. Never accept collection IDs from the model or query multiple client collections. Never omit ACL or use wildcard. Empty scope yields empty without querying.

HydraDB provides ranked IDs. Discard raw chunk text, titles, graph enrichment, summaries and vendor error bodies. Deduplicate IDs preserving rank, verify ownership/version/class against local manifest, and provide at most four permitted canonical bodies totaling 12,000 characters. An injected wrong-client ID in a vendor response is refused. This is real HydraDB retrieval/ranking with local canonical bodies, not a local-search fallback or vendor-authorized policy claim.

**2.2 Worker, a behaviour.** Separate explicit model histories, fixed synthetic task and permitted inputs only. No prior response/conversation ID, shared assistant memory or previous worker output. Tools: search_brain(query), submit_workflow(payload). At most six model requests per attempt, 20-second search/60-second model timeout, one bounded retry. Model/API exact version and costs pinned after service qualification. Only server counts budget; no upgrade/purchase on exhaustion.

**2.3 Demonstration of denial, a behaviour.** Operator can attempt to attach a source card to a run. This calls the exact same admission function as search, using trusted run/source IDs. Source contents never enter an LLM before that call. UI explains that this is an operator-triggered tool-boundary test, not a claimed autonomous model exploit. Wrong-client attachment is rejected even at Restricted clearance. The test remains visible and the valid run continues.

**2.4 Fresh reassignment, a behaviour.** Reassign role ends the old run, retains its artifacts under its original client and creates a new run for the selected engagement. The new prompt is the public fixed task plus new-client admitted sources only. Never transfer old draft, summary, tool response or hidden continuation state. Ignore late results from ended runs. Same operator identity does not imply shared agent history.

## 3. Bounded software factory

**3.1 Workflow schema, a contract.** Model outputs title (bounded text), currency=USD, thresholdCents (nonnegative bounded integer), belowApprovers and atOrAboveApprovers (nonempty unique arrays from Procurement, CFO, Department Manager). Unknown fields, role names, code, markup or external URLs are rejected. Fixed rule: amountCents < thresholdCents chooses belowApprovers, otherwise atOrAboveApprovers. Fixed input is an integer number of cents; UI parses currency without floating point ambiguity.

**3.2 Generated application, a behaviour.** Valid configuration creates an interactive purchase-amount form and routing/result view. Known interpreter applies generated threshold/roles. The compiler emits a standalone HTML app plus its JSON configuration, both through the client-scoped delivery gate. Embed validated configuration as inert JSON with HTML-sensitive characters escaped. Use one fixed trusted JavaScript runtime and textContent for model text. No model-authored executable code or raw HTML. No network calls, secrets or external assets in the exported app. This is domain-specific application compilation, not arbitrary software generation. The runtime is built during the hackathon; the generated definition supplies each client's behavior. Required-role approval buttons are explicitly simulated, not authenticated approver identities.

**3.3 Independent checking, a control.** Client-specific fixture cases are authored independently of generation and not handed to the model as expected answers. Cases cover below, exactly at and above the policy threshold; compare exact approver sets. The visible $75,000 example is an additional common transaction, not the only check. Exercise it in each exported HTML app in a browser too. The compiled app and checked routing function share the same runtime source; testing configuration alone does not establish that the exported UI works. Mutation of threshold/roles must fail at least one relevant boundary test. A failing configuration is shown as failing and not delivered; one bounded fresh regeneration may be attempted. Do not let model-generated tests certify its own output.

**3.4 Inheritance and delivery, a control.** Artifact engagement equals run engagement. Inherited class includes all admitted inputs, not final citations. In one synchronous transaction validate the run is active/completed-valid, all input IDs still belong to that engagement/version, workflow passes independent checks, and destination engagement equals artifact engagement; then record delivery. No asynchronous gap between check and commit. Preview and app/config download routes are scoped to the destination and reject guessed other-client artifact IDs. Downloaded client-confidential apps cannot be recalled. Delivery does not declassify an artifact. The local privileged operator can switch previews, but previews never receive other-client state.

## 4. Interface, lifecycle and limits

**4.1 Two rooms, a behaviour.** Beacon and Crest lanes contain documents, immutable worker assignment/clearance, actual input manifest, generated workflow and real test outcomes. Shared method appears as two approved copies from one fixed source. Visual trails come from admission events. Wrong attachment is rejected at the boundary; reassigning a role creates a visibly empty context before new sources enter. No giant force-directed graph.

**4.2 Reset, a behaviour.** New demo session interrupts active runs; new IDs are used. Late results cannot attach to new runs. Preserve prior artifacts/history, with no file deletion or reuse of a previous client's context. On restart, in-flight workers become interrupted. No persistent agent resume needed by noon.

**4.3 Credentials and errors, a control.** Existing runtime secret manager only; no credential files, stdout or browser-exposed keys. No provider retention or training guarantees inferred from separate contexts. Missing HydraDB/model access is an early explicit blocker. No silent search replacement. Trusted operator/host remains able to inspect all synthetic data; this is not hostile-host isolation.

## Minimal implementation map

All new: lib/db.ts (small state), lib/scope.ts (run/admission/delivery checks), lib/hydra.ts (scoped ingest/query), lib/workers.ts and lib/model.ts (fresh bounded contexts), lib/workflow.ts (schema/interpreter/checks), lib/compiler.ts (standalone HTML export), fixtures/beacon and fixtures/crest (corpus), fixtures/acceptance (independent cases), components/client-lanes.tsx and app/page.tsx (operator), app/client/[engagementId]/page.tsx (scoped preview), local authenticated API routes. Exact package versions await initial probe. No existing proprietary implementation is reused.

## Alternatives and constraints

One collection with a mandatory client filter is flexible but has more opportunities for omission. Separate client collections plus immutable binding remove client selection from the worker surface. Still check each returned ID, since backend credentials can reach both collections and routing bugs remain possible. Four sensitivity levels stay as an independent comparison, not a general policy language.

Retain a tiny SQLite manifest for context/delivery evidence and lifecycle; cut grants, dynamic labels, graph engine, cross-client release and global orchestration intelligence. This is scope reduction, not a claim about sufficient controls for production consulting.

## Public references and unresolved facts

[NIST ABAC guidance](https://csrc.nist.gov/pubs/sp/800/162/upd2/final) supports separate subject/resource/action attributes. [HydraDB guide](https://docs.hydradb.com/llms.txt) documents collections, scoped retrieval and source IDs; live configuration remains untested. [Event rules](https://evolve-8090.devpost.com/rules) make software-building theme fit mandatory. No real consulting firm data, policies or endorsement are used.
