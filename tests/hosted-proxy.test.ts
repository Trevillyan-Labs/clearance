import assert from 'node:assert/strict';
import test from 'node:test';
import { NextRequest } from 'next/server';
import { hostedProxy } from '../lib/hosted-proxy';

async function hostedEnvironment(run:()=>Promise<void>){
 const priorVercel=process.env.VERCEL;
 const priorOrigin=process.env.CLEARANCE_BACKEND_ORIGIN;
 const priorKey=process.env.CLEARANCE_BRIDGE_KEY;
 process.env.VERCEL='1';
 process.env.CLEARANCE_BACKEND_ORIGIN='https://synthetic-backend.example.test';
 process.env.CLEARANCE_BRIDGE_KEY='dummy-server-bridge-key-not-a-real-credential';
 try{await run();}finally{
  if(priorVercel===undefined)delete process.env.VERCEL;else process.env.VERCEL=priorVercel;
  if(priorOrigin===undefined)delete process.env.CLEARANCE_BACKEND_ORIGIN;else process.env.CLEARANCE_BACKEND_ORIGIN=priorOrigin;
  if(priorKey===undefined)delete process.env.CLEARANCE_BRIDGE_KEY;else process.env.CLEARANCE_BRIDGE_KEY=priorKey;
 }
}
function request(path='/api/company/state',options:{method?:string;headers?:Record<string,string>}={}){
 const method=options.method??'GET';
 return new NextRequest(`https://protected.example.test${path}`,{method,headers:{host:'protected.example.test',...(method==='POST'?{origin:'https://protected.example.test','sec-fetch-site':'same-origin','content-type':'application/json'}:{}),...options.headers},...(method==='POST'?{body:JSON.stringify({action:'challenge'})}:{})});
}

test('hosted proxy forwards only its own session cookie and server-owned bridge credential',async(t)=>{
 await hostedEnvironment(async()=>{
  let captured:RequestInit|undefined;
  t.mock.method(globalThis,'fetch',async(_url:unknown,init?:RequestInit)=>{captured=init;return new Response('{}',{headers:{'content-type':'application/json','set-cookie':'clearance-session=fresh-session; Path=/; HttpOnly; SameSite=Strict'}});});
  const response=await hostedProxy(request('/api/company/action',{method:'POST',headers:{cookie:'__vercel_sso_nonce=vercel-secret; clearance-session=operator-session; unrelated=private-cookie','x-clearance-bridge':'forged-browser-key',authorization:'Bearer forged-browser-auth'}}));
  assert.equal(response?.status,200);
  const headers=new Headers(captured!.headers);
  assert.equal(headers.get('cookie'),'clearance-session=operator-session');
  assert.equal(headers.get('x-clearance-bridge'),'dummy-server-bridge-key-not-a-real-credential');
  assert.equal(headers.get('authorization'),null);
  assert.ok(!JSON.stringify([...headers]).includes('vercel-secret'));
  assert.ok(!JSON.stringify([...headers]).includes('private-cookie'));
  assert.equal(captured!.redirect,'error');
  assert.equal(response?.headers.get('cache-control'),'no-store');
  assert.match(response!.headers.get('set-cookie')!,/;\s*Secure(?:;|$)/i);
  assert.match(response!.headers.get('set-cookie')!,/HttpOnly/);
 });
});

test('mutation requests require exact hosted origin and reject cross-site context before fetching',async(t)=>{
 await hostedEnvironment(async()=>{
  let calls=0;t.mock.method(globalThis,'fetch',async()=>{calls++;return new Response('{}');});
  const deniedHeaders:Record<string,string>[]=[{origin:''},{origin:'https://attacker.example.test'},{origin:'https://protected.example.test.attacker.test'},{'sec-fetch-site':'cross-site'}];
  for(const headers of deniedHeaders){
   const response=await hostedProxy(request('/api/company/action',{method:'POST',headers}));
   assert.equal(response?.status,403);
  }
  assert.equal(calls,0);
 });
});

test('missing bridge configuration fails closed and local mode does not proxy',async(t)=>{
 await hostedEnvironment(async()=>{
  let calls=0;t.mock.method(globalThis,'fetch',async()=>{calls++;return new Response('{}');});
  delete process.env.CLEARANCE_BRIDGE_KEY;
  assert.equal((await hostedProxy(request()))?.status,503);
  process.env.CLEARANCE_BRIDGE_KEY='dummy-server-bridge-key-not-a-real-credential';
  delete process.env.CLEARANCE_BACKEND_ORIGIN;
  assert.equal((await hostedProxy(request()))?.status,503);
  process.env.VERCEL='0';
  assert.equal(await hostedProxy(request()),null);
  assert.equal(calls,0);
 });
});

test('network-path request references cannot move the credential-bearing fetch off the configured origin',async(t)=>{
 await hostedEnvironment(async()=>{
  const targets:string[]=[];
  t.mock.method(globalThis,'fetch',async(url:unknown)=>{targets.push(String(url));return new Response('{}');});
  const response=await hostedProxy(request('//attacker.example.test/api/company/state?probe=1'));
  assert.equal(response?.status,200);assert.equal(targets.length,1);
  assert.equal(new URL(targets[0]).origin,'https://synthetic-backend.example.test');
  assert.equal(new URL(targets[0]).search,'?probe=1');
 });
});

test('unrelated upstream cookies are not relayed even alongside a Clearance session cookie',async(t)=>{
 await hostedEnvironment(async()=>{
  const headers=new Headers({'content-type':'application/json'});
  headers.append('set-cookie','clearance-session=fresh-session; Path=/; HttpOnly; SameSite=Strict');
  headers.append('set-cookie','upstream-unrelated=private-upstream-cookie; Path=/; HttpOnly');
  t.mock.method(globalThis,'fetch',async()=>new Response('{}',{headers}));
  const response=await hostedProxy(request());
  const cookie=response!.headers.get('set-cookie')??'';
  assert.match(cookie,/^clearance-session=/);
  assert.ok(!cookie.includes('upstream-unrelated'));
  assert.ok(!cookie.includes('private-upstream-cookie'));
  assert.match(cookie,/;\s*Secure(?:;|$)/i);
 });
});
