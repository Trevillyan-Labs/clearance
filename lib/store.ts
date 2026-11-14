import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { dirname } from 'node:path';
import { mkdirSync } from 'node:fs';
import type { Artifact, BrainDocument, CheckResult, Clearance, Engagement, Grant, ObservedInput, Run, StoreEvent, StoreState, Workflow } from './types.ts';

/** Trusted local state. Every public method returns deserialized copies, never live authority objects. */
export class Store {
  private db: DatabaseSync;
  private now: () => number;
  constructor(dbPath: string, documents: BrainDocument[] = [], options: {now?: () => number} = {}) {
    this.now = options.now ?? Date.now;
    if (dbPath !== ':memory:') mkdirSync(dirname(dbPath), {recursive:true});
    this.db = new DatabaseSync(dbPath);
    this.db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS records (kind TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL, PRIMARY KEY(kind,id));');
    this.transaction(()=>{
      const seen=new Set<string>();
      for (const doc of documents) {
        if (seen.has(doc.id) || !doc.id || !this.validEngagement(doc.engagementId) || !this.validClass(doc.classification) || !doc.contentVersion || !Number.isInteger(doc.policyVersion) || doc.policyVersion<1 || typeof doc.body!=='string') throw new Error('Invalid synthetic document manifest');
        seen.add(doc.id);
        const existing=this.read<BrainDocument>('doc',doc.id);
        if (existing && JSON.stringify(existing)!==JSON.stringify(doc)) throw new Error('Document changed under an existing ID; use a fresh versioned ID');
        this.write('doc',doc);
      }
      for(const run of this.listRuns()) if(run.status==='active') {run.status='interrupted';this.write('run',run);this.expireRunGrants(run.id);}
    });
  }
  private validEngagement(v:unknown):v is Engagement{return v==='beacon'||v==='crest';}
  private validClass(v:unknown):v is Clearance{return typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<=3;}
  private iso(){return new Date(this.now()).toISOString();}
  private read<T>(kind:string,id:string):T|undefined {const row=this.db.prepare('SELECT data FROM records WHERE kind=? AND id=?').get(kind,id) as {data:string}|undefined;return row?JSON.parse(row.data):undefined;}
  private all<T>(kind:string):T[]{return (this.db.prepare('SELECT data FROM records WHERE kind=? ORDER BY rowid').all(kind) as {data:string}[]).map(r=>JSON.parse(r.data));}
  private write(kind:string,value:{id:string}){this.db.prepare('INSERT INTO records(kind,id,data) VALUES(?,?,?) ON CONFLICT(kind,id) DO UPDATE SET data=excluded.data').run(kind,value.id,JSON.stringify(value));}
  private transaction<T>(fn:()=>T):T{this.db.exec('BEGIN IMMEDIATE');try{const value=fn();this.db.exec('COMMIT');return value;}catch(error){this.db.exec('ROLLBACK');throw error;}}
  private active(runId:string):Run{const run=this.getRun(runId);if(run.status!=='active')throw new Error('Run is not active');return run;}
  private expireRunGrants(runId:string){for(const grant of this.all<Grant>('grant'))if(grant.runId===runId&&(grant.status==='approved'||grant.status==='pending')){grant.status='expired';this.write('grant',grant);}}
  recordEvent(type:string,details: {runId?:string;docId?:string;artifactId?:string;message?:string} = {}):StoreEvent{
    const event:StoreEvent={id:randomUUID(),type,...details,timestamp:this.iso()};this.write('event',event);return event;
  }
  createRun(engagementId:Engagement,clearance:Clearance):Run{
    if(!this.validEngagement(engagementId)||!this.validClass(clearance))throw new Error('Invalid run authority');
    const run:Run={id:randomUUID(),engagementId,clearance,status:'active',createdAt:this.iso()};
    this.transaction(()=>{this.write('run',run);this.recordEvent('worker_started',{runId:run.id,message:`${engagementId} worker started at class ${clearance}`});});return run;
  }
  getRun(id:string):Run{const run=this.read<Run>('run',id);if(!run)throw new Error('Run not found');return run;}
  getDoc(id:string):BrainDocument|undefined{return this.read<BrainDocument>('doc',id);}
  listRuns():Run[]{return this.all<Run>('run');}
  listDocs(engagement?:Engagement):BrainDocument[]{return this.all<BrainDocument>('doc').filter(d=>!engagement||d.engagementId===engagement);}
  listGrants():Grant[]{return this.all<Grant>('grant');}
  listArtifacts():Artifact[]{return this.all<Artifact>('artifact');}
  getArtifact(id:string):Artifact|undefined{return this.read<Artifact>('artifact',id);}
  observedInputs(runId:string):ObservedInput[]{return this.all<ObservedInput>('input').filter(x=>x.runId===runId);}
  admit(runId:string,docId:string):BrainDocument{
    try{return this.transaction(()=>{
      const run=this.getRun(runId),doc=this.getDoc(docId);
      if(!doc||doc.engagementId!==run.engagementId)throw new Error('Access denied');
      if(run.status!=='active')throw new Error('Run is not active');
      if(doc.classification>run.clearance){
        const grant=this.all<Grant>('grant').find(g=>g.runId===runId&&g.docId===docId&&g.engagementId===run.engagementId&&g.contentVersion===doc.contentVersion&&g.policyVersion===doc.policyVersion&&g.status==='approved'&&Date.parse(g.expiresAt)>this.now());
        if(!grant)throw new Error('Access denied');
        grant.status='consumed';grant.consumedAt=this.iso();this.write('grant',grant);this.recordEvent('grant_consumed',{runId,docId});
      }
      const previous=this.read<ObservedInput>('input',`${runId}:${docId}`);
      const input:ObservedInput={id:`${runId}:${docId}`,runId,docId,engagementId:doc.engagementId,contentVersion:doc.contentVersion,policyVersion:doc.policyVersion,classAtRead:Math.max(previous?.classAtRead??0,doc.classification) as Clearance,admittedAt:previous?.admittedAt??this.iso()};
      this.write('input',input);this.recordEvent('read_admitted',{runId,docId});return doc;
    });}catch(error){this.recordEvent('read_denied',{runId,docId,message:'Read refused before model context admission'});throw error;}
  }
  requestGrant(runId:string,docId:string):Grant{
    return this.transaction(()=>{
      const run=this.active(runId),doc=this.getDoc(docId);
      if(!doc||doc.engagementId!==run.engagementId)throw new Error('Access denied');
      if(doc.classification<=run.clearance)throw new Error('Grant is unnecessary for this source');
      const existing=this.all<Grant>('grant').find(g=>g.runId===runId&&g.docId===docId&&g.contentVersion===doc.contentVersion&&g.policyVersion===doc.policyVersion&&(g.status==='pending'||g.status==='approved')&&Date.parse(g.expiresAt)>this.now());
      if(existing)return existing;
      const grant:Grant={id:randomUUID(),runId,docId,engagementId:run.engagementId,contentVersion:doc.contentVersion,policyVersion:doc.policyVersion,status:'pending',expiresAt:new Date(this.now()+300000).toISOString(),createdAt:this.iso()};
      this.write('grant',grant);this.recordEvent('grant_requested',{runId,docId,message:'One read, one worker, same client, five minutes'});return grant;
    });
  }
  approveGrant(grantId:string):Grant{
    return this.transaction(()=>{
      const grant=this.read<Grant>('grant',grantId);if(!grant||grant.status!=='pending'||Date.parse(grant.expiresAt)<=this.now())throw new Error('Grant is not pending or has expired');
      const run=this.active(grant.runId),doc=this.getDoc(grant.docId);
      if(!doc||doc.engagementId!==run.engagementId||grant.engagementId!==run.engagementId||grant.contentVersion!==doc.contentVersion||grant.policyVersion!==doc.policyVersion)throw new Error('Grant scope no longer matches');
      grant.status='approved';this.write('grant',grant);this.recordEvent('grant_approved',{runId:run.id,docId:doc.id});return grant;
    });
  }
  recordArtifact(runId:string,workflow:Workflow,checks:CheckResult[],bundle:string):Artifact{
    return this.transaction(()=>{
      const run=this.active(runId);const inputs=this.observedInputs(runId);
      for(const input of inputs){const doc=this.getDoc(input.docId);if(!doc||doc.engagementId!==run.engagementId||doc.contentVersion!==input.contentVersion||doc.policyVersion!==input.policyVersion)throw new Error('Input authority changed');}
      const passed=checks.length>0&&checks.every(c=>c.passed===true);
      const artifact:Artifact={id:randomUUID(),runId,engagementId:run.engagementId,inheritedClass:Math.max(0,...inputs.map(i=>i.classAtRead)) as Clearance,workflow,checks,bundle,state:passed?'ready':'failed',createdAt:this.iso()};
      this.write('artifact',artifact);run.status='completed';this.write('run',run);this.expireRunGrants(runId);this.recordEvent('artifact_created',{runId,artifactId:artifact.id,message:passed?'Independent checks passed':'Independent checks failed'});return artifact;
    });
  }
  deliver(artifactId:string,engagement:Engagement):Artifact{
    try{return this.transaction(()=>{
      const artifact=this.getArtifact(artifactId);if(!artifact||!this.validEngagement(engagement)||artifact.engagementId!==engagement||artifact.state==='failed'||artifact.inheritedClass>3||!artifact.checks.length||!artifact.checks.every(c=>c.passed===true))throw new Error('Delivery denied');
      const run=this.getRun(artifact.runId);if(run.status!=='completed'||run.engagementId!==engagement)throw new Error('Delivery denied');
      for(const input of this.observedInputs(run.id)){const doc=this.getDoc(input.docId);if(!doc||doc.engagementId!==engagement||doc.contentVersion!==input.contentVersion||doc.policyVersion!==input.policyVersion)throw new Error('Delivery denied');}
      artifact.state='delivered';artifact.deliveredAt??=this.iso();this.write('artifact',artifact);this.recordEvent('artifact_delivered',{runId:run.id,artifactId});return artifact;
    });}catch(error){this.recordEvent('delivery_denied',{artifactId,message:'Destination client or artifact eligibility did not match'});throw error;}
  }
  retire(runId:string):Run{return this.transaction(()=>{const run=this.getRun(runId);run.status='retired';this.write('run',run);this.expireRunGrants(runId);this.recordEvent('worker_retired',{runId,message:'Old context retired; replacement requires a new run'});return run;});}
  events():StoreEvent[]{return this.all<StoreEvent>('event');}
  state():StoreState{return {docs:this.listDocs(),runs:this.listRuns(),grants:this.listGrants(),artifacts:this.listArtifacts(),inputs:this.all<ObservedInput>('input'),events:this.events()};}
  close(){this.db.close();}
}
