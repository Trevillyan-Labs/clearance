# Copyable prompt for the video generation or editing tool

Create THREE OPTIONAL BACKUP EXPLAINER CLIPS for a three-minute hackathon video about Clearance. These clips cover only the problem, actual architecture, and closing takeaway. The main product demonstration will be real screen recordings supplied separately. DO NOT recreate, simulate, replace, or invent any product UI, agent execution, approval interaction, calculator, test result, or permission result.

Deliver three separate silent clips. No voiceover, music, sound effects, or captions of the full narration. A separate ElevenLabs voiceover is the primary audio. The approved narration below is a timing and meaning reference only. If an audio track is supplied, align visual beats to that track without changing its words. If unavailable, use the specified 21-second clip lengths.

## Output format and visual consistency

- 16:9, 1920 × 1080, 24 frames per second, MP4 H.264, silent, exactly 21 seconds per clip. Keep important text within a 90-pixel safe margin.
- Theme: warm off-white canvas (#F5F4EE), deep forest teal (#244A46), charcoal text (#263331), restrained sage (#9BAE9B), muted gold (#B99148). Use gold for a permission boundary or moment of emphasis, not a general glow.
- Clean technical editorial design: ample whitespace, crisp lines, flat document cards, restrained rounded corners, subtle paper texture if any. Confident and practical, never futuristic spectacle.
- Typography: one clean sans-serif family such as Inter or a close equivalent. Large readable titles, short labels, no tiny technical text. Use a restrained monospaced face only for small classification labels such as C1 and C3. Maintain identical type, spacing, line weights and palette across all three clips.
- Motion: gentle fades, short linear or eased connector reveals, subtle focus highlights, no frantic camera movement. One idea at a time. Keep diagrams stable once revealed so viewers can read them. Do not animate an action as if it were an observed product result.
- No generic robots, androids, glowing brains, neon cyber-security shields, Matrix code rain, stock office people, holograms, military insignia, or fake terminal output.
- Use text-only branding: “Clearance” and “Trevillyan Labs,” unless authorized logo files are explicitly supplied. Do not fabricate logos for these or any vendor.
- “Northstar Advisory” is a fictional consulting firm. “Beacon” and “Crest” are fictional clients. Use those exact names consistently. All illustrated document contents must be generic synthetic placeholders. No real client data, personal information, credentials, browser sessions, authentication URLs, private repository links, or unprovided social handles.

## Clip 1: Problem and introduction

Filename: `clearance_01_problem_21s.mp4`
Placement in assembled film: 00:00–00:21.

Approved narration, reference only:

“A software factory needs your company's knowledge. But should every agent get the whole company brain? Your intern shouldn't see executive strategy. Your client teams shouldn't share confidential briefs. This is Clearance, built by Bill at Trevillyan Labs: useful autonomous agents, with precise permissions.”

Visual sequence:

- 0–5 seconds: title “A company brain. Many different responsibilities.” Reveal a simple central stack of document cards labeled “Northstar Advisory / Shared knowledge.” Surround it with small text-labeled roles, not people or robots.
- 5–11 seconds: highlight two company document cards: “Delivery method / C1” and “Executive strategy / C3.” Show an “Intern” role nearby and a clearly drawn boundary around the executive document. This is a conceptual illustration of differing access needs, not a product access-check screen.
- 11–16 seconds: show “Beacon client brief” and “Crest client brief” in separate labeled compartments beneath the same company knowledge heading. Give the compartments equal weight. Shared company knowledge remains above them. Do not imply a client-scope boundary is the only restriction.
- 16–21 seconds: simplify into title “Clearance” and subtitle “Useful agents. Precise permissions.” Small attribution “Built by Bill at Trevillyan Labs.” Hold for readability.

## Clip 2: How the actual prototype works

Filename: `clearance_02_architecture_21s.mp4`
Placement in assembled film: 02:12–02:33, or seconds 132–153.

Approved narration, reference only:

“Vercel serves the interface. An authenticated tunnel reaches the orchestrator on a Mac. Hydra D B searches the labeled Markdown brain. Policy checks scope and clearance before content enters separate worker histories. Real model calls, one process, and recorded approvals.”

Show a readable conceptual architecture diagram, not a screenshot of an invented application. Use these facts and only these facts:

1. Operator browser → Vercel interface/server proxy → authenticated tunnel → Mac gateway → trusted orchestrator on the Mac.
2. The Mac application contains local labeled Markdown documents, a read/grant policy check, separate worker histories, and a local SQLite state store recording workers, grants, inputs and artifacts.
3. HydraDB is the retrieval service. It searches the labeled brain and returns ranked source IDs. Local policy determines which canonical document bodies enter each worker's model history. HydraDB is not the permission authority.
4. Read admission requires BOTH client scope AND classification clearance, or a valid narrowly scoped read grant. Show the policy boundary BEFORE worker context.
5. Actual model calls use separately constructed histories within ONE application process. The histories are not separate VMs, machines, or separate security domains. Do not draw them as physically isolated servers. The model provider is external to the Mac.
6. This prototype does not integrate Boat or Temporal. Omit both entirely. Do not add Kubernetes, remote execution VMs, cloud databases, containers, autonomous code execution, or other unsupported components.

Suggested timing:

- 0–5 seconds: reveal “Vercel interface” → “Authenticated tunnel” → an outer container labeled “Mac / one application process.” Inside is “Trusted orchestrator.” Keep gateway detail small or omit the sub-label if readability suffers; do not alter the connection order.
- 5–10 seconds: reveal “Labeled Markdown brain” inside the Mac and “HydraDB / ranked source IDs” outside. Use clearly labeled retrieval connectors. Do not show unrestricted source text flowing directly from HydraDB into workers.
- 10–16 seconds: highlight “Scope + clearance check” inside the Mac, between source content and three small cards labeled “Separate worker histories.” A small “×5” indicates five actual histories without making the graphic crowded. Do not claim these three drawing cards are the entire worker roster.
- 16–21 seconds: reveal “Recorded approvals / SQLite” inside the Mac and “Model provider” outside. End with a stable diagram and footer “Real model calls · Separate histories · One process.”

When space is limited, prioritize the readable path “Retrieve → Check permission → Admit context → Generate.” Use the containing Mac box and final footer to preserve topology accuracy. Do not cram every implementation detail into the diagram.

## Clip 3: Takeaway and closing plug

Filename: `clearance_03_takeaway_21s.mp4`
Placement in assembled film: 02:33–02:54, or seconds 153–174. The final six seconds of the three-minute film remain available for breathing room or a held closing card.

Approved narration, reference only:

“For software factories, the opportunity is more autonomy with less unnecessary access. Clearance makes that boundary visible and inspectable. Built by Bill at Trevillyan Labs. Building agent systems? Find Bill for a walkthrough and compare notes. Share the brain. Isolate the context.”

Visual sequence:

- 0–6 seconds: a minimal typographic card: “More autonomy.” Then beneath it: “Less unnecessary access.” Use the same warm paper and teal style.
- 6–12 seconds: three words reveal in a calm sequence: “Visible. Scoped. Inspectable.” Support with a tiny abstract document → permission boundary → worker-context diagram, not a fake product result.
- 12–21 seconds: closing card with “Clearance” largest; “Built by Bill at Trevillyan Labs” below; tagline “Share the brain. Isolate the context.” Small call to action: “Ask Bill for a walkthrough.” Hold the completed card at least five seconds.

Do not add a QR code, unprovided website, social handle, public-access invitation, funding claim, prize claim, partnership claim, open-source availability claim, or production-security claim.

## Delivery checklist

Deliver the three silent MP4 files with the exact filenames above, plus a still PNG of each final frame: `clearance_01_problem_end.png`, `clearance_02_architecture_end.png`, `clearance_03_takeaway_end.png`. Include an editable project or source package if the tool supports it. Each clip must stand alone and cut cleanly into real product footage. Avoid baked-in transitions that require neighboring clips. Do not produce a replacement product demonstration.

Before export, check all spelling, ensure text is readable at 1080p, verify the architecture does not imply remote worker VMs, and confirm that no actual narration, music, credentials, real client material, or invented UI has been added.
