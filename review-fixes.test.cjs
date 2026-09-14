const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const data=require('./workspace-data'),{parseResponse}=require('./json-response'),{colorMode,restoredMode}=require('./lighting-policy'),{installCommand,integrity}=require('./runtime-install');
const state=()=>({notes:'notes',tasks:[{id:'old-task',text:'task',done:false}],chat:[{role:'user',text:'hello',time:1}],session:'private-session',connection:{distro:'Ubuntu-24.04',agentId:'main'},setup:{deviceId:'private-device'},lightingSnapshot:[{key:'private-board'}],conversations:[{id:'private-archive',title:'Earlier',connection:{agentId:'private-agent'},chat:[{role:'assistant',text:'earlier reply'}]}]});
test('portable export strips identities recursively; import preserves this PC and full content',()=>{
 const original=state(),raw=data.exportBackup(original);for(const secret of ['private-session','private-device','private-board','private-archive','private-agent'])assert.ok(!raw.includes(secret));
 const restored=data.restoreContent(original,data.parseBackup(raw));assert.deepEqual(restored.connection,original.connection);assert.deepEqual(restored.setup,original.setup);assert.deepEqual(restored.lightingSnapshot,original.lightingSnapshot);assert.deepEqual(restored.chat,original.chat);assert.deepEqual(restored.conversations[0].chat,original.conversations[0].chat);assert.notEqual(restored.session,original.session);assert.equal(original.session,'private-session');
});
test('malformed, future, oversized and hostile backups fail without changing source',()=>{
 const source=state(),before=JSON.stringify(source);
 for(const raw of ['{',JSON.stringify({format:'foxsocket-workspace',version:2,content:{}}),' '.repeat(data.MAX_BYTES+1)])assert.throws(()=>data.parseBackup(raw));
 for(const value of [{chat:[{role:'system',text:'inject'}]},{tasks:[{text:'x',done:'yes'}]},{notes:'x'.repeat(50001)},{conversations:[{chat:'bad'}]}])assert.throws(()=>data.parseBackup(JSON.stringify({format:'foxsocket-workspace',version:1,content:value})));
 assert.equal(JSON.stringify(source),before);
 const clean=data.parseBackup('{"format":"foxsocket-workspace","version":1,"content":{"__proto__":{"polluted":true},"connection":{"agentId":"evil"}}}');assert.equal({}.polluted,undefined);assert.equal(clean.connection,undefined);
});
test('JSON protocol handles braces in log text but rejects ambiguity and malformed responses',()=>{
 assert.deepEqual(parseResponse('log {not JSON}\n{"ok":true}\nfinished'),{ok:true});assert.deepEqual(parseResponse('[{"id":"main"}]','array'),[{id:'main'}]);assert.throws(()=>parseResponse('{"ok":true}\n{"ok":false}'));assert.throws(()=>parseResponse('not JSON'));assert.throws(()=>parseResponse('[]'));
});
const mode={id:1,name:'Static',colors:[],speedMin:0,speedMax:10,speed:1,brightnessMin:0,brightnessMax:100,brightness:20,direction:0,colorMode:1};
const device=()=>({name:'Generic',modes:[structuredClone(mode),{...mode,id:2,name:'Direct'}],colors:[{red:1,green:2,blue:3}]});
test('lighting preserves known board mode and validates snapshots against present capabilities',()=>{
 const d=device();assert.equal(colorMode(d).name,'Static');assert.equal(colorMode({...d,name:'B650 UD AX-Y1'}).name,'Direct');
 const s={mode:{...mode,brightness:40,extra:'not allowed'},colors:d.colors};const result=restoredMode(d,s);assert.equal(result.brightness,40);assert.equal(result.extra,undefined);
 for(const patch of [{colors:[]},{colors:[{red:256,green:0,blue:0}]},{mode:{...mode,id:55}},{mode:{...mode,name:'Other'}},{mode:{...mode,brightness:101}},{mode:{...mode,direction:999}}])assert.throws(()=>restoredMode(d,{...s,...patch}));
});
test('both installer entry points share pinned integrity enforcement before execution',()=>{
 const command=installCommand();assert.match(integrity.sha256,/^[a-f0-9]{64}$/);assert.ok(command.indexOf('sha256sum --check --status')<command.indexOf('bash "$file"'));assert.match(command,/set -eu/);assert.match(command,/--proto-redir =https/);assert.throws(()=>installCommand({...integrity,sha256:'oops'}));assert.throws(()=>installCommand({...integrity,url:'http://evil.invalid'}));
 assert.ok(fs.readFileSync('host-manager.js','utf8').includes('installCommand()'));assert.ok(fs.readFileSync('workspace-main.js','utf8').includes('runtime: installCommand()'));
});
test('packaged production entry contains no smoke execution or credential collection handlers',()=>{
 assert.ok(!fs.readFileSync('main.js','utf8').includes('--smoke-test'));
 for(const file of ['preload.js','updates-main.js'])assert.ok(!fs.readFileSync(file,'utf8').includes('updates-save-access'));
 const files=require('./package.json').build.files;for(const helper of ['workspace-data.js','json-response.js','runtime-install.js','lighting-policy.js','build/runtime-integrity.json'])assert.ok(files.includes(helper));assert.ok(!files.includes('app.js'));
});
test('actual shell verifier blocks altered bytes and permits matching fixture without network',()=>{
 const {spawnSync}=require('node:child_process'),crypto=require('node:crypto');
 const gitBash='C:/Program Files/Git/bin/bash.exe';
 const useWsl=process.platform==='win32'&&!fs.existsSync(gitBash)&&process.env.FOXSOCKET_TEST_WSL_DISTRO;
 const bash=useWsl?'wsl.exe':process.platform==='win32'?gitBash:'/bin/bash';
 const shellArgs=command=>useWsl?['-d',process.env.FOXSOCKET_TEST_WSL_DISTRO,'--exec','bash','-c',command]:['-c',command];
 const script='printf VERIFIED_FIXTURE';const hash=crypto.createHash('sha256').update(script).digest('hex');
 const prefix=`curl(){ for arg in "$@"; do dest="$arg"; done; printf '%s' '${script}' > "$dest"; }; `;
 const bad=spawnSync(bash,shellArgs(prefix+installCommand({...integrity,sha256:'0'.repeat(64)})),{encoding:'utf8',timeout:10000});
 assert.ifError(bad.error);assert.notEqual(bad.status,0);assert.ok(!bad.stdout.includes('VERIFIED_FIXTURE'));
 const good=spawnSync(bash,shellArgs(prefix+installCommand({...integrity,sha256:hash})),{encoding:'utf8',timeout:10000});
 assert.ifError(good.error);assert.equal(good.status,0,good.stderr);assert.equal(good.stdout,'VERIFIED_FIXTURE');
});
