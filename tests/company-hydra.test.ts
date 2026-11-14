import { test } from 'node:test';
import assert from 'node:assert/strict';
import { companyQueryBody, companyCollection } from '../lib/company-hydra.ts';
test('company query binds one collection and only permitted class principals',()=>{
 const body=companyQueryBody('firm',2,'rate policy');assert.equal(body.collection,'company_firm');assert.equal(body.graph_context,false);assert.deepEqual(body.acl,['class-0@firm.company.clearance.example.com','class-1@firm.company.clearance.example.com','class-2@firm.company.clearance.example.com']);assert.equal(companyCollection('beacon'),'proposal_beacon');assert.equal(companyCollection('crest'),'proposal_crest');assert.throws(()=>companyQueryBody('other' as 'firm',3,'x'));assert.throws(()=>companyQueryBody('firm',4,'x'));assert.throws(()=>companyQueryBody('firm',1.5,'x'));assert.equal(companyQueryBody('firm',0,'x'.repeat(2000)).query.length,1500);
});
