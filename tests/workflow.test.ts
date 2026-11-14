import assert from 'node:assert/strict';
import test from 'node:test';
import { checkWorkflow, compileWorkflow, requiredRoles, validateWorkflow } from '../lib/workflow';

const beacon = { title: 'Purchase approval workflow', currency: 'USD', thresholdCents: 5_000_000, belowApprovers: ['Department Manager'], atOrAboveApprovers: ['Procurement', 'CFO'] };
const crest = { title: 'Purchase approval workflow', currency: 'USD', thresholdCents: 10_000_000, belowApprovers: ['Department Manager'], atOrAboveApprovers: ['Procurement'] };

test('the same purchase routes differently under the two client policies', () => {
  assert.deepEqual(requiredRoles(validateWorkflow(beacon), 7_500_000), ['Procurement', 'CFO']);
  assert.deepEqual(requiredRoles(validateWorkflow(crest), 7_500_000), ['Department Manager']);
  assert.deepEqual(requiredRoles(validateWorkflow(beacon), 4_999_999), ['Department Manager']);
  assert.deepEqual(requiredRoles(validateWorkflow(beacon), 5_000_000), ['Procurement', 'CFO']);
  assert.deepEqual(requiredRoles(validateWorkflow(crest), 10_000_000), ['Procurement']);
});

test('independent client cases reject a valid but wrong-client workflow', () => {
  assert.ok(checkWorkflow(validateWorkflow(beacon), 'beacon').every((item) => item.passed));
  assert.ok(checkWorkflow(validateWorkflow(crest), 'crest').every((item) => item.passed));
  assert.ok(checkWorkflow(validateWorkflow(crest), 'beacon').some((item) => !item.passed));
  assert.ok(checkWorkflow(validateWorkflow(beacon), 'crest').some((item) => !item.passed));
  assert.ok(checkWorkflow(validateWorkflow({ ...beacon, thresholdCents: 5_000_001 }), 'beacon').some((item) => !item.passed));
});

test('workflow input is bounded, strict and cannot introduce executable fields', () => {
  const bad: unknown[] = [null, [], {}, { ...beacon, currency: 'EUR' }, { ...beacon, thresholdCents: 1.5 }, { ...beacon, thresholdCents: Number.MAX_SAFE_INTEGER }, { ...beacon, thresholdCents: 0 }, { ...beacon, thresholdCents: Infinity }, { ...beacon, title: 'x'.repeat(121) }, { ...beacon, title: '  ' }, { ...beacon, belowApprovers: [] }, { ...beacon, atOrAboveApprovers: ['Procurement', 'Procurement'] }, { ...beacon, atOrAboveApprovers: ['CEO'] }, { ...beacon, script: 'alert(1)' }];
  for (const value of bad) assert.throws(() => validateWorkflow(value));
  for (const amount of [-1, 1.1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => requiredRoles(validateWorkflow(beacon), amount));
  const parsed = validateWorkflow(beacon);
  const roles = requiredRoles(parsed, 1);
  roles.push('CFO');
  assert.deepEqual(parsed.belowApprovers, ['Department Manager']);
});

test('standalone artifact includes data and a fixed runtime without interpolated executable strings', () => {
  const attack = '</script><script>globalThis.compromised=true</script><img src=x onerror=alert(1)>';
  const html = compileWorkflow(validateWorkflow({ ...beacon, title: attack }));
  assert.ok(html.startsWith('<!doctype html>'));
  assert.ok(!html.includes(attack));
  assert.ok(!html.includes('innerHTML'));
  assert.ok(!html.includes('https://'));
  const data = html.match(/<script id="workflow-data" type="application\/json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(data);
  assert.equal(JSON.parse(data!).title, attack);
  assert.ok(!data!.includes('<'));
  assert.ok(!data!.includes('>'));
  assert.equal((html.match(/<script(?:\s|>)/g) ?? []).length, 2);
});
