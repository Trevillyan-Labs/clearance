"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Engagement, BrainDocument as Doc, Run, Artifact, CheckResult as Check, StoreState } from "../lib/types";
type Snapshot = Omit<StoreState,"artifacts"> & { artifacts: Omit<Artifact,"bundle">[]; runtime: { setup: { hydra: boolean; model: boolean }; busy: boolean; phases: Record<string,string>; errors: Record<string,string>; mode: string; coordinator?: { clearance: number; scope: string; planning: boolean } } };
type Action = { action: string; runId?: string; grantId?: string; artifactId?: string; engagementId?: Engagement };
const levels = ["Public", "Internal", "Confidential", "Restricted"];
const clients = { beacon: { name: "Beacon", full: "Beacon Manufacturing", sector: "Manufacturing", code: "B", accent: "cobalt" }, crest: { name: "Crest", full: "Crest Industries", sector: "Industrials", code: "C", accent: "amber" } };
const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 }).format(cents / 100);
function Icon({ name, size = 18 }: { name: "shield" | "arrow" | "play" | "lock" | "file" | "check" | "close" | "download" | "external" | "refresh" | "eye" | "branch"; size?: number }) {
 const paths: Record<string, React.ReactNode> = {
 shield: <><path d="m12 3 8 3v5c0 5-4 8-8 10-4-2-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/></>, arrow:<><path d="M4 12h15m-5-5 5 5-5 5"/></>, play:<path d="m8 5 11 7-11 7V5Z"/>, lock:<><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/></>, file:<><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z"/><path d="M14 3v6h6M8 13h8m-8 4h5"/></>, check:<path d="m5 12 4 4L19 6"/>, close:<path d="m6 6 12 12M18 6 6 18"/>,download:<><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></>,external:<><path d="M14 3h7v7m0-7L10 14M10 4H4v16h16v-6"/></>,refresh:<><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 7a7 7 0 0 1 12-1l2 3M4 15l2 3a7 7 0 0 0 12-1"/></>,eye:<><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,branch:<><path d="M6 5v14m0-7h7a5 5 0 0 0 5-5V5"/><circle cx="6" cy="4" r="2"/><circle cx="6" cy="20" r="2"/><circle cx="18" cy="4" r="2"/></>
 };
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
function Status({ value }: { value: string }) { return <span className={`status status-${value.toLowerCase().replace(/[^a-z]/g, "")}`}><i />{value.replaceAll("_", " ")}</span>; }
function checkPassed(check: Check) { return check.passed === true; }

function RecordedLineage({run, inputs, documents, artifact}: {run?: Run; inputs: StoreState["inputs"]; documents: Doc[]; artifact?: Omit<Artifact,"bundle">}) {
 if (!run || inputs.length===0) return <div className="lineage-empty"><Icon name="lock" size={12}/><span>No source-to-worker edges recorded yet.</span></div>;
 const matchingArtifact=artifact?.runId===run.id ? artifact : undefined;
 const label=`Recorded lineage: ${inputs.map(input=>documents.find(doc=>doc.id===input.docId)?.title || input.docId).join(", ")} to worker ${run.id}${matchingArtifact ? ` to artifact ${matchingArtifact.id}` : "; no matching artifact yet"}.`;
 const count=inputs.length;
 return <div className="lineage-strip"><svg className="lineage-svg" viewBox="0 0 480 58" role="img" aria-label={label}>
  <defs><marker id={`arrow-${run.id}`} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5" fill="currentColor"/></marker></defs>
  {inputs.map((input,index)=>{const x=18+index*(210/Math.max(count-1,1));const doc=documents.find(d=>d.id===input.docId);return <g key={input.id}><path className="lineage-edge" data-source-id={input.docId} data-run-id={run.id} d={`M${x} 22 C${x} 45 272 45 303 26`} markerEnd={`url(#arrow-${run.id})`}/><g className="lineage-source"><title>{doc?.title || input.docId}: recorded input {index+1}</title><rect x={x-13} y="5" width="26" height="17" rx="3"/><text x={x} y="17" textAnchor="middle">S{index+1}</text></g></g>;})}
  <g className="lineage-worker"><title>Worker {run.id}</title><rect x="307" y="14" width="69" height="23" rx="5"/><text x="341.5" y="29" textAnchor="middle">WORKER</text></g>
  {matchingArtifact && <><path className="lineage-edge" data-artifact-id={matchingArtifact.id} data-run-id={run.id} d="M376 25H408" markerEnd={`url(#arrow-${run.id})`}/><g className="lineage-output"><title>Artifact {matchingArtifact.id}</title><rect x="413" y="14" width="61" height="23" rx="5"/><text x="443.5" y="29" textAnchor="middle">APP</text></g></>}
  <text className="lineage-caption" x="6" y="55">{count} recorded source{count===1?"":"s"} · this run only</text>
 </svg></div>;
}

export function ClearanceConsole() {
 const [state,setState] = useState<Snapshot | null>(null);
 const [stage,setStage] = useState(false);
 useEffect(()=>{setStage(new URLSearchParams(window.location.search).get("view")==="stage");},[]);
 function changeView(value:boolean) {setStage(value);const url=new URL(window.location.href);if(value)url.searchParams.set("view","stage");else url.searchParams.delete("view");window.history.replaceState({},"",url);}
 const [connectionError,setConnectionError] = useState("");
 const [actionError,setActionError] = useState("");
 const [pending,setPending] = useState("");
 const [selectedDoc,setSelectedDoc] = useState<Doc | null>(null);
 const [inspectRun,setInspectRun] = useState<Run | null>(null);
 const [notice,setNotice] = useState("");
 const inspectorRef = useRef<HTMLElement>(null);
 const requestedSnapshot = useRef(0);
 const appliedSnapshot = useRef(0);
 const actionInFlight = useRef(false);
 const refresh = useCallback(async () => {
  const request = ++requestedSnapshot.current;
  try { const response = await fetch("/api/state",{cache:"no-store"}); if (!response.ok) throw new Error("The local server could not return the current state."); const data = await response.json(); if(request < appliedSnapshot.current) return; appliedSnapshot.current=request; setState(data); setConnectionError(""); }
  catch(error) { if(request >= appliedSnapshot.current) {appliedSnapshot.current=request;setConnectionError(error instanceof Error ? error.message : "Connection unavailable.");} }
 },[]);
 useEffect(() => { void refresh(); const timer = setInterval(() => void refresh(),1000); return () => clearInterval(timer); },[refresh]);
 useEffect(() => {
  if (!selectedDoc && !inspectRun) return;
  const previous = document.activeElement as HTMLElement | null;
  const dialog = inspectorRef.current;
  const controls = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], summary, [tabindex="0"]') || []);
  controls()[0]?.focus();
  function key(event: KeyboardEvent) {
   if (event.key === "Escape") { setSelectedDoc(null); setInspectRun(null); }
   if (event.key === "Tab") { const targets = controls(); const first=targets[0],last=targets.at(-1); if (event.shiftKey && document.activeElement===first) { event.preventDefault();last?.focus(); } else if (!event.shiftKey && document.activeElement===last) {event.preventDefault();first?.focus();} }
  }
  const previousOverflow=document.body.style.overflow; document.body.style.overflow="hidden";
  window.addEventListener("keydown",key); return () => {window.removeEventListener("keydown",key);document.body.style.overflow=previousOverflow;previous?.focus();};
 },[selectedDoc,inspectRun]);
 async function act(payload: Action) {
  if(actionInFlight.current || connectionError) return;
  actionInFlight.current=true;
  setPending(payload.action + (payload.runId || payload.artifactId || payload.grantId || ""));setActionError("");setNotice("");
  try { const res = await fetch("/api/action",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}); const result = await res.json(); if (!res.ok) throw new Error(result.error || "The action could not be completed."); if(result.message) setNotice(result.message); else if(result.denied===true) setNotice("Cross-client read refused before source content entered the worker context."); else if(payload.action==="reset") {setNotice("New demo session. Previous run history is preserved.");setInspectRun(null);} await refresh(); }
  catch(error) { setActionError(error instanceof Error ? error.message : "The action could not be completed."); }
  finally { actionInFlight.current=false;setPending(""); }
 }
 const sessionView = useMemo(() => {
  if(!state) return {runs:[] as Run[],artifacts:[] as Snapshot["artifacts"],events:[] as StoreState["events"]};
  const resetIndex=state.events.findLastIndex(event=>event.type==="mission_reset");
  const events=resetIndex<0 ? state.events : state.events.slice(resetIndex+1);
  const runIds=new Set(events.filter(event=>event.type==="worker_started" && event.runId).map(event=>event.runId));
  const runs=resetIndex<0 ? state.runs : state.runs.filter(run=>runIds.has(run.id));
  const shownRunIds=new Set(runs.map(run=>run.id));
  return {runs,artifacts:state.artifacts.filter(artifact=>shownRunIds.has(artifact.runId)),events};
 },[state]);
 const latestEvents = useMemo(() => sessionView.events.slice(-8).reverse(),[sessionView]);
 const setup = state?.runtime?.setup;
 const ready = Boolean(setup?.hydra && setup?.model);
 const busy = Boolean(state?.runtime?.busy || state?.runs.some(run=>run.status==="active"));
 const unavailable = Boolean(pending || connectionError);
 const coordinatorError = state?.runtime?.errors?.coordinator;
 const currentInspectorRun = state?.runs.find(run=>run.id===inspectRun?.id) || inspectRun;
 const totals = { built: sessionView.artifacts.length, delivered: sessionView.artifacts.filter(a=>a.state === "delivered").length, denied: sessionView.events.filter(e=>/denied|rejected|blocked/.test(e.type)).length };
 return <div className={`console-shell ${stage?"stage-view":"workspace-view"}`}>
  <header className="topbar"><a className="brand" href="/" aria-label="Clearance home"><span className="brand-mark"><Icon name="shield" size={23}/></span>clearance<span className="brand-period">.</span></a><span className="topbar-divider"/><div className="firm-name">NORTHSTAR <span>ADVISORY</span></div><div className="topbar-right"><div className="view-toggle" aria-label="Presentation view"><button aria-pressed={!stage} onClick={()=>changeView(false)}>Workspace</button><button aria-pressed={stage} onClick={()=>changeView(true)}>Stage view</button></div><span className="environment"><i/>LOCAL WORKSPACE</span><span className="operator-avatar" title="Trusted local operator">NA</span></div></header>
  <main>
   <section className="hero">
    <div><div className="eyebrow"><span className="eyebrow-line"/>{stage?"LIVE SOFTWARE FACTORY":"THE ENGAGEMENT WORKSPACE"}</div><h1>{stage?<>One firm. <span>Two client boundaries.</span></>:<>Shared expertise.<br/><span>Separate client minds.</span></>}</h1><p className="hero-description">Build software from confidential requirements.<br className="desktop-break"/> Keep every agent, input, and output in the right engagement.</p></div>
    <div className="hero-action"><div className="mission-label">TODAY’S MISSION <span>01</span></div><p>Two clients. One brief.<br/><strong>Build a purchase approval app.</strong></p><button className="button primary" onClick={()=>void act({action:"start"})} disabled={!ready || busy || unavailable}><Icon name="play" size={16}/>{busy ? "Mission in progress" : "Run both engagements"}<Icon name="arrow" size={18}/></button><div className="service-status"><span className={setup?.hydra?"online":""}><i/>HydraDB {!state?"checking":setup?.hydra?"configured":"not configured"}</span><span className={setup?.model?"online":""}><i/>Model {!state?"checking":setup?.model?"configured":"not configured"}</span></div></div>
   </section>
   {state?.runtime?.mode && state.runtime.mode !== "live" && <div className="setup-banner"><Icon name="eye"/><div><strong>Fixture verification mode.</strong><span>This session is not demonstrating live HydraDB or model generation.</span></div></div>}
   {(!ready && state) && <div className="setup-banner"><Icon name="lock"/><div><strong>Live services need to be connected.</strong><span>Configure HydraDB and model access to run real agents. No results are simulated.</span></div></div>}
   {(connectionError || actionError || coordinatorError) && <div role="alert" className="error-banner"><Icon name="close"/><span>{connectionError || actionError || coordinatorError}</span><button onClick={()=>{setActionError("");void refresh();}} aria-label="Dismiss or retry error"><Icon name="refresh"/></button></div>}
   {notice && <div className="notice-banner" role="status"><Icon name="check"/>{notice}</div>}
   <section className="methodology-strip"><div className="method-icon"><Icon name="branch" size={21}/></div><div><strong>{state?.runtime?.coordinator ? "Task coordinator" : "Firm expertise is shared. Client context is not."}</strong><p>{state?.runtime?.coordinator ? `${levels[state.runtime.coordinator.clearance]} clearance · ${state.runtime.coordinator.scope}` : "Approved methodology is copied into each engagement. No shared agent memory."}</p></div><div className="method-label"><span className="tiny-square"/>{state?.runtime?.coordinator?.planning ? "PLANNING ASSIGNMENTS" : "NO CLIENT CONTENT IN COORDINATOR"}</div></section>
   <div className="rooms-heading"><h2>Active engagements <span>02</span></h2><div className="rooms-caption"><Icon name="lock" size={13}/>Immutable client assignment</div></div>
   <div className="engagement-grid">
    {(["beacon","crest"] as Engagement[]).map(id => {
     const client = clients[id];
     const docs = state?.docs.filter(doc=>doc.engagementId===id) || [];
     const runs = sessionView.runs.filter(run=>run.engagementId===id);
     const run = runs.at(-1);
     const artifact = sessionView.artifacts.filter(a=>a.engagementId===id && (!run || a.runId===run.id)).at(-1) || sessionView.artifacts.filter(a=>a.engagementId===id).at(-1);
     const inputs = state?.inputs.filter(input=>input.runId===run?.id) || [];
     const grant = run?.status === "active" ? state?.grants.filter(g=>g.runId===run.id && (g.status==="pending" || g.status==="expired")).at(-1) : undefined;
     const grantExpired = Boolean(grant && (grant.status==="expired" || new Date(grant.expiresAt).getTime()<=Date.now()));
     const artifactRun = state?.runs.find(r=>r.id===artifact?.runId);
     const canDeliver = artifact?.state==="ready" && artifactRun?.status==="completed";
     const actionableRun = Boolean(run && (run.status==="active" || run.status==="completed"));
     const phase = run && state?.runtime?.phases?.[run.id];
     const error = run && state?.runtime?.errors?.[run.id];
     const other = id === "beacon" ? "crest" : "beacon";
     const passed = artifact?.checks.filter(checkPassed).length || 0;
     return <section className={`engagement-room ${client.accent}`} key={id} aria-label={`${client.full} engagement`}>
      <div className="room-header"><div className="client-monogram">{client.code}<span/></div><div className="client-title"><span className="client-kicker">CLIENT {client.code} / {client.sector}</span><h3>{client.full}</h3></div><span className="compartment-tag"><Icon name="lock" size={12}/>{id.toUpperCase()}</span></div>
      <div className="room-inner">
       <div className="section-label"><span>01</span> PRIVATE KNOWLEDGE<span className="section-count">{docs.length} sources</span></div>
       <div className="source-list">{docs.length ? docs.map(doc=><button key={doc.id} className={`source-row ${inputs.some(input=>input.docId===doc.id)?"source-admitted":""}`} onClick={()=>setSelectedDoc(doc)}><span className="file-icon"><Icon name="file" size={17}/></span><span className="source-name">{doc.title}</span><span className={`class-tag class-${doc.classification}`}>{levels[doc.classification] || "Unknown"}</span><span className="source-read-icon">{inputs.some(input=>input.docId===doc.id)?<span className="source-lineage-id">S{inputs.findIndex(input=>input.docId===doc.id)+1}</span>:<Icon name="eye" size={14}/>}</span></button>):<div className="source-empty"><Icon name="file"/>Source inventory will appear when the server is ready.</div>}</div>
       <RecordedLineage run={run} inputs={inputs} documents={state?.docs || []} artifact={artifact}/>
       <div className={`worker-card ${run?.status==="active"?"worker-active":""}`}><div className="worker-top"><div className="worker-glyph"><span/><span/><span/><span/></div><div><span className="worker-role">Application builder</span><span className="worker-id">{run ? `RUN ${run.id.slice(-8).toUpperCase()}` : "Awaiting mission"}</span></div><Status value={run?.status || "idle"}/></div><div className="worker-description">{error ? <span className="inline-error">{error}</span> : phase || (run ? "Context belongs to this engagement." : "A fresh worker will receive this client’s policy and approved methods.")}</div><div className="worker-bottom"><span><Icon name="shield" size={13}/>{run ? `${levels[run.clearance]} clearance` : "Planned: Confidential"}</span>{run && <button className="text-button" onClick={()=>setInspectRun(run)}><Icon name="eye" size={13}/>Inspect context</button>}</div></div>
       {grant && <div className="grant-card"><div className="grant-heading"><Icon name="lock" size={17}/><strong>{grantExpired ? "This read request expired." : "A precise permission, not a promotion."}</strong></div><p>{grantExpired ? "Start a new demo session to request access again. Expiry does not grant access or raise clearance." : `This worker requests one read of a restricted source in ${client.name}. Its baseline clearance and client assignment stay unchanged.`}</p><div className="grant-source">{docs.find(d=>d.id===grant.docId)?.title || "Restricted source"}</div><div className="grant-scope">One read · this run · expires {new Date(grant.expiresAt).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}</div><button className="button grant-button" disabled={unavailable || grantExpired} onClick={()=>void act({action:"approve",grantId:grant.id,runId:run?.id})}>{grantExpired ? "Expired, access remains closed" : "Approve this read"}<Icon name="arrow" size={15}/></button></div>}
       <div className="flow-connector output-flow"><span/><Icon name="arrow" size={14}/><span className="flow-caption">Generate · compile · independently test</span><span/></div>
       <div className="artifact-section"><div className="section-label"><span>02</span> GENERATED SOFTWARE{artifact && <Status value={artifact.state}/>}</div>
        {artifact ? <div className="artifact-card"><div className="artifact-title"><span className="app-icon"><Icon name="branch" size={22}/></span><div><h4>{artifact.workflow.title}</h4><p>Standalone application · {levels[artifact.inheritedClass]}{artifact.runId !== run?.id ? " · Retained from earlier run" : ""}</p></div></div><div className="workflow-rules"><div><span>Below {money(artifact.workflow.thresholdCents)}</span><strong>{artifact.workflow.belowApprovers.join(" + ")}</strong></div><div><span>{money(artifact.workflow.thresholdCents)} and above</span><strong>{artifact.workflow.atOrAboveApprovers.join(" + ")}</strong></div></div><div className={`test-summary ${passed===artifact.checks.length && passed>0?"tests-passed":"tests-failed"}`}><Icon name={passed===artifact.checks.length && passed>0?"check":"close"} size={15}/><strong>{passed}/{artifact.checks.length} independent checks passed</strong><span>Behavior tested</span></div><details className="test-details"><summary>Inspect acceptance checks</summary><div>{artifact.checks.map((check,index)=><div className="test-row" key={index}><Icon name={checkPassed(check)?"check":"close"} size={13}/><span>{check.name || `Case ${index+1}`}</span><span>{checkPassed(check)?"PASS":"FAIL"}</span></div>)}</div></details><div className="artifact-actions">{artifact.state === "delivered" ? <><a className="button room-button" target="_blank" rel="noreferrer" href={`/client/${id}?artifactId=${encodeURIComponent(artifact.id)}`}>Open client app<Icon name="external" size={14}/></a><a className="icon-button" href={`/api/download?id=${encodeURIComponent(artifact.id)}&engagement=${id}`} aria-label={`Download ${client.name} standalone app`} title="Download standalone HTML"><Icon name="download" size={17}/></a><a className="icon-button config-download" href={`/api/download?id=${encodeURIComponent(artifact.id)}&engagement=${id}&format=json`} aria-label={`Download ${client.name} workflow configuration`} title="Download workflow JSON">{"{}"}</a></> : <button className="button room-button" disabled={!canDeliver || unavailable} onClick={()=>void act({action:"deliver",artifactId:artifact.id,engagementId:id})}>{artifactRun?.status==="retired" || artifactRun?.status==="interrupted" ? "Originating run is inactive" : `Deliver to ${client.name}`}<Icon name="arrow" size={15}/></button>}</div></div> : <div className="artifact-placeholder"><div className="mini-app-wireframe"><div><i/><i/><i/></div><span/><span/><b/></div><div><strong>A real app will land here.</strong><p>Generated from this client’s requirements.<br/>Delivered only after its checks pass.</p></div></div>}
       </div>
       <div className="room-challenge"><span>CHALLENGE THE BOUNDARY</span><div><button disabled={!actionableRun || unavailable} onClick={()=>run && void act({action:"attempt_cross_client",runId:run.id,engagementId:other})}><Icon name="shield" size={14}/>Try {clients[other].name}’s context</button><button disabled={!actionableRun || unavailable} onClick={()=>run && void act({action:"reassign",runId:run.id,engagementId:other})}><Icon name="refresh" size={14}/>Reassign role</button></div><p>A role can move. A client-informed context cannot.</p></div>
      </div>
     </section>;
    })}
   </div>
   {stage && <div className="stage-trail" aria-live="polite"><span className="stage-trail-label"><i/>REAL EVENT TRAIL</span>{latestEvents.length ? latestEvents.slice(0,2).map(event=><div className={/denied|rejected|blocked/.test(event.type)?"stage-event denied":"stage-event"} key={event.id}><Icon name={/denied|rejected|blocked/.test(event.type)?"lock":"check"} size={13}/><strong>{event.type.replaceAll("_"," ")}</strong><span>{event.message}</span></div>):<span className="stage-waiting">Waiting for the first real action.</span>}</div>}
   <section className="evidence-section"><div className="evidence-intro"><div className="eyebrow">THE RECORD, NOT THE STORY</div><h2>Every boundary<br/> has a receipt.</h2><p>Actual application events. No invented agent activity, no model confidence posing as a test.</p><div className="metric-row"><div><strong>{totals.built.toString().padStart(2,"0")}</strong><span>Apps generated</span></div><div><strong>{totals.denied.toString().padStart(2,"0")}</strong><span>Actions refused</span></div><div><strong>{totals.delivered.toString().padStart(2,"0")}</strong><span>Apps delivered</span></div></div></div><div className="event-ledger"><div className="ledger-heading"><span><i/>LIVE EVENT TRAIL</span><span>LAST {latestEvents.length} EVENTS</span></div>{latestEvents.length ? latestEvents.map(event=><div className={`event-row ${/denied|rejected|blocked/.test(event.type)?"event-denied":""}`} key={event.id}><span className="event-symbol">{/denied|rejected|blocked/.test(event.type)?<Icon name="lock" size={14}/>:<span/>}</span><div><strong>{event.type.replaceAll("_"," ")}</strong>{event.message && <p>{event.message}</p>}</div><time>{new Date(event.timestamp).toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"})}</time></div>):<div className="ledger-empty">Start the mission to see the real execution trail.</div>}</div></section>
   <footer className="workspace-footer"><span><Icon name="shield" size={14}/>Synthetic clients. Real application boundaries.</span><span>Prototype · Controlled tools, not a general agent sandbox.</span><button className="text-button" onClick={()=>void act({action:"reset"})} disabled={!state || unavailable || Boolean(state.runtime.busy)}><Icon name="refresh" size={13}/>New demo session</button></footer>
  </main>
  {(selectedDoc || inspectRun) && <div className="modal-backdrop" onClick={()=>{setSelectedDoc(null);setInspectRun(null);}}><section className="inspector" ref={inspectorRef} role="dialog" aria-modal="true" aria-labelledby="inspector-title" onClick={event=>event.stopPropagation()}><div className="inspector-top"><div className="eyebrow">PRIVILEGED OPERATOR INSPECTOR</div><button className="icon-button" onClick={()=>{setSelectedDoc(null);setInspectRun(null);}} aria-label="Close inspector"><Icon name="close"/></button></div>{selectedDoc ? <><h2 id="inspector-title">{selectedDoc.title}</h2><div className="inspector-tags"><span className="compartment-tag">{selectedDoc.engagementId.toUpperCase()}</span><span className={`class-tag class-${selectedDoc.classification}`}>{levels[selectedDoc.classification]}</span></div><p className="inspector-note">This operator view can inspect both engagements. Document bodies enter worker context only after the admission boundary permits them.</p><pre className="source-body">{selectedDoc.body}</pre></> : inspectRun && <><h2 id="inspector-title">What this worker saw.</h2><div className="inspector-tags"><span className="compartment-tag">{inspectRun.engagementId.toUpperCase()}</span><span className="class-tag">{levels[inspectRun.clearance]} clearance</span><Status value={currentInspectorRun?.status || inspectRun.status}/></div><p className="inspector-note">Run {inspectRun.id}. This manifest records admitted sources, including inputs the final answer may not cite.</p><div className="context-documents">{state?.inputs.filter(i=>i.runId===inspectRun.id).length ? state.inputs.filter(i=>i.runId===inspectRun.id).map((input,index)=>{const doc=state.docs.find(d=>d.id===input.docId);return <details key={`${input.docId}-${index}`}><summary><Icon name="file" size={16}/>{doc?.title || input.docId}<span>{doc?levels[doc.classification]:"Unknown"}</span></summary><pre className="source-body">{doc?.body || "Source body unavailable."}</pre></details>;}):<div className="context-empty"><Icon name="shield" size={30}/><strong>No sources admitted.</strong><span>This worker has no inherited client document context.</span></div>}</div></>}</section></div>}
 </div>;
}
