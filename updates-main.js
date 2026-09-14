const {app,ipcMain,shell,net}=require('electron');
const {createChecker,releasesUrl}=require('./updates');
module.exports=function register(getWindow){
  const checker=createChecker({current:app.getVersion(),fetchImpl:(...args)=>net.fetch(...args),onChange:value=>{
    const win=getWindow();if(win&&!win.isDestroyed())win.webContents.send('updates',value);
  }});
  ipcMain.handle('updates-state',()=>({...checker.get(),hasAccess:false}));
  ipcMain.handle('updates-check',()=>checker.check());
  ipcMain.handle('updates-open',()=>shell.openExternal(checker.get().releaseUrl||releasesUrl));
  app.whenReady().then(()=>checker.check());
  app.on('second-instance',()=>checker.check());
  return checker;
};
