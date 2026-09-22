const {test}=require('node:test'),assert=require('node:assert/strict');
const {createManager,clawArgs}=require('./host-manager');
function fixture(changes={}){
 const flags={runtime:true,configured:true,systemd:true,systemdConfigured:true,service:true,running:true,restart:true,enabled:true,linger:true,boot:true,reachable:true,doctorOk:true,doctorFindings:[],...changes},calls=[],events=[];
 const execute=async(exe,args)=>{calls.push(args);const ok=output=>({ok:true,output}),fail=(code)=>({ok:false,output:'',code});
  if(args.includes('--version'))return flags.runtime?ok('OpenClaw 2026.9.3'):fail();
  if(args.includes('ps'))return ok(flags.systemd?'systemd':'init');
  if(args.some(x=>x.includes('cat /etc/wsl.conf')))return ok(flags.systemdConfigured?'[boot]\nsystemd=true\n':'');
  if(args.some(x=>x.startsWith('test -s')))return flags.configured?ok(''):fail();
  if(args.includes('id'))return ok('hostuser');
  if(args.includes('show-user'))return ok('Linger='+(flags.linger?'yes':'no'));
  if(args.includes('enable-linger')){flags.linger=true;return ok('');}
  if(args.includes('show'))return ok(`LoadState=${flags.service?'loaded':'not-found'}\nActiveState=${flags.running?'active':'inactive'}\nSubState=${flags.running?'running':'dead'}\nUnitFileState=${flags.enabled?'enabled':'disabled'}\nRestart=${flags.restart?'always':'no'}\nMainPID=${flags.running?'123':'0'}`);
  if(args.includes('health'))return ok(JSON.stringify({ok:flags.reachable,secret:'must-not-leak'}));
  if(args.includes('doctor')&&args.includes('--json'))return flags.doctorFail?fail():ok(flags.doctorRaw||JSON.stringify({ok:flags.doctorOk,findings:flags.doctorFindings,secret:'must-not-leak'}));
  if(args.includes('doctor')&&args.includes('--fix')){if(flags.failRepair)return fail();flags.repaired=true;flags.doctorOk=true;flags.doctorFindings=[];return ok('');}
  if(args.includes('install')){if(flags.failService)return fail();flags.service=true;return ok('');}
  if(args.includes('enable')){if(flags.failService)return fail();flags.enabled=true;flags.running=true;return ok('');}
  if(args.some(x=>x.includes('https://openclaw.ai/install-cli.sh'))){if(flags.failRuntime)return fail(flags.runtimeFailCode);flags.runtime=true;return ok('');}
  throw Error('Unexpected command '+JSON.stringify(args));
 };
 const manager=createManager({inventory:async()=>({wsl:{distributions:[{name:'Ubuntu-24.04'}]}}),execute,readBoot:async()=>flags.boot,installBoot:async()=>{if(flags.failBoot)throw Error('startup');flags.boot=true;},onChange:s=>events.push({...s})});
 return {manager,calls,events,flags};
}
test('healthy existing gateway is preserved, checked, and not reinstalled or restarted',async()=>{
 const f=fixture();const result=await f.manager.prepare('Ubuntu-24.04');assert.equal(result.phase,'ready');assert.equal(result.checks.pid,123);assert.ok(!f.calls.some(a=>a.includes('install')||a.includes('restart')||a.includes('kill')));assert.ok(!JSON.stringify(result).includes('must-not-leak'));
});
test('missing startup and linger are configured, then verified',async()=>{
 const f=fixture({boot:false,linger:false});const r=await f.manager.prepare('Ubuntu-24.04');assert.equal(r.phase,'ready');assert.ok(f.events.some(s=>s.phase==='startup'));assert.ok(f.calls.some(a=>a.includes('enable-linger')));
});
test('foreground gateway is not killed or duplicated',async()=>{
 const f=fixture({running:false,service:false});const r=await f.manager.prepare('Ubuntu-24.04');assert.equal(r.issue,'foreground');assert.ok(!f.calls.some(a=>a.includes('install')||a.includes('enable')));
});
test('fresh runtime install stops at account configuration, never claims ready',async()=>{
 const f=fixture({runtime:false,configured:false,service:false,running:false,reachable:false,boot:false});const r=await f.manager.prepare('Ubuntu-24.04');assert.equal(r.issue,'configuration');assert.equal(r.checks.runtime,true);assert.ok(f.events.some(s=>s.phase==='installing'));assert.ok(!f.calls.some(a=>a.includes('install')));
});
test('unsupported Linux is blocked before downloading',async()=>{
 const f=fixture({systemd:false,runtime:false});const r=await f.manager.prepare('Ubuntu-24.04');assert.equal(r.issue,'systemd');assert.ok(!f.calls.some(a=>a.some(x=>x.includes('https://'))));
});
test('service and startup failures cannot produce ready',async()=>{
 for(const flags of [{boot:false,failBoot:true},{service:false,running:false,reachable:false,failService:true},{restart:false}]){const f=fixture(flags);const r=await f.manager.prepare('Ubuntu-24.04');assert.equal(r.phase,'attention');assert.equal(r.busy,false);assert.ok(r.error);}
});
test('unknown distro rejects all commands, and duplicate jobs coalesce',async()=>{
 const f=fixture();assert.equal((await f.manager.prepare('Ubuntu; dangerous')).phase,'attention');assert.equal(f.calls.length,0);
 const a=f.manager.prepare('Ubuntu-24.04'),b=f.manager.prepare('Ubuntu-24.04');assert.equal(a,b);await a;assert.equal(f.manager.get().busy,false);
});
test('OpenClaw arguments remain positional rather than interpolated into shell',()=>{
 const message='hello; $(touch /tmp/nope)';const args=clawArgs('Ubuntu-24.04',['agent','--message',message]);assert.equal(args.at(-1),message);assert.ok(!args[5].includes(message));
});
test('doctor findings are surfaced but never block readiness',async()=>{
 const f=fixture({doctorOk:false,doctorFindings:[{id:'stale-auth-order',severity:'warning'}]});const r=await f.manager.prepare('Ubuntu-24.04');
 assert.equal(r.phase,'ready');assert.equal(r.checks.doctor.ok,false);assert.deepEqual(r.checks.doctor.findings,[{id:'stale-auth-order',severity:'warning'}]);assert.ok(!JSON.stringify(r).includes('must-not-leak'));
});
test('doctor is not consulted before OpenClaw is even installed',async()=>{
 const f=fixture({runtime:false,configured:false,service:false,running:false,reachable:false,boot:false});await f.manager.prepare('Ubuntu-24.04');
 // probe() runs twice on this path (before and after the install): doctor is
 // gated on runtime, so exactly one call — from the post-install probe — is expected.
 assert.equal(f.calls.filter(a=>a.includes('doctor')&&a.includes('--json')).length,1);
});
test('repair runs openclaw doctor --fix and re-probes the Host',async()=>{
 const f=fixture({doctorOk:false,doctorFindings:[{id:'legacy-model-ref'}]});
 const r=await f.manager.repair('Ubuntu-24.04');
 assert.ok(f.calls.some(a=>a.includes('doctor')&&a.includes('--fix')&&a.includes('--non-interactive')));
 assert.equal(r.phase,'ready');assert.equal(r.checks.doctor.ok,true);assert.deepEqual(r.checks.doctor.findings,[]);
});
test('a failed repair is reported without crashing, and duplicate jobs coalesce',async()=>{
 const f=fixture({failRepair:true});const r=await f.manager.repair('Ubuntu-24.04');
 assert.equal(r.phase,'attention');assert.equal(r.issue,'repair');assert.ok(r.error);
 const a=f.manager.repair('Ubuntu-24.04'),b=f.manager.repair('Ubuntu-24.04');assert.equal(a,b);await a;
});
test('a failed runtime download is classified by its real exit code',async()=>{
 const cases=[[6,/resolve/],[7,/firewall|network/],[28,/timed out/],[35,/secure connection/],[60,/certificate/],[23,/disk|free space/]];
 for(const [code,pattern] of cases){
  const f=fixture({runtime:false,configured:false,service:false,running:false,reachable:false,boot:false,failRuntime:true,runtimeFailCode:code});
  const r=await f.manager.prepare('Ubuntu-24.04');assert.equal(r.issue,'runtime');assert.match(r.error,pattern);
 }
});
test('an unrecognized runtime failure code falls back to the generic message',async()=>{
 const f=fixture({runtime:false,configured:false,service:false,running:false,reachable:false,boot:false,failRuntime:true,runtimeFailCode:1});
 const r=await f.manager.prepare('Ubuntu-24.04');assert.equal(r.issue,'runtime');assert.match(r.error,/could not finish downloading/);
});
test('doctor output shape matches a real openclaw doctor --json payload',async()=>{
 // Structurally mirrors `openclaw doctor --json` captured against a live install
 // on 2026-09-21 (checksRun/checksSkipped as numbers; findings mixing severities,
 // with fields like `target` present only on some checks). Values below are
 // scrubbed placeholders, not the real captured content.
 const raw=JSON.stringify({
  ok:false,checksRun:31,checksSkipped:29,
  findings:[
   {checkId:'core/doctor/runtime-tool-schemas',severity:'error',message:'Configured MCP server "example" could not expose runtime tools for schema validation.',path:'mcp.servers.example',requirement:'MCP server "example" requires OAuth authorization.',fixHint:'Fix or disable the offending MCP server, then rerun doctor.'},
   {checkId:'core/doctor/security',severity:'warning',message:'WARNING: openclaw.json contains plaintext secret-bearing config fields.',fixHint:'Paths: models.providers.example.apiKey\nMigrate them to SecretRefs with openclaw secrets configure.'},
   {checkId:'core/doctor/skill-workshop-tool-policy',severity:'warning',message:'tools.profile: "minimal" does not include "skill_workshop".',path:'tools.profile',target:'main',requirement:'Autonomous Skill Workshop review requires the skill_workshop tool.',fixHint:'Add tools.alsoAllow: ["skill_workshop"].'}
  ]
 });
 const f=fixture({doctorRaw:raw});const r=await f.manager.prepare('Ubuntu-24.04');
 assert.equal(r.checks.doctor.ok,false);assert.equal(r.checks.doctor.checksRun,31);assert.equal(r.checks.doctor.checksSkipped,29);
 assert.equal(r.checks.doctor.findings.length,3);assert.equal(r.checks.doctor.findings[2].target,'main');
 assert.equal(r.phase,'ready'); // advisory findings still allow readiness
});
test('systemd not enabled vs. an unsupported kernel produce distinct guidance',async()=>{
 const notEnabled=await fixture({systemd:false,systemdConfigured:false}).manager.prepare('Ubuntu-24.04');
 assert.match(notEnabled.error,/wsl\.conf/);
 const unsupported=await fixture({systemd:false,systemdConfigured:true}).manager.prepare('Ubuntu-24.04');
 assert.match(unsupported.error,/wsl --update/);
});
