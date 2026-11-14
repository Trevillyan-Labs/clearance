import assert from 'node:assert/strict';
import test from 'node:test';
import { assembleProposal, calculateQuote, checkContributions, contributionSchema, validateContribution } from '../lib/proposal';

const contributions={
 ui:{heading:'Proposal pricing',description:'Review the commercial terms before partner approval.',accent:'blue'},
 beacon:{client:'beacon',projectName:'Factory planning engagement',consultantDays:20,architectDays:10},
 crest:{client:'crest',projectName:'CREST_PRIVATE_PROJECT',consultantDays:10,architectDays:5},
 pricing:{consultantRateCents:200000,architectRateCents:300000,consultantCostCents:120000,architectCostCents:180000,maxDiscountBps:2000,minMarginBps:3500},
 reviewer:{maxDiscountBps:2000,minMarginBps:3500},
};

test('role outputs are strict, bounded and cannot smuggle another role or executable fields',()=>{
 for(const role of ['ui','beacon','crest','pricing','reviewer'] as const){
  assert.equal(contributionSchema(role).additionalProperties,false);
  assert.deepEqual(validateContribution(role,contributions[role]),contributions[role]);
  assert.throws(()=>validateContribution(role,{...contributions[role],script:'alert(1)'}));
 }
 assert.throws(()=>validateContribution('beacon',{...contributions.beacon,client:'crest'}));
 assert.throws(()=>validateContribution('beacon',{...contributions.beacon,consultantDays:0.5}));
 assert.throws(()=>validateContribution('beacon',{...contributions.beacon,consultantDays:3651}));
 assert.throws(()=>validateContribution('beacon',{...contributions.beacon,consultantDays:0,architectDays:0}));
 assert.throws(()=>validateContribution('ui',{...contributions.ui,accent:'red'}));
 assert.throws(()=>validateContribution('pricing',{...contributions.pricing,consultantRateCents:Number.MAX_SAFE_INTEGER}));
 assert.throws(()=>validateContribution('reviewer',{...contributions.reviewer,maxDiscountBps:10001}));
});

test('independent checks reject wrong commercial facts and disagreement before assembly',()=>{
 assert.ok(checkContributions(contributions).every(check=>check.passed));
 for(const invalid of [
  {...contributions,pricing:{...contributions.pricing,consultantRateCents:200001}},
  {...contributions,pricing:{...contributions.pricing,minMarginBps:3000}},
  {...contributions,reviewer:{...contributions.reviewer,minMarginBps:3000}},
  {...contributions,beacon:{...contributions.beacon,consultantDays:19}},
 ]){
  assert.ok(checkContributions(invalid).some(check=>!check.passed));
  assert.throws(()=>assembleProposal('beacon',invalid));
 }
 assert.throws(()=>assembleProposal('beacon',{ui:contributions.ui,beacon:contributions.beacon,pricing:contributions.pricing}));
});

test('independent commercial examples yield correct totals, margins and review decisions',()=>{
 const beacon=assembleProposal('beacon',contributions).config;
 const crest=assembleProposal('crest',contributions).config;
 const baseline=calculateQuote(beacon,{consultantDays:20,architectDays:10,discountBps:0});
 assert.equal(baseline.grossCents,7000000);assert.equal(baseline.costCents,4200000);
 assert.equal(baseline.discountedTotalCents,7000000);assert.equal(baseline.marginPercent,40);assert.equal(baseline.reviewRequired,false);
 const smaller=calculateQuote(crest,{consultantDays:10,architectDays:5,discountBps:0});
 assert.equal(smaller.grossCents,3500000);assert.equal(smaller.costCents,2100000);
 const five=calculateQuote(beacon,{consultantDays:20,architectDays:10,discountBps:500});
 assert.equal(five.discountedTotalCents,6650000);assert.ok(Math.abs(five.marginPercent!-36.84210526315789)<1e-9);assert.equal(five.reviewRequired,false);
 const ten=calculateQuote(beacon,{consultantDays:20,architectDays:10,discountBps:1000});
 assert.equal(ten.discountedTotalCents,6300000);assert.ok(Math.abs(ten.marginPercent!-33.33333333333333)<1e-9);assert.equal(ten.reviewRequired,true);
 assert.equal(calculateQuote(beacon,{consultantDays:20,architectDays:10,discountBps:2500}).reviewRequired,true);
});

test('policy boundaries use strict comparisons and quote inputs cannot overflow',()=>{
 const base=assembleProposal('beacon',contributions).config;
 const freeCost={...base,consultantCostCents:0,architectCostCents:0};
 assert.equal(calculateQuote(freeCost,{consultantDays:1,architectDays:0,discountBps:2000}).reviewRequired,false);
 assert.equal(calculateQuote(freeCost,{consultantDays:1,architectDays:0,discountBps:2001}).reviewRequired,true);
 const exactMargin={...base,consultantRateCents:10000,consultantCostCents:6500};
 assert.equal(calculateQuote(exactMargin,{consultantDays:1,architectDays:0,discountBps:0}).reviewRequired,false);
 assert.equal(calculateQuote({...exactMargin,consultantCostCents:6501},{consultantDays:1,architectDays:0,discountBps:0}).reviewRequired,true);
 assert.equal(calculateQuote(base,{consultantDays:20,architectDays:10,discountBps:10000}).marginPercent,null);
 for(const input of [{consultantDays:-1,architectDays:1,discountBps:0},{consultantDays:1.5,architectDays:1,discountBps:0},{consultantDays:3651,architectDays:0,discountBps:0},{consultantDays:0,architectDays:0,discountBps:0},{consultantDays:1,architectDays:0,discountBps:10001},{consultantDays:1,architectDays:0,discountBps:0.5}]) assert.throws(()=>calculateQuote(base,input));
});

test('assembly excludes the opposite client and escapes all model strings in a standalone internal tool',()=>{
 const attack='</script><script>alert(1)</script><img src=x onerror=alert(1)>';
 const output=assembleProposal('beacon',{...contributions,ui:{...contributions.ui,heading:attack}});
 assert.ok(!output.html.includes('CREST_PRIVATE_PROJECT'));
 assert.ok(!JSON.stringify(output.config).includes('crest'));
 assert.ok(!output.html.includes(attack));
 assert.ok(!output.html.includes('innerHTML'));assert.ok(!output.html.includes('https://'));
 assert.ok(output.html.includes('Internal partner-only tool'));
 assert.ok(output.html.includes('Do not publish or share with clients'));
 const data=output.html.match(/<script id="proposal-data" type="application\/json">([\s\S]*?)<\/script>/)?.[1];
 assert.ok(data);assert.equal(JSON.parse(data!).heading,attack);assert.ok(!data!.includes('<'));
 assert.equal((output.html.match(/<script(?:\s|>)/g)??[]).length,2);
});
