import { database, hydraReady, rankedSourceIds } from './hydra';
import type { CompanyDocument, Scope } from './company-types';
const BASE='https://api.hydradb.com';
const allowed:Scope[]=['firm','beacon','crest'];
export function companyHydraReady(){return hydraReady();}
export function companyCollection(scope:Scope){if(!allowed.includes(scope))throw new Error('Invalid company scope');return scope==='firm'?'company_firm':`proposal_${scope}`;}
export function companyQueryBody(scope:Scope,clearance:number,query:string){
 if(!Number.isInteger(clearance)||clearance<0||clearance>3||typeof query!=='string')throw new Error('Invalid search authority');
 return {database:database(),collection:companyCollection(scope),query:query.slice(0,1500),type:'knowledge',query_by:'hybrid',mode:'fast',graph_context:false,query_apps:false,max_results:8,acl:Array.from({length:clearance+1},(_,n)=>`class-${n}@${scope}.company.clearance.example.com`)};
}
async function request(path:string,init:RequestInit={},deadline?:number){
 if(!companyHydraReady())throw new Error('HydraDB credential unavailable');
 const timeout=deadline===undefined?20000:Math.min(20000,deadline-Date.now());if(timeout<=0)throw new Error('Company HydraDB readiness deadline reached');
 let response:Response;try{response=await fetch(BASE+path,{...init,headers:{Authorization:`Bearer ${process.env.HYDRADB_API_KEY}`,'API-Version':'2',...init.headers},signal:AbortSignal.timeout(timeout)});}catch{throw new Error('HydraDB network request failed or timed out');}
 if(!response.ok)throw new Error(`HydraDB request failed (${response.status}); response body withheld`);
 let result;try{result=await response.json();}catch{throw new Error('HydraDB returned invalid JSON');}if(result.success===false)throw new Error('HydraDB reported an unsuccessful operation');return result.data??result;
}
async function queryScope(scope:Scope,clearance:number,query:string,deadline?:number){return rankedSourceIds(await request('/query',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(companyQueryBody(scope,clearance,query))},deadline));}
export async function searchCompanyBrain(scopes:Scope[],clearance:number,query:string):Promise<string[]>{
 if(!Array.isArray(scopes)||scopes.length===0)throw new Error('At least one company scope required');
 const unique=[...new Set(scopes)];for(const scope of unique)companyQueryBody(scope,clearance,query);
 const ids:string[]=[];for(const scope of unique)ids.push(...await queryScope(scope,clearance,query));return [...new Set(ids)];
}
export async function seedCompanyBrain(docs:CompanyDocument[]){
 if(!docs.length||new Set(docs.map(d=>d.id)).size!==docs.length)throw new Error('Unique company sources required');
 for(const doc of docs){companyQueryBody(doc.scope,doc.classification,'');if(!doc.id.startsWith(doc.scope+'-')||!Number.isSafeInteger(doc.version)||doc.version<1||!doc.body.trim())throw new Error('Invalid company source labels');}
 const deadline=Date.now()+300000;
 try{await request('/databases',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({database:database()})},deadline);}catch(error){if(!(error instanceof Error&&error.message.includes('(409)')))throw error;}
 let ready=false;while(Date.now()<deadline){const status=await request(`/databases/status?database=${encodeURIComponent(database())}`,{},deadline);if(status.infra?.ready_for_ingestion){ready=true;break;}await new Promise(resolve=>setTimeout(resolve,Math.min(1000,Math.max(0,deadline-Date.now()))));}if(!ready)throw new Error('Company HydraDB database readiness exceeded five minutes');
 for(const scope of allowed){const sources=docs.filter(d=>d.scope===scope);if(!sources.length)continue;const form=new FormData();form.set('database',database());form.set('collection',companyCollection(scope));form.set('type','knowledge');form.set('app_knowledge',JSON.stringify(sources.map(d=>({id:d.id,title:d.title,kind:'custom',provider:'clearance-company',fields:{kind:'custom',body:d.body},acl:[`class-${d.classification}@${scope}.company.clearance.example.com`],additional_metadata:{scope,version:d.version,classification:d.classification}}))));await request('/context/ingest',{method:'POST',body:form},deadline);}
 // Actual attributed retrieval is the readiness evidence, not provider queued status.
 const verified=new Set<string>();while(Date.now()<deadline&&verified.size<docs.length){for(const doc of docs){if(verified.has(doc.id))continue;if(Date.now()>=deadline)break;try{const ids=await queryScope(doc.scope,3,`${doc.title} ${doc.body.slice(0,1000)}`,deadline);if(ids.includes(doc.id))verified.add(doc.id);}catch{/* Newly ingested collections may be temporarily unavailable. */}}if(verified.size<docs.length)await new Promise(resolve=>setTimeout(resolve,Math.min(2000,Math.max(0,deadline-Date.now()))));}
 if(verified.size!==docs.length)throw new Error('Company HydraDB source retrieval not ready within five minutes; inspect provider before retrying ingestion');
 return {database:database(),documents:docs.length,verified:verified.size,collections:allowed.filter(scope=>docs.some(d=>d.scope===scope)).map(companyCollection)};
}
