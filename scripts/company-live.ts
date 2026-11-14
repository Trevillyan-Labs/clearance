import {companyRuntime} from '../lib/company-runtime';
const rt=companyRuntime();
if(rt.store.snapshot().missionId)throw new Error('Existing company mission; inspect before retrying');
const timer=setInterval(()=>{const state=rt.state();for(const grant of state.grants)if(grant.status==='pending')rt.approve(grant.id);console.log(JSON.stringify({workers:state.workers.map(w=>({role:w.role,status:w.status,error:w.error})),artifacts:state.artifacts.length,error:state.runtime.error}));if(state.artifacts.length===2){clearInterval(timer);for(const a of state.artifacts)rt.store.deliver(a.id,'partner');console.log('LIVE_COMPANY_PAIR_DELIVERED');}else if(state.runtime.error||state.workers.some(w=>w.status==='failed')){clearInterval(timer);process.exitCode=1;}},2000);
setTimeout(()=>{clearInterval(timer);if(rt.store.snapshot().artifacts.length!==2)process.exitCode=1;},420000).unref();
await rt.start();
