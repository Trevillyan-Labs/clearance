import assert from 'node:assert/strict';
import test from 'node:test';
import { join } from 'node:path';
import { Runtime,delegation } from '../lib/runtime';
import { Store } from '../lib/store';
import { loadBrain } from '../lib/brain';
import type { Message } from '../lib/model';
import type { Engagement } from '../lib/types';

const docs = () => loadBrain(join(process.cwd(), 'brain'));
const call = (name: string, args: unknown): Message => ({role:'assistant',content:null,tool_calls:[{id:`call-${name}`,type:'function',function:{name,arguments:JSON.stringify(args)}}]});
const workflow = (engagement: Engagement) => ({title:'Purchase approval workflow',currency:'USD',thresholdCents:engagement==='beacon'?5_000_000:10_000_000,belowApprovers:['Department Manager'],atOrAboveApprovers:engagement==='beacon'?['Procurement','CFO']:['Procurement']});
test('coordinator delegation requires one typed call with exactly the two permitted C2 workers',()=>{
 const workers=[{engagementId:'beacon',clearance:2},{engagementId:'crest',clearance:2}];
 assert.deepEqual(delegation(call('delegate_workers',{workers})),workers);
 assert.throws(()=>delegation({role:'assistant',content:'No.'}));
 for(const invalid of [[workers[0],workers[0]],[workers[0],{engagementId:'crest',clearance:3}],[workers[0],{engagementId:'other',clearance:2}],[workers[0],{...workers[1],context:'foreign'}]])assert.throws(()=>delegation(call('delegate_workers',{workers:invalid})));
});
async function settled(condition: () => boolean) {
  for (let attempt=0;attempt<100;attempt++) { if(condition())return; await new Promise<void>(resolve=>setImmediate(resolve)); }
  assert.fail('Runtime did not reach its expected state');
}
function harness() {
  const captured: Array<{engagement: Engagement; messages: Message[]}> = [];
  const store = new Store(':memory:', docs());
  const runtime = new Runtime({store, infer: async(messages) => {
    const assignment = messages.find(m=>m.role==='user')?.content ?? '';
    const engagement:Engagement=assignment.includes('beacon')?'beacon':'crest';
    captured.push({engagement,messages:JSON.parse(JSON.stringify(messages))});
    const results=messages.filter(m=>m.role==='tool');
    if(results.length===0)return call('search_brain',{query:'purchase approval policy and exact threshold'});
    if(results.length===1)return call('request_access',{capability:'approval_appendix'});
    return call('submit_workflow',workflow(engagement));
  }, search: async() => ['beacon-approvals','crest-approvals','beacon-thresholds','crest-thresholds']});
  return {runtime,store,captured};
}

test('real runtime mediates search, scoped approval and checked artifacts without mixing client contexts', async() => {
  const {runtime,store,captured}=harness();
  try {
    for(const engagement of ['beacon','crest'] as Engagement[]) {
      const run=runtime.newSession(engagement,2);
      await runtime.advance(run.id);
      assert.equal(runtime.phases[run.id],'awaiting_grant');
      assert.deepEqual(store.observedInputs(run.id).map(i=>i.docId),[`${engagement}-approvals`]);
      const grant=store.listGrants().find(g=>g.runId===run.id)!;
      assert.equal(grant.status,'pending');
      assert.ok(captured.filter(c=>c.engagement===engagement).every(c=>!JSON.stringify(c.messages).includes('represented as')),'restricted appendix appeared before approval');
      runtime.approve(grant.id);
      await settled(()=>store.getRun(run.id).status==='completed'||runtime.phases[run.id]==='error');
      assert.equal(runtime.errors[run.id],undefined);
      const artifact=store.listArtifacts().find(a=>a.runId===run.id)!;
      assert.equal(artifact.inheritedClass,3);
      assert.equal(artifact.state,'ready');
      assert.ok(artifact.checks.every(c=>c.passed));
      const other=engagement==='beacon'?'crest':'beacon';
      assert.throws(()=>store.deliver(artifact.id,other),/Delivery denied/);
      assert.equal(store.deliver(artifact.id,engagement).state,'delivered');
      assert.deepEqual(runtime.challenge(run.id),{denied:true},'completed worker challenge must exercise client ownership, not lifecycle failure');
      assert.throws(()=>store.admit(run.id,`${engagement}-approvals`),/Run is not active/);
      for(const request of captured.filter(c=>c.engagement===engagement)) {
        const text=JSON.stringify(request.messages);
        assert.ok(!text.includes(`${other}-`),'other-client source reached model');
        assert.ok(!text.includes(other==='beacon'?'USD 50,000.00':'USD 100,000.00'),'other-client restricted body reached model');
      }
    }
  } finally {store.close();}
});

test('reassignment retires the old context and starts a fresh client history', async() => {
  const {runtime,store,captured}=harness();
  try {
    const old=runtime.newSession('beacon',2);
    await runtime.advance(old.id);
    const oldGrant=store.listGrants().find(g=>g.runId===old.id)!;
    runtime.approve(oldGrant.id);
    await settled(()=>store.getRun(old.id).status==='completed'||runtime.phases[old.id]==='error');
    assert.equal(runtime.errors[old.id],undefined);
    const replacement=runtime.reassign(old.id,'crest');
    await settled(()=>runtime.phases[replacement.id]==='awaiting_grant'||runtime.phases[replacement.id]==='error');
    assert.equal(runtime.errors[replacement.id],undefined);
    assert.notEqual(replacement.id,old.id);
    assert.equal(store.getRun(old.id).status,'retired');
    const first=captured.find(c=>c.engagement==='crest')!;
    assert.equal(first.messages.length,2);
    assert.deepEqual(first.messages.map(m=>m.role),['system','user']);
    assert.ok(!JSON.stringify(first.messages).includes('beacon'));
    assert.ok(!JSON.stringify(first.messages).includes('50,000'));
    assert.ok(store.observedInputs(replacement.id).every(i=>i.engagementId==='crest'));
  } finally {store.close();}
});

test('a model response arriving after retirement cannot admit sources or create an artifact', async() => {
  const store=new Store(':memory:',docs());
  let complete!: (message: Message) => void;
  let searched=false;
  const runtime=new Runtime({store,infer:()=>new Promise<Message>(resolve=>{complete=resolve;}),search:async()=>{searched=true;return ['beacon-approvals'];}});
  try {
    const run=runtime.newSession('beacon',2);
    const pending=runtime.advance(run.id);
    assert.equal(typeof complete,'function');
    store.retire(run.id);
    complete(call('search_brain',{query:'approval policy'}));
    await pending;
    assert.equal(searched,false);
    assert.equal(store.observedInputs(run.id).length,0);
    assert.equal(store.listArtifacts().length,0);
    assert.equal(runtime.sessions.get(run.id)?.messages.length,2);
  } finally {store.close();}
});
