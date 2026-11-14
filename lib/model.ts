import {mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
export interface Message {role:'system'|'user'|'assistant'|'tool';content:string|null;tool_calls?:ToolCall[];tool_call_id?:string}
export interface ToolCall {id:string;type:'function';function:{name:string;arguments:string}}
export interface Tool {type:'function';function:{name:string;description:string;parameters:Record<string,unknown>}}
export const MODEL='grok-4.7';
const path=join(process.cwd(),'.runtime','budget.json');
type Budget={requests:number,reservedDollars:number,inputTokens:number,outputTokens:number};
export function budget():Budget {return existsSync(path)?JSON.parse(readFileSync(path,'utf8')):{requests:0,reservedDollars:0,inputTokens:0,outputTokens:0};}
export function modelReady(){return Boolean(process.env.XAI_API_KEY);}
export async function infer(messages:Message[],tools:Tool[]=[]):Promise<Message>{
 if(!modelReady())throw new Error('Model credential unavailable. Configure XAI_API_KEY at runtime.');
 const serialized=JSON.stringify(messages);if(serialized.length>40000)throw new Error('Model input bound exceeded');
 const b=budget(), reserve=serialized.length*2/1e6+2048*6/1e6;
 if(b.requests>=100||b.reservedDollars+reserve>20)throw new Error('Session model budget reached');
 mkdirSync(join(process.cwd(),'.runtime'),{recursive:true});b.requests++;b.reservedDollars+=reserve;writeFileSync(path,JSON.stringify(b));
 const response=await fetch('https://api.x.ai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.XAI_API_KEY}`},body:JSON.stringify({model:MODEL,messages,max_tokens:2048,temperature:0,...(tools.length?{tools,tool_choice:'auto',parallel_tool_calls:false}:{})}),signal:AbortSignal.timeout(60000)});
 if(!response.ok)throw new Error(`Model request failed (${response.status}); credential and response body withheld`);
 const result=await response.json();const current=budget();current.inputTokens+=result.usage?.prompt_tokens??0;current.outputTokens+=result.usage?.completion_tokens??0;writeFileSync(path,JSON.stringify(current));
 const message=result.choices?.[0]?.message;if(!message)throw new Error('Model returned no message');return message;
}
