import type {Engagement,Clearance,BrainDocument} from './types';
const BASE='https://api.hydradb.com';
export function hydraReady(){return Boolean(process.env.HYDRADB_API_KEY);}
export function database(){return process.env.CLEARANCE_HYDRA_DATABASE||'clearance_demo';}
export function collection(engagement:Engagement){return `client_${engagement}`;}
export function statusParams(engagement:Engagement,ids:string[]){const params=new URLSearchParams({database:database(),collection:collection(engagement)});for(const id of ids)params.append('ids',id);return params;}
export function queryBody(engagement:Engagement,clearance:Clearance,query:string){
 if(!['beacon','crest'].includes(engagement)||!Number.isInteger(clearance)||clearance<0||clearance>3)throw new Error('Invalid search authority');
 return {database:database(),collection:collection(engagement),query:query.slice(0,1500),type:'knowledge',query_by:'hybrid',mode:'fast',graph_context:false,query_apps:false,max_results:8,acl:Array.from({length:clearance+1},(_,n)=>`class-${n}@${engagement}.clearance.example.com`)};
}
async function request(path:string,init:RequestInit={}){
 if(!hydraReady())throw new Error('HydraDB credential unavailable. Configure HYDRADB_API_KEY at runtime.');
 const response=await fetch(BASE+path,{...init,headers:{Authorization:`Bearer ${process.env.HYDRADB_API_KEY}`,'API-Version':'2',...init.headers},signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw new Error(`HydraDB request failed (${response.status}); response body withheld`);
 const result=await response.json();if(result.success===false)throw new Error('HydraDB reported an unsuccessful operation');return result.data??result;
}
export function rankedSourceIds(result:unknown):string[]{
 const data=result as {chunks?:{id?:unknown}[]};if(!Array.isArray(data?.chunks))throw new Error('HydraDB response has no attributable chunks');
 return [...new Set(data.chunks.map(c=>c.id).filter((id):id is string=>typeof id==='string'))];
}
export async function searchBrain(engagement:Engagement,clearance:Clearance,query:string){return rankedSourceIds(await request('/query',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(queryBody(engagement,clearance,query))}));}
export async function seedBrain(documents:BrainDocument[]){
 try{await request('/databases',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({database:database()})});}catch(error){if(!(error instanceof Error&&error.message.includes('(409)')))throw error;}
 let ready=false;for(let i=0;i<30;i++){const status=await request(`/databases/status?database=${encodeURIComponent(database())}`);if(status.infra?.ready_for_ingestion){ready=true;break;}await new Promise(r=>setTimeout(r,1000));}if(!ready)throw new Error('HydraDB database not ready after 30 checks');
 for(const engagement of ['beacon','crest'] as const){
  const docs=documents.filter(d=>d.engagementId===engagement);const form=new FormData();form.set('database',database());form.set('collection',collection(engagement));form.set('type','knowledge');
  form.set('app_knowledge',JSON.stringify(docs.map(d=>({id:d.id,title:d.title,kind:'custom',provider:'clearance',fields:{kind:'custom',body:d.body},acl:[`class-${d.classification}@${engagement}.clearance.example.com`],additional_metadata:{engagement,version:d.contentVersion,classification:d.classification}}))));
  await request('/context/ingest',{method:'POST',body:form});
 }
 for(const engagement of ['beacon','crest'] as const){
  const docs=documents.filter(d=>d.engagementId===engagement);
  const deadline=Date.now()+300000;let indexed=false;while(Date.now()<deadline){const params=statusParams(engagement,docs.map(d=>d.id));const state=await request(`/context/status?${params}`);const rows=state.statuses??[];if(rows.some((s:{indexing_status:string})=>s.indexing_status==='errored'))throw new Error('HydraDB indexing failed');
   // The live status endpoint can lag searchable content. Readiness is measured by
   // actual attributed retrieval of every expected source in this client scope.
   try{const ids=await searchBrain(engagement,3,'purchase approval policy project brief methodology intake delivery checklist restricted threshold appendix');if(docs.every(d=>ids.includes(d.id))){indexed=true;break;}}catch{/* A new collection may not yet be queryable. Retry within the deadline. */}
   await new Promise(r=>setTimeout(r,2000));}if(!indexed)throw new Error('HydraDB search is not ready after five minutes. Inspect provider status before retrying ingestion.');
 }
 return {database:database(),documents:documents.length};
}
