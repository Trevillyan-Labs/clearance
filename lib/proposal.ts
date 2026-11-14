import type { CheckResult } from './types';

export type ProposalRole='ui'|'beacon'|'crest'|'pricing'|'reviewer';
export type ProposalContributions=Partial<Record<ProposalRole,unknown>>;
type Client='beacon'|'crest';
export interface ProposalConfig {
 client:Client; heading:string; description:string; accent:'blue'|'amber'; projectName:string;
 consultantDays:number; architectDays:number; consultantRateCents:number; architectRateCents:number;
 consultantCostCents:number; architectCostCents:number; maxDiscountBps:number; minMarginBps:number;
 reviewedPolicy:{maxDiscountBps:number;minMarginBps:number};
}
export interface QuoteInput {consultantDays:number;architectDays:number;discountBps:number}
export interface QuoteResult {grossCents:number;costCents:number;discountedTotalCents:number;marginPercent:number|null;reviewRequired:boolean;reasons:string[]}
const ROLES:ProposalRole[]=['ui','beacon','crest','pricing','reviewer'];
const integer=(maximum:number)=>({type:'integer',minimum:0,maximum});

export function contributionSchema(role:ProposalRole):Record<string,unknown>{
 if(!ROLES.includes(role))throw new Error('Unknown contribution role');
 let properties:Record<string,unknown>;
 if(role==='ui') properties={heading:{type:'string',minLength:1,maxLength:120},description:{type:'string',minLength:1,maxLength:400},accent:{type:'string',enum:['blue','amber']}};
 else if(role==='beacon'||role==='crest') properties={client:{type:'string',enum:[role]},projectName:{type:'string',minLength:1,maxLength:120},consultantDays:integer(3650),architectDays:integer(3650)};
 else if(role==='reviewer') properties={maxDiscountBps:integer(10000),minMarginBps:integer(10000)};
 else properties={consultantRateCents:integer(10000000),architectRateCents:integer(10000000),consultantCostCents:integer(10000000),architectCostCents:integer(10000000),maxDiscountBps:integer(10000),minMarginBps:integer(10000)};
 return {type:'object',properties,required:Object.keys(properties),additionalProperties:false};
}

export function validateContribution(role:ProposalRole,value:unknown):Record<string,unknown>{
 const schema=contributionSchema(role);
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Contribution must be an object');
 const data=value as Record<string,unknown>;
 const properties=schema.properties as Record<string,{type:string;maximum?:number;maxLength?:number;enum?:string[]}>;
 const fields=Object.keys(properties);
 if(Object.keys(data).length!==fields.length||Object.keys(data).some(key=>!fields.includes(key)))throw new Error('Contribution has missing or unsupported fields');
 const clean:Record<string,unknown>={};
 for(const [key,rule] of Object.entries(properties)){
  const item=data[key];
  if(rule.type==='integer'){
   if(typeof item!=='number'||!Number.isSafeInteger(item)||item<0||item>rule.maximum!)throw new Error(`${key} must be a bounded nonnegative integer`);
   clean[key]=item;
  }else{
   if(typeof item!=='string'||!item.trim()||rule.maxLength!==undefined&&item.length>rule.maxLength||rule.enum&&!rule.enum.includes(item))throw new Error(`${key} is not a permitted bounded string`);
   clean[key]=item.trim();
  }
 }
 if((role==='beacon'||role==='crest')&&(clean.consultantDays as number)+(clean.architectDays as number)===0)throw new Error('At least one billable day is required');
 if(role==='pricing'&&((clean.consultantRateCents as number)===0||(clean.architectRateCents as number)===0))throw new Error('Daily billing rates must be positive');
 return clean;
}

