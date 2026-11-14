# Hosted live demo

Bill selected the full live application on Vercel connected to the Mac backend through an authenticated tunnel on 2026-11-14. Boat and Temporal integration are paused. Deadline remains 2pm Pacific.

Vercel serves the UI and forwards explicit API/artifact routes. The Mac retains model workers, Hydra credentials, authoritative policy and SQLite. A separate loopback gateway on port 3093 checks a dedicated credential before forwarding to the local app on port 3090. Cloudflare's temporary tunnel reaches only that gateway. The original local app guard stays unchanged.

Vercel project clearance belongs to Trevillyan Labs. Its ssoProtection deploymentType is all, verified through the API. Every deployment/domain requires Vercel authentication. Only the Clearance session cookie crosses the proxy; Vercel authentication cookies do not. Source data and runtime SQLite are excluded from upload.

Credential storage decision is pending: the 1Password service account refused creation of a new bridge credential. Bill was asked to authorize encrypted Vercel environment storage plus in-memory local use for this temporary demo, or arrange the vault item. No bridge secret has been persisted or activated yet.

Validation so far: 42 source tests pass; local production build passes. Live deployment and authenticated tunnel acceptance remain pending. The temporary tunnel requires its local process and the Mac to remain running. This is a hosted test deployment, not an independently hosted persistent backend.

Deployment checkpoint: Vercel production build succeeded at https://clearance-dusky-three.vercel.app. Direct deployment is clearance-mwsziqg9w-trevillyan-labs.vercel.app. Both unauthenticated /api/company/state requests returned 302 to vercel.com/sso-api. Live proxy is intentionally unconfigured pending the storage decision. Do not describe this checkpoint as a working hosted live demo.

## Verified live connection, supersedes pending checkpoint above

Bill approved encrypted Vercel credential storage and in-memory local use. The bridge is active, with no secret stored in local files. Production deployment dpl_EdSeLuMVq9aiUMhqDrQfRAWWHKuG is READY at https://clearance-dusky-three.vercel.app/?view=stage.

Through that hosted browser URL, reset/start created five real model workers with HydraDB search. Pricing paused; clicking the exact-read approval resumed it. Both C3 apps passed 19 checks and were delivered internally. Public delivery was refused. Intern/chief-of-staff comparison worked. Both hosted apps opened; Beacon at 10% discount produced $63,000 fees and 33.333% margin, requiring review. Crest opened at $35,000 fees and $21,000 cost.

42 source tests and the Vercel build passed. Raw tunnel requests without its credential returned 401. Production alias and deployment requests without Vercel authentication redirected to SSO. Architecture and hosted labels were checked after the final deployment. An observed pending-approval status label was corrected to count working and awaiting_approval as active.

The Mac app, gateway and temporary tunnel must remain running. Boat/Temporal remain paused. Custom TL domain, final video and coordinated Vercel CLI token rotation remain outstanding. Evidence: outputs/hosted-demo/live-receipt.json and verified-workspace.png.

## Guided UI, verified November 14 before 2pm

Production deployment dpl_9ubQaSdYC27DBbSrqvSFUVY9y5WD adds a four-step progress strip, persistent latest-change message, prominent scoped approval panel, larger colored worker states, visible inspection/download labels and top-level New mission control. Connections are hidden until a worker is selected and show only that worker's admitted sources. Expired approvals are disabled and direct the operator to New mission.

TypeScript and Vercel production build passed. Browser verification on the production alias confirmed the existing expired approval, pricing input inspection, three pricing-only edges and zero edges after Clear selection. No mission reset or new inference was performed in this UI check. Evidence: outputs/hosted-demo/guided-workspace.png.
