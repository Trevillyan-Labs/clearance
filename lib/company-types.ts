export type Scope = 'firm' | 'beacon' | 'crest';
export type CompanyClearance = 0 | 1 | 2 | 3;
export type WorkerRole = 'ui' | 'beacon' | 'crest' | 'pricing' | 'reviewer';
export interface CompanyDocument { id:string; title:string; scope:Scope; classification:CompanyClearance; version:number; body:string }
export interface CompanyWorker { id:string; role:WorkerRole; label:string; clearance:CompanyClearance; scopes:Scope[]; status:string; inputs:string[]; contribution?:Record<string,unknown>; error?:string }
export interface CompanyGrant { id:string; workerId:string; docId:string; version:number; status:'pending'|'approved'|'consumed'|'expired'; expiresAt:string; createdAt:string; consumedAt?:string }
export interface CompanyArtifact { id:string; client:'beacon'|'crest'; title:string; classification:CompanyClearance; scopes:Scope[]; sourceIds:string[]; config:Record<string,unknown>; checks:Array<{name:string;passed:boolean}>; html:string; state:'ready'|'failed'|'delivered' }
export interface CompanyEvent { id:string; type:string; message:string; workerId?:string; docId?:string; at:string }
export interface CompanySnapshot { missionId:string|null; docs:CompanyDocument[]; workers:CompanyWorker[]; grants:CompanyGrant[]; artifacts:CompanyArtifact[]; events:CompanyEvent[] }
export type Worker=CompanyWorker;
export type Grant=CompanyGrant;
export type Artifact=CompanyArtifact;
