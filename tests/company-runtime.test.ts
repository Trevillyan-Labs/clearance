import assert from 'node:assert/strict';
import test from 'node:test';
import { join } from 'node:path';
import { CompanyRuntime } from '../lib/company-runtime';
import { CompanyStore } from '../lib/company-store';
import { loadCompanyBrain } from '../lib/company-brain';
import type { Message } from '../lib/model';
import type { WorkerRole } from '../lib/company-types';

const values:Record<WorkerRole,Record<string,unknown>>={
 ui:{heading:'Proposal pricing',description:'Prepare an internal proposal.',accent:'blue'},
 beacon:{client:'beacon',projectName:'ERP rollout discovery',consultantDays:20,architectDays:10},
 crest:{client:'crest',projectName:'Operations improvement',consultantDays:10,architectDays:5},
 pricing:{consultantRateCents:200000,architectRateCents:300000,consultantCostCents:120000,architectCostCents:180000,maxDiscountBps:2000,minMarginBps:3500},
 reviewer:{maxDiscountBps:2000,minMarginBps:3500},
};
function modelInputText(messages:Message[]):string{
 const flatten=(value:unknown):string=>typeof value==='string'?value:Array.isArray(value)?value.map(flatten).join('\n'):value&&typeof value==='object'?Object.values(value).map(flatten).join('\n'):'';
 return messages.map(message=>{try{return flatten(JSON.parse(message.content??''));}catch{return message.content??'';}}).join('\n');
}
const call=(name:string,args:unknown):Message=>({role:'assistant',content:null,tool_calls:[{id:`call-${name}`,type:'function',function:{name,arguments:JSON.stringify(args)}}]});
async function settled(condition:()=>boolean){for(let attempt=0;attempt<100;attempt++){if(condition())return;await new Promise<void>(resolve=>setImmediate(resolve));}assert.fail('Company runtime did not settle');}
function setup(overrides:Partial<Record<WorkerRole,Record<string,unknown>>>={}){
 const docs=loadCompanyBrain(join(process.cwd(),'company-brain'));
 const store=new CompanyStore(':memory:',docs);
 const seen:Array<{role:WorkerRole;messages:Message[]}>=[];
 const runtime=new CompanyRuntime({store,infer:async(messages)=>{
  const role=/You are the (\w+) worker/.exec(messages[0].content??'')?.[1] as WorkerRole;
  assert.ok(role in values);
  seen.push({role,messages:structuredClone(messages)});
  if(!messages.some(message=>message.role==='tool'))return call('search_brain',{query:'required source documents for my component'});
  if(role==='pricing'&&!messages.some(message=>message.role==='user'&&message.content?.includes('authorized_read')))return call('request_read',{capability:'discount_policy'});
  return call('submit_component',overrides[role]??values[role]);
 },search:async()=>[...docs.map(doc=>doc.id),'unknown-source']});
 return {docs,store,runtime,seen};
}

test('five unequal-clearance workers assemble two internal proposals without sharing restricted or opposite-client context',async()=>{
 const {docs,store,runtime,seen}=setup();
 try{
  const workers=store.startMission();
  await Promise.all(workers.map(worker=>runtime.run(worker.id)));
  const pricing=workers.find(worker=>worker.role==='pricing')!;
  assert.equal(store.worker(pricing.id).status,'awaiting_approval');
  assert.equal(store.snapshot().artifacts.length,0);
  const restricted=docs.find(doc=>doc.id==='firm-discount-policy')!;
  assert.ok(seen.filter(entry=>entry.role==='pricing').every(entry=>!modelInputText(entry.messages).includes(restricted.body)));
  const grant=store.snapshot().grants.find(item=>item.workerId===pricing.id)!;
  assert.equal(grant.status,'pending');
  runtime.approve(grant.id);
  await settled(()=>store.snapshot().artifacts.length===2||Boolean(runtime.error));
  assert.equal(runtime.error,undefined);
  assert.ok(seen.filter(entry=>entry.role==='pricing').some(entry=>modelInputText(entry.messages).includes(restricted.body)),'positive control: approved source is actually present after grant');
  assert.equal(store.worker(pricing.id).clearance,2);
  assert.equal(store.snapshot().grants.find(item=>item.id===grant.id)?.status,'consumed');
  for(const artifact of store.snapshot().artifacts){
   assert.equal(artifact.classification,3);assert.ok(artifact.checks.every(check=>check.passed));
   const other=artifact.client==='beacon'?'crest':'beacon';
   assert.ok(!artifact.sourceIds.includes(`${other}-proposal-brief`));
   assert.ok(!JSON.stringify(artifact.config).includes(values[other].projectName as string));
   assert.throws(()=>store.deliver(artifact.id,artifact.client),/partner/);
   assert.equal(store.deliver(artifact.id,'partner').state,'delivered');
  }
  for(const entry of seen){
   const worker=workers.find(item=>item.role===entry.role)!;
   const text=modelInputText(entry.messages);
   for(const doc of docs){
    if(!worker.scopes.includes(doc.scope)||doc.classification>worker.clearance&&entry.role!=='pricing')assert.ok(!text.includes(doc.body),`${entry.role} saw unauthorized ${doc.id}`);
   }
  }
 }finally{store.close();}
});

test('a wrong pricing fact or wrong second-client contribution fails assembly without partial artifacts or resuming completed workers',async()=>{
 for(const override of [{pricing:{...values.pricing,consultantRateCents:200001}},{crest:{...values.crest,consultantDays:11}}]){
  const {store,runtime,seen}=setup(override);
  try{
   const workers=store.startMission();await Promise.all(workers.map(worker=>runtime.run(worker.id)));
   runtime.approve(store.snapshot().grants[0].id);
   await settled(()=>Boolean(runtime.error));
   assert.match(runtime.error!,/contributions|checks/);
   assert.equal(store.snapshot().artifacts.length,0);
   assert.ok(store.snapshot().workers.every(worker=>worker.status==='completed'));
   assert.equal(seen.length,11,'completed workers should not enter repeated model/error loops');
   assert.ok(store.snapshot().events.some(event=>event.type==='assembly_failed'));
  }finally{store.close();}
 }
});

test('operator policy comparison does not admit context, consume grants or defeat scope with high clearance',()=>{
 const {store,runtime}=setup();
 try{
  const workers=store.startMission();
  const pricing=workers.find(worker=>worker.role==='pricing')!;
  const reviewer=workers.find(worker=>worker.role==='reviewer')!;
  const grant=store.requestGrant(pricing.id,'firm-discount-policy');store.approveGrant(grant.id);
  assert.equal(runtime.challenge(pricing.id,'firm-rate-card').allowed,true);
  assert.equal(runtime.challenge(pricing.id,'firm-discount-policy').allowed,false,'probe describes baseline clearance only');
  assert.equal(runtime.challenge(reviewer.id,'beacon-proposal-brief').allowed,false);
  assert.deepEqual(store.worker(pricing.id).inputs,[]);
  assert.deepEqual(store.worker(reviewer.id).inputs,[]);
  assert.equal(store.snapshot().grants.find(item=>item.id===grant.id)?.status,'approved');
 }finally{store.close();}
});
