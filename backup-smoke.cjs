const {app,BrowserWindow,ipcMain,dialog,net}=require('electron'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const profile=path.join(__dirname,'.qa','backup-'+Date.now());fs.mkdirSync(profile,{recursive:true});app.setPath('userData',profile);net.fetch=async()=>{throw Error('Offline fixture');};
const handlers=new Map(),originalHandle=ipcMain.handle.bind(ipcMain);ipcMain.handle=(name,fn)=>{handlers.set(name,fn);return originalHandle(name,fn);};
require('./host-manager').createManager=()=>({get:()=>({busy:false}),check:async()=>({busy:false}),prepare:async()=>({busy:false})});
let chosen=path.join(profile,'portable.json'),response=1;
dialog.showSaveDialog=async()=>({canceled:false,filePath:chosen});dialog.showOpenDialog=async()=>({canceled:false,filePaths:[chosen]});dialog.showMessageBox=async()=>({response});
require('./main');
app.whenReady().then(async()=>{
 try {
  const win=BrowserWindow.getAllWindows()[0];if(win.webContents.isLoading())await new Promise(r=>win.webContents.once('did-finish-load',r));
  const invoke=(name,arg)=>handlers.get(name)({},arg);
  await invoke('save',{notes:'Original notes',tasks:[{id:'t',text:'Original task',done:false}]});const original=await invoke('state');
  await invoke('export');const portable=JSON.parse(fs.readFileSync(chosen,'utf8'));assert.equal(portable.content.notes,'Original notes');assert.equal(portable.session,undefined);assert.equal(portable.setup,undefined);
  portable.content.notes='Restored notes';fs.writeFileSync(chosen,JSON.stringify(portable));response=0;assert.equal(await invoke('import'),null);assert.equal((await invoke('state')).notes,'Original notes');
  response=1;await invoke('import');let current=await invoke('state');assert.equal(current.notes,'Restored notes');assert.deepEqual(current.setup,original.setup);assert.notEqual(current.session,original.session);
  const backups=fs.readdirSync(path.join(profile,'backups'));assert.equal(backups.length,1);assert.equal(JSON.parse(fs.readFileSync(path.join(profile,'backups',backups[0]),'utf8')).notes,'Original notes');
  const persisted=fs.readFileSync(path.join(profile,'state.json'),'utf8');fs.writeFileSync(chosen,'{bad');await assert.rejects(()=>invoke('import'));assert.equal(fs.readFileSync(path.join(profile,'state.json'),'utf8'),persisted);
  console.log('Backup IPC: export, cancellation, restore, recovery copy and invalid-input preservation passed.');app.exit(0);
 }catch(error){console.error(error);app.exit(1);}
});
