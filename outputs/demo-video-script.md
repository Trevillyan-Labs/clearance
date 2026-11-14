# Clearance: three-minute demo video

Recording draft, November 14, 2026. Spoken script: 377 words. Record the real UI, then trim waiting time. Timestamps are edit targets, not promises about model latency.

## Before recording

Use the hosted Stage view while signed in to Vercel. Capture at a legible browser size. Start one fresh mission and record the actual transitions. The approval expires after five minutes, so capture that section promptly. Record the output and architecture sections after generation finishes; cut the clips together in the order below. Do not reset a run someone else is using.

Keep the pointer still while explaining. Zoom the recording into the relevant panel rather than racing across the entire dashboard. Hold each permission result on screen long enough to read it. Cut waiting time transparently with a small “Generation time shortened” caption. No simulated success or prerecorded animation presented as live computation.

## Narration and screen choreography

### 0:00–0:20 | The problem

**Visual:** Begin on the company workspace with the five workers and labeled sources visible. Small title overlay: “Clearance · Permission-aware software factories.”

**Say:**

> I'm Bill from Trevillyan Labs. A software factory needs company knowledge to do useful work. But giving every agent the whole company brain creates a problem: the intern shouldn't see executive strategy, and one client's agent shouldn't see another client's brief. This is Clearance.

### 0:20–0:43 | The mission

**Visual:** Click **New mission**, then **Start the company mission**. Show the progress strip and workers changing state. Cut actual waiting time. Select **Show connections** on Beacon, then Crest; pause on the different highlighted client sources.

**Say:**

> Northstar is our fictional consulting firm. Five workers are building proposal tools for two clients from one shared brain. Documents have two independent labels: client scope and clearance. Watch the connections: each worker receives its own permitted context. Sharing firm knowledge doesn't mean sharing every client's information.

### 0:43–1:06 | Same brain, different clearance

**Visual:** Click **Compare two profiles**. Choose **Restricted executive plan**. Hold the intern's “Read denied” and chief of staff's “Read permitted” side by side. Then choose **Beacon proposal brief**, showing both denied. Close the inspector.

**Say:**

> Here's the same executive plan evaluated for an intern and the CEO's chief of staff. The intern is denied; the chief of staff is allowed. This is the application's actual permission check, not two prompted answers. And higher clearance still doesn't grant access to a client compartment you don't belong to.

### 1:06–1:38 | The approval moment

**Visual:** Zoom into the amber approval panel. Click **Inspect current context**, briefly show the pricing manifest without the discount policy, then close. Hold the scope chips. Click **Approve one read**. After it is consumed, click **Inspect pricing context** and show the added discount policy and unchanged C2 badge.

**Say:**

> Pricing has stopped. It can read the confidential rate card, but needs the restricted discount policy to finish. I can inspect exactly what it has seen before deciding. This approval names one worker, one document version, one read, and an expiry. I approve it. The policy enters pricing's context, work resumes, and pricing stays C2. It has not gained general access to restricted documents.

### 1:38–2:07 | Useful output, governed delivery

**Visual:** Show both completed proposal cards and their checks. Click **Deliver internally** for Beacon, then **Open partner app**. Enter **10** in **Proposed discount (%)**, then click **Recalculate proposal**, showing the review-required state. Return to the workspace and click **Try public delivery**; hold the refusal.

**Say:**

> The result is useful software: two proposal calculators. The workers generate structured contributions, and a trusted compiler turns them into these apps. In Beacon's proposal, a ten-percent discount pushes margin below the permitted floor and triggers review. The output also inherits its sources' restrictions. Internal partner delivery works; public delivery is refused. The boundary follows the work product, too.

### 2:07–2:43 | How it works

**Visual:** Click **Architecture**. Frame the current implementation diagram showing Vercel, the authenticated tunnel and Mac backend; keep proposed remote workers outside the crop. Trace browser → orchestrator → read/grant policy → labeled brain/HydraDB → model provider. Briefly highlight SQLite and artifact/delivery policy.

**Say:**

> The architecture is deliberately small. Vercel hosts the interface. An authenticated tunnel connects it to a trusted orchestrator on my Mac. HydraDB finds source IDs in a labeled Markdown brain; local policy decides which document bodies enter each worker's separate model history. SQLite records workers, grants, inputs, and artifacts. These are real model calls in one process, not isolated virtual machines. Boat and Temporal are not integrated in this version.

### 2:43–3:00 | The takeaway and plug

**Visual:** Return to the workspace, showing completed outputs. End on a simple title card: “Clearance / Trevillyan Labs / Share the brain. Isolate the context.” Optional on-screen text: “Ask Bill for a walkthrough.”

**Say:**

> This prototype asks a practical question for software factories: how much autonomy can we give an agent without giving it everything? Clearance makes that decision visible, scoped, and inspectable. I'm Bill from Trevillyan Labs. If you're building agent systems, let's compare notes.

## Optional swaps

**Sharper opening, replacing the first two sentences:** “Your best agent can become your biggest information leak if every task starts with the entire company brain.”

**8090-focused closing, replacing the last two sentences:** “That's the layer I want to explore with software-factory builders like 8090. I'm Bill from Trevillyan Labs. Let's build on it.”

## Recording guardrails

- This is a synthetic-data prototype, not a production security guarantee. The architecture narration explicitly describes the actual process boundary.
- The intern/chief-of-staff panel runs policy checks. They are comparison profiles, not two additional model workers.
- Show the actual pricing receipt before saying the policy entered its context. Approval alone is not consumption.
- The five-minute grant window begins when the request is created. If it expires before recording, capture a fresh authorized run rather than claiming the expired grant succeeded.
- The shared app requires Vercel authentication. Do not put an unqualified “try it now” public link on the closing card. The repository is private; do not invite cloning or promise a public release.
- If time is tight, omit the Crest connection click and shorten the architecture trace. Keep the intern comparison, scoped approval, working calculator, and delivery refusal: those are the four proof moments.