/** Independent expected facts are never included in worker schemas or model context. */
export function checkContributions(contributions:ProposalContributions):CheckResult[]{
 const checks:CheckResult[]=[];
 const clean:Partial<Record<ProposalRole,Record<string,unknown>>>={};
 for(const role of ROLES){
  if(contributions[role]===undefined){if(['ui','pricing','reviewer'].includes(role))checks.push({name:`${role} contribution is present`,passed:false});continue;}
  try{clean[role]=validateContribution(role,contributions[role]);checks.push({name:`${role} output follows its permitted schema`,passed:true});}
  catch{checks.push({name:`${role} output follows its permitted schema`,passed:false});}
 }
 checks.push({name:'A client-specific project contribution is present',passed:Boolean(clean.beacon||clean.crest)});
 const expect=(name:string,actual:unknown,expected:unknown)=>checks.push({name,passed:actual===expected,actual:[String(actual)],expected:[String(expected)]});
 if(clean.pricing){
  for(const [key,expected] of Object.entries({consultantRateCents:200000,architectRateCents:300000,consultantCostCents:120000,architectCostCents:180000,maxDiscountBps:2000,minMarginBps:3500})) expect(`Pricing: ${key} matches the independent commercial fixture`,clean.pricing[key],expected);
 }
 if(clean.reviewer){
  expect('Independent reviewer confirms the discount ceiling',clean.reviewer.maxDiscountBps,2000);
  expect('Independent reviewer confirms the margin floor',clean.reviewer.minMarginBps,3500);
 }
 if(clean.pricing&&clean.reviewer){
  expect('Pricing and reviewer agree on discount policy',clean.pricing.maxDiscountBps,clean.reviewer.maxDiscountBps);
  expect('Pricing and reviewer agree on margin policy',clean.pricing.minMarginBps,clean.reviewer.minMarginBps);
 }
 for(const client of ['beacon','crest'] as const){
  const project=clean[client];if(!project)continue;
  const consultantDays=client==='beacon'?20:10,architectDays=client==='beacon'?10:5;
  expect(`${client} consultant effort matches its own brief`,project.consultantDays,consultantDays);
  expect(`${client} architect effort matches its own brief`,project.architectDays,architectDays);
  if(clean.pricing){
   const gross=(project.consultantDays as number)*(clean.pricing.consultantRateCents as number)+(project.architectDays as number)*(clean.pricing.architectRateCents as number);
   const cost=(project.consultantDays as number)*(clean.pricing.consultantCostCents as number)+(project.architectDays as number)*(clean.pricing.architectCostCents as number);
   expect(`${client} undiscounted fees match its independent case`,gross,client==='beacon'?7000000:3500000);
   expect(`${client} delivery cost matches its independent case`,cost,client==='beacon'?4200000:2100000);
  }
 }
 return checks;
}

/** Self-contained trusted calculation, embedded verbatim into the standalone app below. */
export function calculateQuote(config:ProposalConfig,input:QuoteInput):QuoteResult{
 for(const [name,value,max] of [
  ['consultantDays',input.consultantDays,3650],['architectDays',input.architectDays,3650],['discountBps',input.discountBps,10000],
  ['consultantRateCents',config.consultantRateCents,10000000],['architectRateCents',config.architectRateCents,10000000],
  ['consultantCostCents',config.consultantCostCents,10000000],['architectCostCents',config.architectCostCents,10000000],
  ['maxDiscountBps',config.maxDiscountBps,10000],['minMarginBps',config.minMarginBps,10000],
 ] as Array<[string,number,number]>){
  if(!Number.isSafeInteger(value)||value<0||value>max)throw new Error(`${name} must be a bounded nonnegative integer`);
 }
 if(input.consultantDays+input.architectDays===0)throw new Error('Enter at least one billable day');
 const grossCents=input.consultantDays*config.consultantRateCents+input.architectDays*config.architectRateCents;
 if(grossCents===0)throw new Error('Gross fees must be positive');
 const costCents=input.consultantDays*config.consultantCostCents+input.architectDays*config.architectCostCents;
 // Bounds above keep products within safe integers. Round only once, to the nearest cent.
 const discountedTotalCents=Math.round(grossCents*(10000-input.discountBps)/10000);
 const profitCents=discountedTotalCents-costCents;
 const belowMargin=discountedTotalCents===0||profitCents*10000<discountedTotalCents*config.minMarginBps;
 const aboveDiscount=input.discountBps>config.maxDiscountBps;
 const reasons:string[]=[];
 if(aboveDiscount)reasons.push('Discount exceeds the approved ceiling');
 if(belowMargin)reasons.push(discountedTotalCents===0?'No net fees remain':'Margin is below the approved floor');
 return {grossCents,costCents,discountedTotalCents,marginPercent:discountedTotalCents===0?null:profitCents/discountedTotalCents*100,reviewRequired:aboveDiscount||belowMargin,reasons};
}

