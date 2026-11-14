import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Store } from '../lib/store.ts';
import type { BrainDocument, Workflow } from '../lib/types.ts';

const docs: BrainDocument[] = [
  {id:'beacon-public',engagementId:'beacon',title:'Public',classification:0,contentVersion:'1',policyVersion:1,body:'Beacon public'},
  {id:'beacon-restricted',engagementId:'beacon',title:'Threshold',classification:3,contentVersion:'1',policyVersion:1,body:'Beacon restricted'},
  {id:'crest-confidential',engagementId:'crest',title:'Policy',classification:2,contentVersion:'1',policyVersion:1,body:'Crest secret'},
];
const workflow: Workflow = {title:'Approval',currency:'USD',thresholdCents:5000000,belowApprovers:['Department Manager'],atOrAboveApprovers:['CFO','Procurement']};
const checks=[{name:'threshold',passed:true}];
function setup(clock=()=>Date.now()) {return new Store(join(mkdtempSync(join(tmpdir(),'clearance-store-')),'state.sqlite'),docs,{now:clock});}

test('client compartment is immutable even at highest clearance; unknown sources never resolve',()=>{
 const s=setup(); const run=s.createRun('beacon',3);
 assert.equal(s.admit(run.id,'beacon-restricted').body,'Beacon restricted');
 assert.throws(()=>s.admit(run.id,'crest-confidential'),/Access denied/);
 assert.throws(()=>s.requestGrant(run.id,'crest-confidential'),/Access denied/);
 assert.throws(()=>s.admit(run.id,'../../etc/passwd'),/Access denied/);
 assert.deepEqual(s.observedInputs(run.id).map(x=>x.docId),['beacon-restricted']);
 s.close();
});

test('same-client grant is one use, run-specific, expires, and cannot be approved twice',()=>{
 let now=100000; const s=setup(()=>now); const a=s.createRun('beacon',1),b=s.createRun('beacon',1);
 assert.throws(()=>s.admit(a.id,'beacon-restricted'),/Access denied/);
 const g=s.requestGrant(a.id,'beacon-restricted'); s.approveGrant(g.id);
 assert.throws(()=>s.approveGrant(g.id),/Grant/);
 assert.throws(()=>s.admit(b.id,'beacon-restricted'),/Access denied/);
 s.admit(a.id,'beacon-restricted');
 assert.throws(()=>s.admit(a.id,'beacon-restricted'),/Access denied/);
 const expired=s.requestGrant(b.id,'beacon-restricted'); s.approveGrant(expired.id); now+=300001;
 assert.throws(()=>s.admit(b.id,'beacon-restricted'),/Access denied/);
 assert.equal(s.getRun(a.id).clearance,1); s.close();
});

test('all observed input restrictions follow the artifact; only matching client delivery succeeds',()=>{
 const s=setup(); const r=s.createRun('beacon',1);
 s.admit(r.id,'beacon-public'); const g=s.requestGrant(r.id,'beacon-restricted');s.approveGrant(g.id);s.admit(r.id,'beacon-restricted');
 const a=s.recordArtifact(r.id,workflow,checks,'<!doctype html>');
 assert.equal(a.inheritedClass,3);
 assert.throws(()=>s.deliver(a.id,'crest'),/Delivery denied/);
 assert.equal(s.deliver(a.id,'beacon').state,'delivered');
 assert.equal(s.state().inputs.length,2); s.close();
});

test('ended runs and failed or untested artifacts cannot deliver or accept late work',()=>{
 const s=setup(); const r=s.createRun('beacon',3);s.retire(r.id);
 assert.throws(()=>s.admit(r.id,'beacon-public'),/Run/);
 assert.throws(()=>s.recordArtifact(r.id,workflow,checks,'app'),/Run/);
 const failed=s.createRun('beacon',2);const a=s.recordArtifact(failed.id,workflow,[{name:'wrong',passed:false}],'app');
 assert.equal(a.state,'failed');assert.throws(()=>s.deliver(a.id,'beacon'),/Delivery denied/);
 const empty=s.createRun('beacon',2);const untested=s.recordArtifact(empty.id,workflow,[],'app');
 assert.equal(untested.state,'failed');s.close();
});

test('restart interrupts active runs without reviving grants; completed artifacts persist',()=>{
 const dir=mkdtempSync(join(tmpdir(),'clearance-restart-')),file=join(dir,'state.sqlite');
 const s=new Store(file,docs);const active=s.createRun('beacon',1);const g=s.requestGrant(active.id,'beacon-restricted');s.approveGrant(g.id);
 const done=s.createRun('crest',2);s.admit(done.id,'crest-confidential');const a=s.recordArtifact(done.id,workflow,checks,'app');s.close();
 const resumed=new Store(file,docs);assert.equal(resumed.getRun(active.id).status,'interrupted');
 assert.throws(()=>resumed.admit(active.id,'beacon-restricted'),/Run/);
 assert.equal(resumed.deliver(a.id,'crest').state,'delivered');resumed.close();
});
