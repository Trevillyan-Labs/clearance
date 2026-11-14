# Operator interface verification

Date: November 14, 2026. Scope: the local operator workspace and optional Stage presentation. Application generation and vendor retrieval are separate qualification work.

## Observed in a real browser

Chrome loaded the integrated application at a 1440 by 900 desktop viewport. The server returned twelve synthetic source documents, model access configured and HydraDB access not yet configured. The interface displayed those exact conditions and kept the live mission action unavailable. No generated artifacts, successful runs or vendor results were fabricated for this inspection.

The source inspector opened the selected synthetic document. Escape closed the dialog. Workspace and Stage toggles changed presentation while retaining the same application state. The Stage presentation placed both engagement lanes, source nodes, worker/output slots and challenge controls within the desktop frame. At 390-pixel mobile width, the layout stacked without horizontal overflow.

The focused browser run recorded no page JavaScript errors and no HTTP responses at 400 or above. Source inspection and presentation changes did not start agents or alter the demo's run history. Screenshots were inspected locally; machine-specific paths are intentionally excluded from this publishable report.

## Adversarial contract review and changes

Review compared the interface directly with the run, grant, artifact and routing contracts:

- Older polling responses could overwrite newer state. Responses now carry local sequence order, and late older responses are ignored. Connection failures visibly mark stale state and disable state-changing controls.
- The coordinator's busy flag ends before worker execution does. The mission button now also checks active workers, avoiding a misleading offer to start another mission.
- Expired pending grants disappeared without explanation. An expired request now remains visibly expired with approval disabled. Retired workers do not offer grant approval, cross-client challenges or reassignment.
- A retained ready artifact could offer delivery after its originating run retired, although the server refuses that delivery. The button now requires the originating run to be completed and labels inactive origins explicitly. Already delivered artifacts remain scoped to their original client preview.
- A context inspector could retain an old run-status badge. Its badge now follows the current backend run state while preserving the selected run ID and manifest.
- Threshold formatting rounded away fractional currency amounts. Display now preserves cents where present.
- Coordinator startup errors now appear prominently, rather than only in the event trail. State-changing requests have a single-flight guard against rapid duplicate clicks.

Preview and download links include both artifact identity and their matching engagement. The server independently checks engagement and delivered state. Frontend checks are usability controls, not authorization substitutes.

## Accessibility and readability

The inspector supports focus entry, a keyboard focus loop, Escape dismissal and focus restoration. Controls use visible text or accessible names. Class and run status use words as well as color. Reduced-motion preference disables animation. Small-label foreground contrast was measured at 4.86:1 against its intended background; the four classification-label samples measured 5.41:1 to 5.83:1. These spot checks are not a complete accessibility audit.

## Verification and remaining work

`npm run typecheck` and `git diff --check` passed after the UI changes. The focused browser checks were repeated after the contract-review fixes and passed.

Still unexercised in the browser: populated grant expiry, successful live generation, generated artifact delivery, fresh reassignment and the final populated Stage frame. Those require real run state and service access. The related UI fixes were derived from backend-contract inspection; this report does not claim those runtime paths passed. No simulated populated state was substituted for that missing evidence.