function escapeText(value:string){return value.replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[character]!);}
function compile(config:ProposalConfig):string{
 const data=JSON.stringify(config).replace(/[<>&\u2028\u2029]/g,character=>`\\u${character.charCodeAt(0).toString(16).padStart(4,'0')}`);
 const accent=config.accent==='amber'?'#a76616':'#244e9c';
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>${escapeText(config.projectName)} | Internal proposal pricing</title><style>
*{box-sizing:border-box}body{margin:0;background:#f4f5f7;color:#1c2636;font:16px system-ui,sans-serif;padding:28px}main{max-width:1040px;margin:auto}.classification{border:1px solid #e2c18b;background:#fff5df;border-radius:10px;padding:12px 16px;font-size:13px;color:#704814}.eyebrow{font-size:12px;font-weight:750;letter-spacing:.13em;text-transform:uppercase;color:${accent};margin-top:30px}h1{font-size:38px;line-height:1.1;letter-spacing:-.045em;margin:10px 0}p{line-height:1.5;color:#627085}.layout{display:grid;grid-template-columns:minmax(250px,.9fr) minmax(330px,1.1fr);gap:22px;margin-top:24px}.panel{background:white;border:1px solid #dce2e9;border-radius:16px;padding:26px}h2{font-size:18px;margin:0 0 20px}label{display:block;font-size:13px;font-weight:650;margin:16px 0 7px}input{width:100%;border:1px solid #c5cfdd;border-radius:8px;padding:12px;font:inherit;font-size:21px}button{width:100%;background:${accent};border:0;color:white;border-radius:8px;padding:14px;margin-top:22px;font:inherit;font-weight:650;cursor:pointer}input:focus-visible,button:focus-visible{outline:3px solid #e5b543;outline-offset:3px}.metric{display:flex;justify-content:space-between;gap:20px;padding:15px 0;border-bottom:1px solid #e7ecf1}.metric span{font-size:14px;color:#627085}.metric strong{font-size:21px}.total strong{font-size:30px;color:${accent}}#status{padding:16px;margin-top:22px;border-radius:10px;font-weight:700}#status.ok{background:#e9f5ed;color:#23623d}#status.review{background:#fff0e0;color:#8b4b0b}#reasons{font-size:14px;line-height:1.7;color:#754719}.policy{font-size:12px;border-top:1px solid #dce2e9;padding-top:16px;margin-top:24px;color:#647185}#error{color:#a3232d;min-height:22px;font-size:13px;margin-top:10px}footer{font-size:12px;color:#778296;margin-top:20px}@media(max-width:700px){body{padding:16px}.layout{grid-template-columns:1fr}h1{font-size:30px}}
</style></head><body><main><div class="classification"><strong>Internal partner-only tool</strong> · Restricted commercial policy is included. Do not publish or share with clients.</div><div class="eyebrow">${escapeText(config.client)} engagement · proposal planning</div><h1>${escapeText(config.heading)}</h1><p>${escapeText(config.description)}</p><div class="layout"><section class="panel"><h2>${escapeText(config.projectName)}</h2><form id="quote-form"><label for="consultantDays">Consultant days</label><input id="consultantDays" type="number" min="0" max="3650" step="1" value="${config.consultantDays}" required><label for="architectDays">Architect days</label><input id="architectDays" type="number" min="0" max="3650" step="1" value="${config.architectDays}" required><label for="discount">Proposed discount (%)</label><input id="discount" type="text" inputmode="decimal" value="0" required aria-describedby="error"><button type="submit">Recalculate proposal</button><div id="error" role="alert"></div></form></section><section class="panel" aria-live="polite"><h2>Commercial review</h2><div class="metric"><span>Undiscounted fees</span><strong id="gross"></strong></div><div class="metric"><span>Delivery cost</span><strong id="cost"></strong></div><div class="metric total"><span>Proposed fees</span><strong id="total"></strong></div><div class="metric"><span>Margin</span><strong id="margin"></strong></div><div id="status"></div><ul id="reasons"></ul><p class="policy">Discount ceiling: ${(config.maxDiscountBps/100).toFixed(2)}%. Margin floor: ${(config.minMarginBps/100).toFixed(2)}%. An in-policy result is not an authorization to send a proposal.</p></section></div><footer>Invented engagement and commercial figures. Standalone calculator with no network requests. Human partner approval remains required.</footer></main><script id="proposal-data" type="application/json">${data}</script><script>
(function(){'use strict';
const config=JSON.parse(document.getElementById('proposal-data').textContent);
const calculateQuote=${calculateQuote.toString()};
const form=document.getElementById('quote-form');
const money=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});
function update(event){if(event)event.preventDefault();try{
const raw=document.getElementById('discount').value.trim();if(!/^\\d{1,3}(?:\\.\\d{1,2})?$/.test(raw))throw new Error('Enter a discount from 0 to 100, with at most two decimal places.');
const parts=raw.split('.');const discountBps=Number(parts[0])*100+Number((parts[1]||'').padEnd(2,'0'));
const result=calculateQuote(config,{consultantDays:Number(document.getElementById('consultantDays').value),architectDays:Number(document.getElementById('architectDays').value),discountBps});
document.getElementById('gross').textContent=money.format(result.grossCents/100);document.getElementById('cost').textContent=money.format(result.costCents/100);document.getElementById('total').textContent=money.format(result.discountedTotalCents/100);document.getElementById('margin').textContent=result.marginPercent===null?'Not defined':result.marginPercent.toFixed(3)+'%';
const status=document.getElementById('status');status.textContent=result.reviewRequired?'Commercial review required':'Within commercial policy';status.className=result.reviewRequired?'review':'ok';
document.getElementById('reasons').replaceChildren(...result.reasons.map(function(reason){const li=document.createElement('li');li.textContent=reason;return li;}));document.getElementById('error').textContent='';
}catch(error){document.getElementById('error').textContent=error.message;for(const id of ['gross','cost','total','margin','status'])document.getElementById(id).textContent='';document.getElementById('reasons').replaceChildren();}}
form.addEventListener('submit',update);update();})();
</script></body></html>`;
}

export function assembleProposal(client:Client,contributions:ProposalContributions):{config:ProposalConfig;checks:CheckResult[];html:string;title:string}{
 if(client!=='beacon'&&client!=='crest')throw new Error('Unknown proposal client');
 // Select first, so the other client's brief cannot enter checks, configuration or exported HTML.
 const selected:ProposalContributions={ui:contributions.ui,pricing:contributions.pricing,reviewer:contributions.reviewer,[client]:contributions[client]};
 const checks=checkContributions(selected);
 if(!checks.length||checks.some(check=>!check.passed))throw new Error('Required contributions are missing, invalid or fail independent checks');
 const ui=validateContribution('ui',selected.ui),project=validateContribution(client,selected[client]),pricing=validateContribution('pricing',selected.pricing),reviewer=validateContribution('reviewer',selected.reviewer);
 const config:ProposalConfig={client,heading:ui.heading as string,description:ui.description as string,accent:ui.accent as 'blue'|'amber',projectName:project.projectName as string,consultantDays:project.consultantDays as number,architectDays:project.architectDays as number,consultantRateCents:pricing.consultantRateCents as number,architectRateCents:pricing.architectRateCents as number,consultantCostCents:pricing.consultantCostCents as number,architectCostCents:pricing.architectCostCents as number,maxDiscountBps:pricing.maxDiscountBps as number,minMarginBps:pricing.minMarginBps as number,reviewedPolicy:{maxDiscountBps:reviewer.maxDiscountBps as number,minMarginBps:reviewer.minMarginBps as number}};
 return {config,checks,html:compile(config),title:`${config.projectName} proposal pricing`};
}
