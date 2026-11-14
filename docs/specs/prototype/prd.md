---
status: revised draft, awaiting scope acceptance
owner: bill
last_verified: 2026-11-14
---
# Clearance: software delivery without crossing client boundaries

## Problem and vision

A consulting firm serves multiple clients whose equally confidential records must not influence one another's work. A consultant may legitimately work on both engagements, but an agent already exposed to one client's information cannot be made clean by changing its permission label. Bill supplied this concrete use case on November 14. It is an opportunity hypothesis, not a production customer validation result.

Why-chain: building client software requires context; context includes private rules; reusable workers can carry previous client context; permission changes do not erase it; the firm risks wrong software and confidential disclosure. Stop at that addressable consequence, rather than a universal claim about trust.

Vision: reuse the firm's expertise and software tools while each engagement's private context stays inside its own work. The operator can deliver software for two clients without manually inspecting every retrieved passage.

## Noon experiment

Fictional Northstar Advisory builds vendor-purchase approval mini-apps for Beacon Manufacturing and Crest Industries. Both have a confidential document named Vendor Approval Policy and the same task: build the approval form and routing rules. Their policies differ. For an invented $75,000 purchase, Beacon requires Procurement and CFO approvals; Crest requires its Department Manager. All figures, firms and policies are invented and illustrate software behavior, not financial advice.

Two workers run in parallel. Each produces a runnable approval app and passes independent client-specific behavior checks. A judge attempts to insert Crest's policy into Beacon's context, sees the attempt rejected, and then reassigns the consultant role: a fresh worker starts, with no prior client's conversation. Generated applications remain usable in their own client previews.

A three-minute video is the creative target, not a verified duration requirement. Noon target is working software plus a rehearsable capture sequence. A rendered final video is a separate deliverable before submission unless completed earlier. Software generation/testing is central because official event theme fit is pass/fail.

## Authority model

Two independent dimensions: engagement compartment and sensitivity. Four levels remain Public, Internal, Confidential and Restricted. A worker belongs to exactly one engagement for its lifetime. Higher clearance never grants another engagement. A principal authorized for both engagements can start separate workers; no worker context is switched or merged.

Shared methodology is a tiny manually approved, immutable synthetic pack copied into each client corpus. No learned shared memory. Generated artifacts retain their engagement and the highest class of all inputs seen, including uncited inputs. The client preview is a scoped destination, not an unrestricted public publication.

## Requirements and acceptance

| ID | Outcome | Lean acceptance |
|---|---|---|
| R1 | Assign engagement and clearance at spawn. | Two independent initial workers, one per client. Model-supplied identity or client parameters cannot alter assignment. |
| R2 | Search actual HydraDB within the assigned client. | Same query retrieves appropriate policy per client. Every admitted source matches the run's engagement and clearance. Unknown IDs and wrong-client requests reveal no content/title to the worker. |
| R3 | Build working client software. | Each worker generates a bounded approval workflow, yielding an interactive amount form and approval routing. The same $75,000 input produces the two fixture-defined outcomes. Downloadable standalone HTML apps and workflow configs record what was generated; each app runs independently of Clearance. |
| R4 | Check generated behavior independently. | Each generated workflow passes below/at/above-threshold cases held separately from generation. A wrong threshold or wrong approver fails; passing is never inferred from model confidence. |
| R5 | Keep derived artifacts in their engagement. | Artifacts carry the full observed-input class and client. Attempted delivery to the other client's preview fails. Reading both clients in a common content-bearing manager context is not allowed. |
| R6 | Reject attempted cross-client context injection before generation. | A visible operator demonstration uses the same read-admission boundary as retrieval. The other client's document is refused, absent from actual model inputs, and legitimate work continues. Higher clearance does not change the refusal. |
| R7 | Reassignment creates a fresh worker. | Moving the consultant role ends/retains the old run separately and starts a new ID/history for the destination. New model payload has only destination-client/approved-methodology inputs, no prior response ID, drafts or summary. |
| R8 | Explain the real boundary and produce a repeatable demo. | Two client lanes show actual sources, worker assignment, input manifest, generated application, test outcomes and delivery state. Full sequence completes and resets without reviving old runs/grants. |
| R9 | Remain independently MIT-publishable. | New implementation, synthetic corpus, MIT license and dependency disclosure; no private project source/designs or client data. |

R1/R2/R5-R7 protect engagement-specific work; R3/R4 produce useful verified software; R8 makes the claim inspectable; R9 permits hackathon release.

## Explicit cuts from the first draft

Replace generic launch page, sales brief and pricing memo with two instances of one working approval app. Replace the global knowledge graph with two engagement lanes and real source trails. Replace public publication with client-scoped delivery. Two initial workers plus a fresh replacement suffice; three simultaneous roles add no evidence.

Document reclassification and within-client restricted-read grants are follow-ons, not noon acceptance. The app still enforces clearance at every admission. There is no cross-client exception or approve-anyway button. A legitimate future sharing workflow would require separately released material, not reusing a contaminated context.

## Non-goals and limits

No arbitrary code execution, general tools, user uploads, automatic document classification, semantic redaction, cross-client analytics, shared learned memory, multi-user enterprise authentication, external client deployment, provider isolation claim or malicious-host sandbox. Trusted operator can inspect both clients; the operator's view never becomes worker context. Fixed tasks prevent arbitrary operator-pasted secrets from being silently treated as Public input. Correct ingestion labels are an assumption to test, not an AI guarantee.

No production or universal zero-leakage claim. The measurable claim is that the supplied tools and input builder exclude other-client sources from each controlled run and refuse wrong-client delivery.

## Measurement and context

Record ordinary scoped read, deny, generation, test, fresh-run and delivery events. Inspect actual model-input manifests and client-specific tests; absence of a secret string in output alone is insufficient. Measure latency during rehearsal. A recording may use labeled time cuts, never invented completion states.

![A consulting operator requests two client applications; Clearance searches scoped knowledge and generates workflows, then delivers only to the matching client preview.](context.svg)

[Design](tech-spec.md) | [Demo and challenge review](../../../outputs/clearance-consulting-review.md) | [Delivery outlook](delivery-outlook.md)
