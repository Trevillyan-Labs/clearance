import {Store} from '../lib/store';import {loadBrain} from '../lib/brain';import {Runtime} from '../lib/runtime';import {join} from 'node:path';import {mkdirSync,writeFileSync} from 'node:fs';
console.log('MODEL-ONLY INTEGRATION: real model, explicit fixture retrieval. This does NOT qualify HydraDB or the live demo.');
const docs=loadBrain(join(process.cwd(),'brain'));const store=new Store(':memory:',docs);const rt=new Runtime({store,search:async engagement=>docs.filter(d=>d.engagementId===engagement&&d.classification<=2).map(d=>d.id)});
const folder=join(process.cwd(),'.runtime','model-smoke');mkdirSync(folder,{recursive:true});
for(const client of ['beacon','crest'] as const){
 const run=rt.newSession(client,2);await rt.advance(run.id);const pending=store.listGrants().find(g=>g.runId===run.id&&g.status==='pending');
 if(!pending)throw new Error(client+' did not request the scoped grant: '+(rt.errors[run.id]??rt.phases[run.id]));
 rt.approve(pending.id);const started=Date.now();while(rt.sessions.get(run.id)?.running&&Date.now()-started<120000)await new Promise(r=>setTimeout(r,100));
 const artifact=store.listArtifacts().find(a=>a.runId===run.id);if(!artifact||artifact.state!=='ready')throw new Error(client+' did not produce a passing app: '+(rt.errors[run.id]??'failed checks'));
 store.deliver(artifact.id,client);writeFileSync(join(folder,client+'.html'),artifact.bundle);
 console.log(JSON.stringify({client,model:'grok-4.7',inheritedClass:artifact.inheritedClass,thresholdCents:artifact.workflow.thresholdCents,checks:artifact.checks.length,passed:artifact.checks.every(c=>c.passed),inputs:store.observedInputs(run.id).map(i=>i.docId),file:join(folder,client+'.html')}));
}
store.close();
