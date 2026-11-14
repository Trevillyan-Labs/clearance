import {mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
export interface Message {role:'system'|'user'|'assistant'|'tool';content:string|null;tool_calls?:ToolCall[];tool_call_id?:string}
export interface ToolCall {id:string;type:'function';function:{name:string;arguments:string}}
export interface Tool {type:'function';function:{name:string;description:string;parameters:Record<string,unknown>}}
export const MODEL='grok-4.7';
const path=join(process.cwd(),'.runtime','budget.json');
export type Budget={requests:number;reservedDollars:number;inputTokens:number;outputTokens:number};
export function budget():Budget {return existsSync(path)?JSON.parse(readFileSync(path,'utf8')):{requests:0,reservedDollars:0,inputTokens:0,outputTokens:0};}
function saveBudget(value:Budget){mkdirSync(join(process.cwd(),'.runtime'),{recursive:true});writeFileSync(path,JSON.stringify(value));}
export function modelReady(){return Boolean(process.env.XAI_API_KEY);}
interface Dependencies {
 apiKey:()=>string|undefined;
 fetch:typeof fetch;
 readBudget:()=>Budget;
 writeBudget:(value:Budget)=>void;
 sleep:(milliseconds:number)=>Promise<void>;
}

/** Injected transport/state keeps tests away from live credentials, files and API calls. */
export function createInferenceClient(dependencies:Dependencies){
 return async function infer(messages:Message[],tools:Tool[]=[]):Promise<Message>{
  const key=dependencies.apiKey();
  if(!key)throw new Error('Model credential unavailable. Configure XAI_API_KEY at runtime.');
  const input=JSON.stringify({messages,tools});
  if(input.length>40000)throw new Error('Model input bound exceeded');
  // Conservative reservation includes tool schemas. Failed reservations remain held.
  const reserve=Buffer.byteLength(input,'utf8')*2/1e6+2048*6/1e6;
  const body=JSON.stringify({model:MODEL,messages,max_tokens:2048,temperature:0,...(tools.length?{tools,tool_choice:'auto',parallel_tool_calls:false}:{})});
  for(let attempt=0;attempt<2;attempt++){
   const current=dependencies.readBudget();
   if(current.requests>=100||current.reservedDollars+reserve>20)throw new Error('Session model budget reached');
   current.requests++;current.reservedDollars+=reserve;dependencies.writeBudget(current);
   let response:Response;
   try{
    response=await dependencies.fetch('https://api.x.ai/v1/chat/completions',{
     method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},body,signal:AbortSignal.timeout(60000),
    });
   }catch{
    if(attempt===0){await dependencies.sleep(250);continue;}
    throw new Error('Model request failed after one retry (network or timeout); details withheld');
   }
   if(!response.ok){
    const retryable=response.status===429||response.status>=500&&response.status<=599;
    // Do not read or log a provider error body; release its stream before retrying.
    try{await response.body?.cancel();}catch{/* Stream disposal cannot change the retry policy. */}
    if(attempt===0&&retryable){await dependencies.sleep(250);continue;}
    throw new Error(`Model request failed (${response.status}); credential and response body withheld`);
   }
   let result;
   try{result=await response.json();}catch(error){
    const interrupted=error instanceof TypeError||error instanceof DOMException&&(error.name==='TimeoutError'||error.name==='AbortError');
    if(attempt===0&&interrupted){await dependencies.sleep(250);continue;}
    throw new Error('Model returned an invalid or interrupted response; response body withheld');
   }
   if(!result||typeof result!=='object')throw new Error('Model returned an invalid response; response body withheld');
   const usage=dependencies.readBudget();
   const tokens=(value:unknown)=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=0?value:0;
   usage.inputTokens+=tokens(result.usage?.prompt_tokens);usage.outputTokens+=tokens(result.usage?.completion_tokens);dependencies.writeBudget(usage);
   const message=result.choices?.[0]?.message;
   if(!message)throw new Error('Model returned no message');
   return message;
  }
  throw new Error('Model request attempts exhausted');
 };
}

export const infer=createInferenceClient({
 apiKey:()=>process.env.XAI_API_KEY,
 fetch:(...args)=>fetch(...args),
 readBudget:budget,
 writeBudget:saveBudget,
 sleep:(milliseconds)=>new Promise(resolve=>setTimeout(resolve,milliseconds)),
});
