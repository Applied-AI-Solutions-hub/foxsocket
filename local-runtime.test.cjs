const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createWindowsRuntime,INSTALLER}=require('./local-runtime.cjs');
function fixture(){fs.mkdirSync(path.join(__dirname,'.qa'),{recursive:true});const root=fs.mkdtempSync(path.join(__dirname,'.qa','runtime-'));const calls=[];const exe=path.join(root,'Programs','Ollama','ollama.exe');return {root,calls,exe,env:{LOCALAPPDATA:root,ProgramFiles:path.join(root,'programs-other'),SystemRoot:path.join(root,'Windows')},api:{reachable:async()=>false}};}
test('download verifies signature before installing and reports byte progress',async()=>{
 const f=fixture(),progress=[];const runtime=createWindowsRuntime({...f,directory:path.join(f.root,'downloads'),platformName:'win32',fetchImpl:async url=>{assert.equal(url,INSTALLER);return new Response('installer',{headers:{'content-length':'9'}});},executeImpl:async(exe,args,options)=>{f.calls.push({exe,args,options});if(exe==='where.exe')throw Error('missing');if(exe.endsWith('OllamaSetup.exe')){fs.mkdirSync(path.dirname(f.exe),{recursive:true});fs.writeFileSync(f.exe,'fixture');}return {stdout:''};}});
 await runtime.install(p=>progress.push(p));const steps=f.calls.filter(c=>c.exe!=='where.exe');assert.equal(steps.length,2);assert.ok(steps[0].args.includes('-Command'));assert.match(steps[0].args.at(-1),/Get-AuthenticodeSignature/);assert.equal(steps[0].options.env.FOXSOCKET_INSTALLER,path.join(f.root,'downloads','OllamaSetup.exe'));assert.deepEqual(steps[1].args,['/VERYSILENT','/SUPPRESSMSGBOXES','/NORESTART','/SP-']);assert.ok(progress.some(p=>p.total===9&&p.completed===9));
});
test('signature failure prevents executing a downloaded installer',async()=>{
 const f=fixture();let executed=false;const runtime=createWindowsRuntime({...f,directory:path.join(f.root,'downloads'),platformName:'win32',fetchImpl:async()=>new Response('installer'),executeImpl:async exe=>{if(exe.endsWith('OllamaSetup.exe'))executed=true;throw Error('invalid signature');}});
 await assert.rejects(runtime.install(()=>{}),/signature/);assert.equal(executed,false);
});
test('already running Ollama is reused without starting another process',async()=>{
 const f=fixture();let spawned=false;const runtime=createWindowsRuntime({...f,directory:f.root,api:{reachable:async()=>true},spawnImpl:()=>{spawned=true;}});await runtime.start();assert.equal(spawned,false);
});
