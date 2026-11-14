import { lstatSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import type { BrainDocument, Clearance, Engagement } from './types.ts';

/** Load only the explicitly named synthetic client folders; never resolve model-supplied paths. */
export function loadBrain(root: string): BrainDocument[] {
  if(lstatSync(root).isSymbolicLink())throw new Error('Brain root must not be a symbolic link');
  const documents:BrainDocument[]=[],ids=new Set<string>();
  for(const engagementId of ['beacon','crest'] as Engagement[]){
    const folder=join(root,engagementId);
    const folderStat=lstatSync(folder);
    if(folderStat.isSymbolicLink()||!folderStat.isDirectory())throw new Error('Client folder must not be a symbolic link');
    for(const name of readdirSync(folder).sort()){
      if(!name.endsWith('.md'))continue;
      const path=join(folder,name),stat=lstatSync(path);
      if(stat.isSymbolicLink()||!stat.isFile())throw new Error('Brain documents must not be symbolic links');
      if(stat.size>50000)throw new Error('Synthetic document exceeds prototype size limit');
      const text=readFileSync(path,'utf8');
      const match=/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(text);
      if(!match)throw new Error('Synthetic document requires explicit metadata');
      const fields:Record<string,string>={};
      for(const line of match[1].split(/\r?\n/)){
        if(!line.trim())continue;
        const pair=/^([a-zA-Z]+):\s*(.*?)\s*$/.exec(line);
        if(!pair||fields[pair[1]]!==undefined)throw new Error('Invalid synthetic document metadata');
        const value=pair[2];fields[pair[1]]=value.length>=2&&((value.startsWith('"')&&value.endsWith('"'))||(value.startsWith("'")&&value.endsWith("'")))?value.slice(1,-1):value;
      }
      if(fields.engagement!==engagementId||!fields.id?.startsWith(`${engagementId}-`))throw new Error('Synthetic document ownership does not match client folder');
      if(!/^[a-z0-9-]+$/.test(fields.id)||ids.has(fields.id))throw new Error('Duplicate or invalid synthetic source ID');
      if(!/^[0-3]$/.test(fields.classification??'')||!/^\d+$/.test(fields.version??'')||Number(fields.version)<1||!fields.title)throw new Error('Missing or invalid synthetic authority metadata');
      if(Object.keys(fields).some(key=>!['id','title','engagement','classification','version'].includes(key)))throw new Error('Unknown synthetic document metadata');
      const body=match[2];if(!body.trim())throw new Error('Empty synthetic source');
      ids.add(fields.id);
      documents.push({id:fields.id,engagementId,title:fields.title,classification:Number(fields.classification) as Clearance,contentVersion:fields.version,policyVersion:1,body,bodyHash:createHash('sha256').update(body).digest('hex'),path:resolve(path)});
    }
  }
  return documents;
}
