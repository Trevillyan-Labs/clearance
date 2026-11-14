import assert from 'node:assert/strict';
import test from 'node:test';
import { NextRequest } from 'next/server';
import { localRequest, sessionResponse } from '../lib/http';

function request(headers: Record<string,string> = {}, session = true) {
  const cookie = sessionResponse({ok:true}).headers.get('set-cookie')?.split(';')[0];
  assert.ok(cookie, 'Session bootstrap must set its cookie');
  return new NextRequest('http://localhost:3090/api/action', {
    method:'POST',
    headers:{host:'127.0.0.1:3090',origin:'http://127.0.0.1:3090','sec-fetch-site':'same-origin',...(session?{cookie}:{}),...headers},
  });
}

test('same-origin operator action uses validated browser Host despite Next internal localhost URL',()=>{
  assert.doesNotThrow(()=>localRequest(request(),true));
  assert.doesNotThrow(()=>localRequest(request({host:'localhost:3090',origin:'http://localhost:3090'}),true));
});

test('local origin fix preserves host, exact-origin, fetch-site and session restrictions',()=>{
  assert.throws(()=>localRequest(request({host:'foreign.example',origin:'http://foreign.example'}),true),/Local operator/);
  assert.throws(()=>localRequest(request({origin:'https://foreign.example'}),true),/Cross-origin/);
  assert.throws(()=>localRequest(request({origin:'http://localhost:3090'}),true),/Cross-origin/);
  assert.throws(()=>localRequest(request({'sec-fetch-site':'cross-site'}),true),/Cross-site/);
  assert.throws(()=>localRequest(request({},false),true),/Operator session/);
  assert.throws(()=>localRequest(request({origin:''}),true),/Operator session/);
});
