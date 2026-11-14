# Company brain retrieval readiness

Observed November 14, 2026. Database: `default-tenant`.

The live build reported accepted ingestion but empty scoped query results around four minutes after seeding. The seed then verified all seven sources through actual queries before its five-minute deadline. These elapsed values are approximate observations from the coordinating run, not a separately instrumented duration measurement.

An independent diagnostic immediately afterward returned HTTP 200 and `completed` indexing status for all seven sources. Queries with the exact company C0 through C3 ACL principals returned five sources from `company_firm`, one from `proposal_beacon`, and one from `proposal_crest`. The existing `client_beacon` collection still returned six sources. A synthetic-only diagnostic without an ACL returned the same new-source counts; that diagnostic does not change the application's mandatory scoped query policy.

The evidence supports indexing latency as the cause of the initial empty results. No adapter, architecture, fixture fallback, or ingestion retry was introduced. An accepted ingestion response alone remains insufficient readiness evidence. The adapter waits for attributed retrieval of every expected source and fails after its bounded deadline.

The diagnostic emitted only HTTP status, collection names, synthetic source IDs, indexing status, and counts. Credentials stayed in memory and provider error bodies were not printed.
