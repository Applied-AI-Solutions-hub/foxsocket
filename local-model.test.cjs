const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createLocalApi,createLocalSetup,DEFAULT_MODEL}=require('./local-model.cjs');
const response=value=>new Response(JSON.stringify(value),{status:200,headers:{'content-type':'application/json'}});
test('a reachable Ollama server without the selected model is never ready',async()=>{
 let generated=false;const api=createLocalApi({fetchImpl:async(url)=>{if(url.endsWith('/api/chat'))generated=true;return response({models:[{name:'another:latest'}]});}});
 await assert.rejects(api.verify(DEFAULT_MODEL),/not downloaded/);assert.equal(generated,false);
});
test('verification requires a finished visible reply from the exact selected local model',async()=>{
 const calls=[];let reply=null;
 const api=createLocalApi({fetchImpl:async(url,options)=>{calls.push([url,options]);if(url.endsWith('/api/tags'))return response({models:[{name:DEFAULT_MODEL}]});if(url.endsWith('/api/show'))return response({});return response(reply||{model:DEFAULT_MODEL,done:true,message:{content:JSON.parse(options.body).messages.at(-1).content.includes('7 plus 5')?'12':'blue'}});}});
 assert.equal((await api.verify(DEFAULT_MODEL)).checks.length,2);
 assert.equal(JSON.parse(calls.at(-1)[1].body).model,DEFAULT_MODEL);assert.ok(calls.every(([,opts])=>opts.signal));
 for(const value of [{model:DEFAULT_MODEL,done:false,message:{content:'12'}},{model:DEFAULT_MODEL,done:true,message:{content:''}},{model:'wrong:1b',done:true,message:{content:'12'}},{model:DEFAULT_MODEL,done:true,message:{content:'I have access to device notes about Applied.'}}]){reply=value;await assert.rejects(api.verify(DEFAULT_MODEL));}
});
test('cloud aliases are rejected before generation',async()=>{
 let calls=0;const api=createLocalApi({fetchImpl:async url=>{calls++;return response(url.endsWith('/api/tags')?{models:[{name:DEFAULT_MODEL}]}:{remote_host:'https://cloud.example'});}});
 await assert.rejects(api.verify(DEFAULT_MODEL),/remote server/);assert.equal(calls,2);
 await assert.rejects(api.installed('gpt-oss:120b-cloud'),/on-device/);
});
test('streamed download handles chunk boundaries and requires final success',async()=>{
 const updates=[];let payload='{"status":"pulling","total":100,"completed":42}\n{"status":"success"}\n';
 const api=createLocalApi({fetchImpl:async()=>new Response(new ReadableStream({start(controller){for(const part of [payload.slice(0,9),payload.slice(9)])controller.enqueue(new TextEncoder().encode(part));controller.close();}}))});
 await api.pull(DEFAULT_MODEL,p=>updates.push(p));assert.equal(updates[0].completed,42);assert.equal(updates[0].total,100);
 assert.equal(updates[0].message,'Downloading model files.');assert.equal(updates[0].detail,'pulling');
 payload='{"status":"pulling","completed":42}\n';await assert.rejects(api.pull(DEFAULT_MODEL,()=>{}),/interrupted/);
 payload='{"error":"out of space"}\n';await assert.rejects(api.pull(DEFAULT_MODEL,()=>{}),/out of space/);
});

test('progress bursts are checkpointed, transitions flush, and the checkpoint can resume',async()=>{
 let time=0,release;const writes=[],updates=[];
 const pause=new Promise(resolve=>release=resolve);
 const api={reachable:async()=>true,installed:async()=>false,pull:async(_,progress)=>{
  for(time=0;time<1000;time++)progress({completed:time,total:1000,message:'Downloading model files.'});
  await pause;
 },verify:async()=>({reply:'12 / blue'})};
 const manager=createLocalSetup({api,platform:{},now:()=>time,write:s=>writes.push(s),onChange:s=>updates.push(s)});
 const job=manager.prepare(DEFAULT_MODEL);
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(manager.get().completed,999,'memory retains the latest record');
 const checkpoints=writes.filter(s=>s.phase==='downloading-model'&&s.message==='Downloading model files.');
 assert.equal(checkpoints.length,4,'1000 progress records produce four checkpoints');
 assert.equal(checkpoints.at(-1).completed,750);
 assert.equal(updates.length,writes.length);
 const resumed=createLocalSetup({api,platform:{},read:()=>writes.at(-1)});
 assert.equal(resumed.get().phase,'interrupted');assert.equal(resumed.get().model,DEFAULT_MODEL);
 release();await job;
 assert.equal(writes.at(-2).phase,'verifying');assert.equal(writes.at(-1).phase,'ready');
 assert.equal(writes.at(-1).busy,false);assert.equal(writes.at(-1).verified,true);
});

