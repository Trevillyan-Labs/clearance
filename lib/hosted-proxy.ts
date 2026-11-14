import type {NextRequest} from 'next/server';
/** The Vercel project must enforce deployment authentication. */
export async function hostedProxy(req:NextRequest):Promise<Response|null>{
 if(process.env.VERCEL!=='1')return null;
 const origin=process.env.CLEARANCE_BACKEND_ORIGIN,key=process.env.CLEARANCE_BRIDGE_KEY;
 if(!origin||!key)return Response.json({error:'Live backend is not configured'},{status:503});
 const target=new URL(origin);if(target.protocol!=='https:'||target.username||target.password)throw new Error('Invalid backend origin');
 const method=req.method,host=req.headers.get('host');
 if(!['GET','POST'].includes(method))return Response.json({error:'Method refused'},{status:405});
 if(req.headers.get('sec-fetch-site')==='cross-site'||(method==='POST'&&req.headers.get('origin')!==`https://${host}`))return Response.json({error:'Same-origin operator request required'},{status:403});
 const headers=new Headers({'x-clearance-bridge':key});
 const cookie=req.cookies.get('clearance-session')?.value;if(cookie)headers.set('cookie',`clearance-session=${encodeURIComponent(cookie)}`);
 if(method==='POST')headers.set('Content-Type','application/json');
 target.pathname=req.nextUrl.pathname;target.search=req.nextUrl.search;
 let upstream:Response;
 try{upstream=await fetch(target,{method,headers,body:method==='POST'?await req.text():undefined,cache:'no-store',redirect:'error',signal:AbortSignal.timeout(25000)});}catch{return Response.json({error:'Live Mac backend unavailable. Check the tunnel and local server.'},{status:503});}
 const resultHeaders=new Headers({'Cache-Control':'no-store'});
 for(const name of ['content-type','content-disposition','content-security-policy']){const value=upstream.headers.get(name);if(value)resultHeaders.set(name,value);}
 const cookieValue=upstream.headers.getSetCookie().find(value=>value.startsWith('clearance-session='));if(cookieValue)resultHeaders.set('set-cookie',cookieValue+'; Secure');
 return new Response(upstream.body,{status:upstream.status,headers:resultHeaders});
}
