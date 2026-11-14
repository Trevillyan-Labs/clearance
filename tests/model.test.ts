import assert from 'node:assert/strict';
import test from 'node:test';
import { createInferenceClient, type Budget, type Message } from '../lib/model';

const messages:Message[]=[{role:'user',content:'Build the synthetic approval app.'}];
const success=()=>new Response(JSON.stringify({choices:[{message:{role:'assistant',content:'ready'}}],usage:{prompt_tokens:12,completion_tokens:3}}),{status:200});
function harness(outcomes:Array<Response|Error>, initial?:Partial<Budget>){
 let state:Budget={requests:0,reservedDollars:0,inputTokens:0,outputTokens:0,...initial};
 let calls=0;const delays:number[]=[];
 const infer=createInferenceClient({
  apiKey:()=> 'dummy-test-key',
  fetch:async()=>{const outcome=outcomes[calls++];if(outcome instanceof Error)throw outcome;if(!outcome)throw new Error('Unexpected extra request');return outcome;},
  readBudget:()=>({...state}),writeBudget:(next)=>{state={...next};},
  sleep:async(ms)=>{delays.push(ms);},
 });
 return {infer,state:()=>state,calls:()=>calls,delays};
}

test('one retry covers transient HTTP and network failures and reserves both attempts',async()=>{
 const bodyTimeout=new Response('');bodyTimeout.json=async()=>{throw new DOMException('private body timeout','TimeoutError');};
 for(const first of [bodyTimeout,new Response('withheld-body',{status:429}),new Response('withheld-body',{status:503}),new TypeError('private network detail'),new DOMException('private timeout detail','TimeoutError')]){
  const h=harness([first,success()]);
  assert.equal((await h.infer(messages)).content,'ready');
  assert.equal(h.calls(),2);assert.equal(h.state().requests,2);assert.deepEqual(h.delays,[250]);
  const one=harness([success()]);await one.infer(messages);
  assert.equal(h.state().reservedDollars,2*one.state().reservedDollars);
  assert.equal(h.state().inputTokens,12);assert.equal(h.state().outputTokens,3);
 }
});

test('permanent errors and exhausted retries stop with sanitized errors',async()=>{
 for(const status of [400,401,403,404,422]){
  const h=harness([new Response('DO_NOT_EXPOSE',{status}),success()]);
  await assert.rejects(h.infer(messages),(error:Error)=>error.message.includes(`(${status})`)&&!error.message.includes('DO_NOT_EXPOSE'));
  assert.equal(h.calls(),1);assert.deepEqual(h.delays,[]);
 }
 const unavailable=harness([new Response('DO_NOT_EXPOSE',{status:503}),new Response('DO_NOT_EXPOSE',{status:503}),success()]);
 await assert.rejects(unavailable.infer(messages),/Model request failed \(503\)/);
 assert.equal(unavailable.calls(),2);assert.equal(unavailable.state().requests,2);
 const network=harness([new TypeError('DO_NOT_EXPOSE'),new DOMException('DO_NOT_EXPOSE','TimeoutError'),success()]);
 await assert.rejects(network.infer(messages),(error:Error)=>!error.message.includes('DO_NOT_EXPOSE'));
 assert.equal(network.calls(),2);
});

test('retry cannot cross the request budget, and tools are included in reservations',async()=>{
 const h=harness([new Response('temporary',{status:503}),success()],{requests:99});
 await assert.rejects(h.infer(messages),/Session model budget reached/);
 assert.equal(h.calls(),1);assert.equal(h.state().requests,100);
 const empty=harness([success()]);await empty.infer(messages);
 const withTools=harness([success()]);await withTools.infer(messages,[{type:'function',function:{name:'search',description:'Search only the assigned synthetic engagement.',parameters:{type:'object',properties:{query:{type:'string'}}}}}]);
 assert.ok(withTools.state().reservedDollars>empty.state().reservedDollars);
 const full=harness([success()],{reservedDollars:20});
 await assert.rejects(full.infer(messages),/Session model budget reached/);assert.equal(full.calls(),0);
});
