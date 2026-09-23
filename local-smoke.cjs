const {app,BrowserWindow,ipcMain,net}=require('electron'),fs=require('fs'),path=require('path');
const profile=path.join(__dirname,'.qa','local-test-'+Date.now());fs.mkdirSync(profile,{recursive:true});app.setPath('userData',profile);
net.fetch=async()=>{throw Error('Offline update fixture');};
let running=false,installed=false,attempts=0,verified=0,installs=0;
require('./local-model.cjs').createLocalApi=()=>({
 reachable:async()=>running,installed:async()=>installed,
 pull:async(model,progress)=>{attempts++;progress({message:'Downloading model layer',total:100,completed:50});await new Promise(r=>setTimeout(r,250));if(attempts===1)throw Error('Test download interrupted');installed=true;},
 verify:async model=>{verified++;return {ok:true,model,reply:'hello from '+model};}
});
require('./local-runtime.cjs').createWindowsRuntime=()=>({find:async()=>running?'ollama.exe':null,install:async()=>{installs++;},start:async()=>{running=true;}});
require('./main');
for(const name of ['metrics','setup-check'])ipcMain.removeHandler(name);
ipcMain.handle('metrics',()=>({memoryTotal:8*1024**3}));ipcMain.handle('setup-check',()=>({wsl:{distributions:[]}}));
app.whenReady().then(async()=>{
 const win=BrowserWindow.getAllWindows()[0];if(win.webContents.isLoading())await new Promise(r=>win.webContents.once('did-finish-load',r));
 try{
  await new Promise(r=>setTimeout(r,300));
  const result=await win.webContents.executeJavaScript(`(async()=>{
   const $=s=>document.querySelector(s),wait=ms=>new Promise(r=>setTimeout(r,ms)),check=(v,m)=>{if(!v)throw Error(m)};
   $('[data-role=host]').click();await wait(100);check($('#local-model'),'Local model first');check(!$('#distro'),'No Ubuntu prerequisite gate');
   $('#local-model').value='llama3.2:3b';$('#local-model').dispatchEvent(new Event('change',{bubbles:true}));
   $('[data-action=prepare-local]').click();await wait(100);check($('progress').value===50,'Real download progress');check($('[data-action=prepare-local]').disabled,'Duplicate setup blocked');await wait(250);
   check($('#content').textContent.includes('Test download interrupted'),'Failure stays visible');
   $('[data-page=devices]').click();check($('#content').textContent.includes('Test download interrupted'),'This PC retains failure');
   $('#content [data-page=setup]').click();check($('#local-model').value==='llama3.2:3b','Model survives navigation');
   $('[data-action=prepare-local]').click();await wait(400);check($('#content').textContent.includes('Your local model is ready'),'Reply verified');check($('#content').textContent.includes('hello from llama3.2:3b'),'Exact model reply shown');
   const cfg=await desktop.invoke('providers-get');check(cfg.active==='local'&&cfg.model==='llama3.2:3b','Chat uses verified model');
   check((await desktop.invoke('gateway')).ok,'Readiness matches verified model');
   return {localFirst:true,realProgress:true,preservedError:true,resumeNavigation:true,modelSelection:true,verifiedReply:true};
  })()`);
  const saved=JSON.parse(fs.readFileSync(path.join(profile,'local-setup.json'),'utf8'));if(saved.phase!=='ready'||saved.model!=='llama3.2:3b')throw Error('Setup not persisted');
  if(installs!==1||attempts!==2||verified!==1)throw Error('Unexpected install/download/verification counts');
  for(const size of [[1440,920],[760,600]]){win.setContentSize(...size);await new Promise(r=>setTimeout(r,100));if(await win.webContents.executeJavaScript('document.documentElement.scrollWidth>innerWidth'))throw Error('Horizontal overflow');fs.writeFileSync(path.join(__dirname,'.qa','local-'+size[0]+'.png'),(await win.webContents.capturePage()).toPNG());}
  fs.writeFileSync(path.join(__dirname,'.qa','local-results.json'),JSON.stringify({...result,persistence:true,viewports:true}));app.exit(0);
 }catch(error){fs.writeFileSync(path.join(__dirname,'.qa','local-results.json'),JSON.stringify({error:error.stack}));app.exit(1);}
});
