const {app,BrowserWindow,ipcMain}=require('electron');
const fs=require('fs'),path=require('path');
const profile=path.join(__dirname,'.qa','capability-'+Date.now());fs.mkdirSync(profile,{recursive:true});app.setPath('userData',profile);
require('./main');
// Stub the local hardware snapshot to a high-end gaming PC. Discovery stays read-only.
const gaming={cpu:14,cpuName:'Test CPU',memory:20e9,memoryTotal:64*1024**3,uptime:1,gpu:{name:'NVIDIA GeForce RTX 4090',usage:12,temp:45,used:2000,size:24576},disk:{free:500*1024**3,total:1000*1024**3},checked:Date.now()};
for(const action of ['gateway','metrics','setup-check'])ipcMain.removeHandler(action);
ipcMain.handle('gateway',()=>({ok:false}));
ipcMain.handle('metrics',()=>gaming);
ipcMain.handle('setup-check',()=>({wsl:{distributions:[]},tailscale:{status:'not-installed'}}));
app.whenReady().then(async()=>{
 const win=BrowserWindow.getAllWindows()[0];if(win.webContents.isLoading())await new Promise(r=>win.webContents.once('did-finish-load',r));
 try{
  win.setContentSize(1440,960);
  await new Promise(r=>setTimeout(r,1500)); // let the boot-time metrics fetch resolve
  const result=await win.webContents.executeJavaScript(`(async()=>{
   const $=s=>document.querySelector(s),wait=ms=>new Promise(r=>setTimeout(r,ms)),check=(v,m)=>{if(!v)throw Error(m)};
   check(!!window.capability,'capability module is loaded in the renderer');
   $('nav [data-page=devices]').click();await wait(300);
   const panel=[...document.querySelectorAll('#content .panel')].find(p=>p.querySelector('h2')?.textContent==='Run a model on this PC');
   check(panel,'Local model panel is present on the Devices page');
   const text=panel.textContent;
   check(text.includes('read-only'),'Panel explains the check is read-only (education/privacy)');
   check(text.includes('no data is uploaded'),'Panel states no data is uploaded');
   check(panel.querySelector('.chip.good')&&panel.querySelector('.chip.good').textContent.includes('Local model ready'),'Gaming GPU shows Local model ready');
   check(text.includes('NVIDIA GeForce RTX 4090')&&text.includes('24 GB'),'Detected GPU and VRAM are shown');
   check(text.includes('Large model'),'Recommends the largest fitting tier');
   check(panel.querySelector('[data-page=model]'),'Panel routes to the guided Connect-your-model screen (no download/start happens here)');
   return {loaded:true,localReady:true,educates:true,recommendsLarge:true,routesToSetup:true};
  })()`);
  fs.writeFileSync(path.join(__dirname,'.qa','capability-results.json'),JSON.stringify(result,null,2));
  fs.writeFileSync(path.join(__dirname,'.qa','capability-local.png'),(await win.webContents.capturePage()).toPNG());
  app.exit(0);
 }catch(error){fs.writeFileSync(path.join(__dirname,'.qa','capability-results.json'),JSON.stringify({error:error.stack,content:await win.webContents.executeJavaScript("document.querySelector('#content')?.innerHTML.slice(0,1200)")}));app.exit(1);}
});
