import { lstatSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { CompanyDocument, CompanyClearance, Scope } from './company-types.ts';
export function loadCompanyBrain(root:string):CompanyDocument[]{
  const check=(path:string,directory:boolean)=>{const s=lstatSync(path);if(s.isSymbolicLink()||(directory?!s.isDirectory():!s.isFile())||(!directory&&s.size>50000))throw new Error('Invalid synthetic brain path');};
  check(root,true);const result:CompanyDocument[]=[];const ids=new Set<string>();
  for(const scope of ['firm','beacon','crest'] as Scope[]){const folder=join(root,scope);check(folder,true);for(const name of readdirSync(folder).sort()){if(!name.endsWith('.md'))continue;const path=join(folder,name);check(path,false);const match=/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]+)$/.exec(readFileSync(path,'utf8'));if(!match)throw new Error('Missing document labels');const labels:Record<string,string>={};for(const line of match[1].split(/\r?\n/)){const pair=/^(id|title|scope|classification|version):\s*(.+)$/.exec(line);if(!pair||labels[pair[1]])throw new Error('Invalid document labels');labels[pair[1]]=pair[2];}if(labels.scope!==scope||!labels.id?.startsWith(scope+'-')||!/^[a-z0-9-]+$/.test(labels.id)||ids.has(labels.id)||!labels.title||!/^[0-3]$/.test(labels.classification)||!/^\d+$/.test(labels.version)||!Number.isSafeInteger(Number(labels.version))||Number(labels.version)<1||!match[2].trim())throw new Error('Invalid document authority');ids.add(labels.id);result.push({id:labels.id,title:labels.title,scope,classification:Number(labels.classification) as CompanyClearance,version:Number(labels.version),body:match[2]});}}
  return result;
}
