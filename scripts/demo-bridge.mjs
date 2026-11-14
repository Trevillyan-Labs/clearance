import {createServer} from 'node:http';
import {timingSafeEqual} from 'node:crypto';
const key=process.env.CLEARANCE_BRIDGE_KEY;
if(!key||key.length<32)throw new Error('Bridge credential unavailable');
const paths=new Set(['/api/state','/api/action','/api/download','/api/company/state','/api/company/action','/api/company/compare','/api/company/download','/client/beacon','/client/crest','/company/client/beacon','/company/client/crest']);
createServer(async(req,res)=>{
 const candidate=typeof req.headers['x-clearance-bridge']==='string'?req.headers['x-clearance-bridge']:'';
 const actual=Buffer.from(candidate),expected=Buffer.from(key);
 if(actual.length!==expected.length||!timingSafeEqual(actual,expected)){res.writeHead(401);res.end('Authentication required');return;}
 const url=new URL(req.url,'http://127.0.0.1:3090');
 if(url.origin!=='http://127.0.0.1:3090'||!paths.has(url.pathname)||!['GET','POST'].includes(req.method)||req.method==='POST'&&!url.pathname.endsWith('/action')){res.writeHead(404);res.end('Not found');return;}
 try{
  const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>16384){res.writeHead(413);res.end('Request too large');return;}chunks.push(chunk);}
  const headers={'Host':'127.0.0.1:3090','sec-fetch-site':'same-origin'};
  const cookie=req.headers.cookie?.split(';').map(s=>s.trim()).find(s=>s.startsWith('clearance-session='));if(cookie)headers.cookie=cookie;
  if(req.method==='POST'){headers.origin='http://127.0.0.1:3090';headers['Content-Type']='application/json';}
  const response=await fetch(url,{method:req.method,headers,body:req.method==='POST'?Buffer.concat(chunks):undefined,redirect:'error',signal:AbortSignal.timeout(20000)});
  for(const name of ['content-type','content-disposition','content-security-policy']){const value=response.headers.get(name);if(value)res.setHeader(name,value);}
  const session=response.headers.getSetCookie().find(value=>value.startsWith('clearance-session='));if(session)res.setHeader('set-cookie',session);
  res.setHeader('Cache-Control','no-store');res.writeHead(response.status);res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(503);res.end('Local application unavailable');}
}).listen(3093,'127.0.0.1',()=>console.log('Authenticated demo bridge listening on loopback port 3093'));
