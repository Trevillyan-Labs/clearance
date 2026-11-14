# Hosted live demo

Bill selected the full live application on Vercel connected to the Mac backend through an authenticated tunnel on 2026-11-14. Boat and Temporal integration are paused. Deadline remains 2pm Pacific.

Vercel serves the UI and forwards explicit API/artifact routes. The Mac retains model workers, Hydra credentials, authoritative policy and SQLite. A separate loopback gateway on port 3093 checks a dedicated credential before forwarding to the local app on port 3090. Cloudflare's temporary tunnel reaches only that gateway. The original local app guard stays unchanged.

Vercel project clearance belongs to Trevillyan Labs. Its ssoProtection deploymentType is all, verified through the API. Every deployment/domain requires Vercel authentication. Only the Clearance session cookie crosses the proxy; Vercel authentication cookies do not. Source data and runtime SQLite are excluded from upload.

Credential storage decision is pending: the 1Password service account refused creation of a new bridge credential. Bill was asked to authorize encrypted Vercel environment storage plus in-memory local use for this temporary demo, or arrange the vault item. No bridge secret has been persisted or activated yet.

Validation so far: 42 source tests pass; local production build passes. Live deployment and authenticated tunnel acceptance remain pending. The temporary tunnel requires its local process and the Mac to remain running. This is a hosted test deployment, not an independently hosted persistent backend.

Deployment checkpoint: Vercel production build succeeded at https://clearance-dusky-three.vercel.app. Direct deployment is clearance-mwsziqg9w-trevillyan-labs.vercel.app. Both unauthenticated /api/company/state requests returned 302 to vercel.com/sso-api. Live proxy is intentionally unconfigured pending the storage decision. Do not describe this checkpoint as a working hosted live demo.
