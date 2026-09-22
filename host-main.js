const {app,ipcMain}=require('electron');
const {execFile}=require('node:child_process');
const fs=require('node:fs'),path=require('node:path');
const setup=require('./setup'),{createManager,taskName}=require('./host-manager');
// `code` is the child process's own numeric exit status (e.g. curl's documented
// codes: 6 DNS, 7 connect refused, 28 timeout, 35/60 TLS). It is safe metadata —
// unlike stderr, it never carries paths, credentials, or CLI diagnostics — so it
// can be classified into a specific user-facing reason without leaking detail.
function execute(exe,args,{timeout=20000}={}){return new Promise(resolve=>execFile(exe,args,{windowsHide:true,timeout,maxBuffer:1024*1024},(error,output)=>resolve({ok:!error,output:error?'':String(output),code:error?.code})));}
module.exports=function register(getWindow,isBusy){
 let finishThenQuit=false;
 const script=()=>{const out=path.join(app.getPath('userData'),'host-startup.ps1');fs.writeFileSync(out,fs.readFileSync(path.join(__dirname,'build','host-startup.ps1')));return out;};
 const bootArgs=(distro,inspect)=>['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',script(),'-Distro',distro,'-TaskName',taskName(distro),...(inspect?['-Inspect']:[])];
 const manager=createManager({inventory:()=>setup.inspect(),execute,
  readBoot:async distro=>{const r=await execute('powershell.exe',bootArgs(distro,true));return r.ok&&r.output.includes('registered');},
  installBoot:async distro=>{const r=await execute('powershell.exe',bootArgs(distro,false),{timeout:45000});if(!r.ok)throw Error('startup');},
  onChange:state=>{const win=getWindow();if(win&&!win.isDestroyed())win.webContents.send('host-progress',state);if(finishThenQuit&&!state.busy)app.quit();}
 });
 app.on('browser-window-created',(_,window)=>{finishThenQuit=false;window.on('show',()=>finishThenQuit=false);});
 app.on('before-quit',event=>{if(manager.get().busy&&manager.get().operation==='prepare'){event.preventDefault();finishThenQuit=true;const win=getWindow();if(win&&!win.isDestroyed())win.hide();}});
 ipcMain.handle('host-status',()=>manager.get());
 ipcMain.handle('host-check',(_,distro)=>{manager.check(distro);return manager.get();});
 ipcMain.handle('host-prepare',(_,distro)=>{if(isBusy())throw Error('Wait until your agent finishes replying before preparing its Host.');manager.prepare(distro);return manager.get();});
 ipcMain.handle('host-repair',(_,distro)=>{if(isBusy())throw Error('Wait until your agent finishes replying before repairing its Host.');manager.repair(distro);return manager.get();});
 return manager;
};
