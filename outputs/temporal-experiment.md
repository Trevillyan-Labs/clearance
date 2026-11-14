# Optional Temporal experiment

November 14, 2026. Completed in an isolated temporary directory; not integrated into Clearance and not a noon dependency. No cloud account, service key, purchase, global installation or proprietary data. Boat was not provisioned.

**Measured result:** a synthetic Beacon workflow waited for an exact-source approval. A wrong-client signal left it waiting. The worker was killed with SIGKILL; the correct approval was then submitted while no worker was running. A new worker process replayed history and completed the workflow, preserving the earlier denial count.

The run took 10.366 seconds and recorded 15 history events, including a workflow-task timeout after the crash and eventual completion. This demonstrates recovery with a timeout, not instant failover. Official Temporal CLI 1.10.1, embedded Server 1.32.2 / UI 2.56.4, Python SDK 1.36.1 and Python 3.14.7 were used. The trial server was loopback-only and was stopped afterward; its process exited 0 and neither trial port remained listening.

**Meaning:** Temporal can preserve a paused approval workflow across a worker crash. The wrong-client check came from application logic, not a new Temporal confidentiality boundary. A future integration should store minimal metadata in history and recheck current client, source version, grant expiry and one-use authority at actual read admission. Remembered approval is not current authorization.

**Not tested:** server restart, cloud/distributed deployment, TypeScript integration, real HydraDB/model calls, expiry/reuse, production authentication, payload encryption, hostile-host isolation or durable external effects. No exactly-once business-effect claim.

Recommendation: retain the current small coordinator/store for the noon core. A later Temporal adoption needs an explicit integration and operations decision; this successful trial alone does not justify migration.

Local reproducible source, measured result and logs remain at `/private/tmp/clearance-temporal-trial`; no files were deleted. This report contains the publishable conclusion, not a dependency on that temporary directory.

Official references: [CLI setup and local service](https://docs.temporal.io/cli/setup-cli), [Python workflow message passing](https://docs.temporal.io/develop/python/workflows/message-passing).
