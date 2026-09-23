const {app,ipcMain,dialog}=require('electron');
const fs=require('node:fs'),path=require('node:path');
const {createLocalApi,createLocalSetup,MODELS}=require('./local-model.cjs');
const {createWindowsRuntime}=require('./local-runtime.cjs');
module.exports=function register(getWindow,onSelected) {
  let manager;
  const get=()=>{
    if(manager)return manager;
    const file=path.join(app.getPath('userData'),'local-setup.json');
    const api=createLocalApi();
    manager=createLocalSetup({api,platform:createWindowsRuntime({directory:path.join(app.getPath('userData'),'installers'),api}),
      read:()=>{try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch(error){if(error.code==='ENOENT')return null;throw Error('Saved local setup could not be read. It has not been overwritten.');}},
      write:value=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file+'.tmp',JSON.stringify(value,null,2));fs.renameSync(file+'.tmp',file);},
      onChange:value=>{const window=getWindow();if(window&&!window.isDestroyed())window.webContents.send('local-progress',value);}
    });return manager;
  };
  ipcMain.handle('local-status',()=>({...get().get(),models:MODELS}));
  ipcMain.handle('local-prepare',(_,model)=>{const current=get();if(current.get().busy)return current.get();const promise=current.prepare(model);onSelected(model);promise.catch(()=>{});return {...current.get(),busy:true};});
  // Persisted stages survive normal quit/reboot. A download can be retried using
  // Ollama's layer cache; never silently keep the UI closed during a long job.
  const confirmExit=event=>{if(manager?.get().busy){event.preventDefault();const options={type:'question',buttons:['Keep setting up','Exit and resume later'],defaultId:0,cancelId:0,message:'Local setup is still running.',detail:'You can resume setup after reopening Foxsocket. Downloaded model layers can be reused.'};const window=getWindow();const choice=window&&!window.isDestroyed()?dialog.showMessageBoxSync(window,options):dialog.showMessageBoxSync(options);if(choice===1)app.exit(0);else if(window&&!window.isDestroyed()){window.show();window.focus();}}};
  app.on('browser-window-created',(_,window)=>window.on('close',confirmExit));
  app.on('before-quit',confirmExit);
  return {get,status:model=>get().status(model),verify:model=>get().verify(model),invalidate:()=>get().invalidate()};
};
