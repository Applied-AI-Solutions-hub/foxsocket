const {app,BrowserWindow,ipcMain}=require('electron');
const fs=require('fs'),path=require('path');
const profile=path.join(__dirname,'.qa','model-'+Date.now());fs.mkdirSync(profile,{recursive:true});app.setPath('userData',profile);
require('./main');
const gaming={cpu:12,cpuName:'Test CPU',memory:20e9,memoryTotal:64*1024**3,gpu:{name:'NVIDIA GeForce RTX 4090',size:24576},disk:{free:500*1024**3},checked:Date.now()};
for(const a of ['gateway','metrics','setup-check'])ipcMain.removeHandler(a);
ipcMain.handle('gateway',()=>({ok:false}));
ipcMain.handle('metrics',()=>gaming);
ipcMain.handle('setup-check',()=>({wsl:{distributions:[]},tailscale:{status:'not-installed'}}));
app.whenReady().then(async()=>{
 const win=BrowserWindow.getAllWindows()[0];if(win.webContents.isLoading())await new Promise(r=>win.webContents.once('did-finish-load',r));
 try{
  win.setContentSize(1440,1000);
  await new Promise(r=>setTimeout(r,1200));
  const result=await win.webContents.executeJavaScript(`(async()=>{
   const $=s=>document.querySelector(s),wait=ms=>new Promise(r=>setTimeout(r,ms)),check=(v,m)=>{if(!v)throw Error(m)};
   $('nav [data-page=devices]').click();await wait(300);
   const link=$('#content [data-page=model]');check(link,'Devices links to the Connect your model screen');link.click();await wait(300);
   check(document.body.dataset.page==='model','Model page opens');
   const text=()=>$('#content').textContent;
   check(text().includes('Connect your model'),'Model screen heading present');
   check(text().includes('never stores your provider keys'),'Security promise is shown up front');
   $('[data-choose-exec=cloud]').click();await wait(250);
   check($('.provider-grid'),'Provider choices appear for the cloud path');
   $('[data-provider=openai]').click();await wait(250);
   const st=await desktop.invoke('state');
   check(st.setup.execution==='cloud','Execution choice persisted');
   check(st.setup.provider==='openai','Provider choice persisted');
   check($('[data-action=connect-openclaw]'),'Continue-in-OpenClaw handoff is offered');
   check(!$('#content input[type=password]')&&!/api key|paste your key/i.test(text()),'No in-app credential entry');
   return {opened:true,securityShown:true,cloudChosen:true,providerPersisted:true,handoff:true};
  })()`);
  fs.writeFileSync(path.join(__dirname,'.qa','model-results.json'),JSON.stringify(result,null,2));
  fs.writeFileSync(path.join(__dirname,'.qa','model.png'),(await win.webContents.capturePage()).toPNG());
  app.exit(0);
 }catch(e){fs.writeFileSync(path.join(__dirname,'.qa','model-results.json'),JSON.stringify({error:e.stack,content:await win.webContents.executeJavaScript("document.querySelector('#content')?.innerHTML.slice(0,1200)")}));app.exit(1);}
});
