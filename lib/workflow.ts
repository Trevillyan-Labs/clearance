import type { CheckResult, Workflow } from './types';

const ROLES = ['Department Manager', 'Procurement', 'CFO'] as const;
const FIELDS = ['title', 'currency', 'thresholdCents', 'belowApprovers', 'atOrAboveApprovers'];

function approvers(value: unknown, name: string): string[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > ROLES.length || value.some((role) => typeof role !== 'string' || !(ROLES as readonly string[]).includes(role)) || new Set(value).size !== value.length) {
    throw new Error(`${name} must contain one to three distinct permitted approver roles.`);
  }
  return [...value];
}

export function validateWorkflow(value: unknown): Workflow {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Workflow must be an object.');
  const data = value as Record<string, unknown>;
  if (Object.keys(data).length !== FIELDS.length || Object.keys(data).some((key) => !FIELDS.includes(key))) throw new Error('Workflow has missing or unsupported fields.');
  if (typeof data.title !== 'string' || data.title.trim().length === 0 || data.title.length > 120) throw new Error('Title must contain 1 to 120 characters.');
  if (data.currency !== 'USD') throw new Error('Only USD is supported by this prototype.');
  if (typeof data.thresholdCents !== 'number' || !Number.isSafeInteger(data.thresholdCents) || data.thresholdCents < 1 || data.thresholdCents > 1_000_000_000_000) throw new Error('Threshold must be whole cents between 1 and 1,000,000,000,000.');
  return {
    title: data.title.trim(),
    currency: 'USD',
    thresholdCents: data.thresholdCents,
    belowApprovers: approvers(data.belowApprovers, 'belowApprovers'),
    atOrAboveApprovers: approvers(data.atOrAboveApprovers, 'atOrAboveApprovers'),
  };
}

export function requiredRoles(workflow: Workflow, amountCents: number): string[] {
  if (!Number.isSafeInteger(amountCents) || amountCents < 0) throw new Error('Purchase amount must be nonnegative whole cents.');
  return [...(amountCents < workflow.thresholdCents ? workflow.belowApprovers : workflow.atOrAboveApprovers)];
}

// These expected cases are independent acceptance criteria. Never pass them to a generating model.
const CASES: Record<'beacon' | 'crest', Array<{ name: string; cents: number; expected: string[] }>> = {
  beacon: [
    { name: '$0 purchase', cents: 0, expected: ['Department Manager'] },
    { name: '$49,999.99 purchase', cents: 4_999_999, expected: ['Department Manager'] },
    { name: '$50,000 threshold purchase', cents: 5_000_000, expected: ['Procurement', 'CFO'] },
    { name: '$75,000 purchase', cents: 7_500_000, expected: ['Procurement', 'CFO'] },
    { name: '$100,000 purchase', cents: 10_000_000, expected: ['Procurement', 'CFO'] },
  ],
  crest: [
    { name: '$0 purchase', cents: 0, expected: ['Department Manager'] },
    { name: '$75,000 purchase', cents: 7_500_000, expected: ['Department Manager'] },
    { name: '$99,999.99 purchase', cents: 9_999_999, expected: ['Department Manager'] },
    { name: '$100,000 threshold purchase', cents: 10_000_000, expected: ['Procurement'] },
    { name: '$100,000.01 purchase', cents: 10_000_001, expected: ['Procurement'] },
  ],
};

export function checkWorkflow(workflow: Workflow, engagement: 'beacon' | 'crest'): CheckResult[] {
  if (engagement !== 'beacon' && engagement !== 'crest') throw new Error('Unknown engagement.');
  const checked = validateWorkflow(workflow);
  return CASES[engagement].map(({ name, cents, expected }) => {
    const actual = requiredRoles(checked, cents);
    return { name, passed: expected.length === actual.length && expected.every((role, index) => actual[index] === role), expected: [...expected], actual };
  });
}

function htmlText(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}

export function compileWorkflow(workflow: Workflow): string {
  const checked = validateWorkflow(workflow);
  const json = JSON.stringify(checked).replace(/[<>&\u2028\u2029]/g, (character) => `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`);
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>${htmlText(checked.title)}</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f2f5f4;color:#162d29;font:16px system-ui,sans-serif;display:grid;min-height:100vh;place-items:center;padding:24px}main{width:min(620px,100%);background:#fff;border:1px solid #d3dfd9;border-radius:24px;padding:38px;box-shadow:0 16px 60px #163d2910}.eyebrow{font-size:12px;font-weight:750;letter-spacing:.16em;color:#4a7568}h1{font-size:32px;line-height:1.1;letter-spacing:-.04em;margin:14px 0}p{color:#597069;line-height:1.55}label{display:block;font-weight:650;margin:26px 0 8px}input{width:100%;font:inherit;font-size:25px;border:1px solid #b8ccc2;border-radius:10px;padding:14px}button{border:0;border-radius:10px;padding:14px 20px;background:#165b48;color:white;font:inherit;font-weight:650;width:100%;margin-top:12px;cursor:pointer}button:focus-visible,input:focus-visible{outline:3px solid #d39a20;outline-offset:3px}#result{margin-top:26px;border-top:1px solid #dbe5e0;padding-top:20px}#result h2{font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#577169}ol{padding-left:24px}li{padding:6px 0;font-size:20px;font-weight:650}.note{font-size:12px;margin-bottom:0}#error{color:#b42e30;font-size:14px;min-height:20px}
</style></head><body><main><div class="eyebrow">APPROVAL WORKFLOW</div><h1>${htmlText(checked.title)}</h1><p>Enter a purchase amount to see the required approval route.</p><form id="purchase-form"><label for="amount">Purchase amount (USD)</label><input id="amount" name="amount" type="text" inputmode="decimal" value="75000" autocomplete="off" required aria-describedby="error"><button type="submit">Check approval route</button><div id="error" role="alert"></div></form><section id="result" aria-live="polite"><h2>Required approvals</h2><ol id="roles"></ol></section><p class="note">Synthetic prototype. This standalone artifact makes no network requests.</p></main>
<script id="workflow-data" type="application/json">${json}</script>
<script>
(function(){
'use strict';
const workflow=JSON.parse(document.getElementById('workflow-data').textContent);
const form=document.getElementById('purchase-form');
const amount=document.getElementById('amount');
const error=document.getElementById('error');
const roles=document.getElementById('roles');
function update(event){
 if(event)event.preventDefault();
 const raw=amount.value.trim();
 if(!/^\\d{1,12}(?:\\.\\d{1,2})?$/.test(raw)){error.textContent='Enter a nonnegative amount, with no commas and up to two decimal places.';roles.replaceChildren();return;}
 const parts=raw.split('.');
 const cents=Number(parts[0])*100+Number((parts[1]||'').padEnd(2,'0'));
 if(!Number.isSafeInteger(cents)){error.textContent='This amount is too large.';roles.replaceChildren();return;}
 error.textContent='';
 const route=cents<workflow.thresholdCents?workflow.belowApprovers:workflow.atOrAboveApprovers;
 roles.replaceChildren(...route.map(function(role){const item=document.createElement('li');item.textContent=role;return item;}));
}
form.addEventListener('submit',update);update();
})();
</script></body></html>`;
}