test('an error immediately flushes even inside the progress throttle window',async()=>{
 const writes=[];
 const api={reachable:async()=>true,installed:async()=>false,pull:async(_,progress)=>{
  progress({completed:1,total:10});progress({completed:2,total:10});throw Error('download stopped');
 }};
 const manager=createLocalSetup({api,platform:{},now:()=>0,write:s=>writes.push(s)});
 await manager.prepare(DEFAULT_MODEL);
 assert.equal(writes.at(-1).phase,'attention');assert.equal(writes.at(-1).error,'download stopped');
 assert.equal(writes.at(-1).completed,2);assert.equal(writes.at(-1).busy,false);
});
function fixture(saved=null){
 const calls=[],writes=[],updates=[];let reachable=false,downloaded=false,failure=null;
 const api={reachable:async()=>reachable,installed:async()=>downloaded,pull:async(model,progress)=>{calls.push('pull');progress({completed:10,total:20,message:'downloading'});if(failure)throw Error(failure);downloaded=true;},verify:async model=>{calls.push('verify');if(failure)throw Error(failure);return {ok:true,model,reply:'hello'};}};
 const platform={find:async()=>{calls.push('find');return reachable?'ollama.exe':null;},install:async progress=>{calls.push('install');progress({phase:'installing-runtime',message:'Installing'});},start:async()=>{calls.push('start');reachable=true;}};
 const manager=createLocalSetup({api,platform,read:()=>saved,write:value=>writes.push({...value}),onChange:value=>updates.push(value)});
 return {manager,calls,writes,updates,setOnline:value=>reachable=value,setDownloaded:value=>downloaded=value,setFailure:value=>failure=value};
}
test('fresh setup installs, starts, downloads and verifies in order; concurrent clicks coalesce',async()=>{
 const f=fixture();const first=f.manager.prepare(DEFAULT_MODEL);assert.equal(first,f.manager.prepare(DEFAULT_MODEL));await first;
 assert.deepEqual(f.calls,['find','install','start','pull','verify']);assert.equal(f.manager.get().verified,true);assert.equal((await f.manager.status(DEFAULT_MODEL)).ok,true);
 assert.ok(f.updates.some(s=>s.total===20&&s.completed===10));assert.equal((await f.manager.status('different-model:latest')).ok,false);
 f.setOnline(false);assert.equal((await f.manager.status(DEFAULT_MODEL)).ok,false);f.setOnline(true);assert.equal((await f.manager.status(DEFAULT_MODEL)).ok,false);
});
test('download failures and interrupted sessions retain the model and last result',async()=>{
 const f=fixture();f.setFailure('disk full');await f.manager.prepare(DEFAULT_MODEL);assert.equal(f.manager.get().error,'disk full');assert.equal(f.manager.get().verified,false);
 f.setFailure(null);await f.manager.prepare(DEFAULT_MODEL);assert.equal(f.manager.get().verified,true);
 const resumed=fixture({phase:'downloading-model',busy:true,model:'llama3.2:3b',error:'previous failure'});assert.equal(resumed.manager.get().phase,'interrupted');assert.equal(resumed.manager.get().model,'llama3.2:3b');assert.equal(resumed.manager.get().error,'previous failure');
});
test('existing setup is reverified after app restart without reinstalling or downloading',async()=>{
 const f=fixture({phase:'ready',model:DEFAULT_MODEL,verified:true});f.setOnline(true);f.setDownloaded(true);
 assert.equal(f.manager.get().verified,false);assert.equal((await f.manager.status(DEFAULT_MODEL)).ok,true);await f.manager.status(DEFAULT_MODEL);assert.deepEqual(f.calls,['verify']);
});
test('a verification-only check cannot install software or download a model',async()=>{
 const f=fixture();await f.manager.verify(DEFAULT_MODEL);assert.deepEqual(f.calls,['find']);assert.equal(f.manager.get().verified,false);
 f.setOnline(true);await f.manager.verify(DEFAULT_MODEL);assert.equal(f.manager.get().verified,false);assert.equal(f.calls.includes('pull'),false);
});
