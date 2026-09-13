const {app,BrowserWindow}=require('electron');
const fs=require('fs'),path=require('path');
const profile=path.join(__dirname,'.qa','diagnostics-'+Date.now());fs.mkdirSync(profile,{recursive:true});app.setPath('userData',profile);
// No stubs: this exercises the REAL self-test handler end to end. On this
// non-Windows CI box it must honestly report 'unsupported' and stay redacted.
require('./main');
app.whenReady().then(async()=>{
 const win=BrowserWindow.getAllWindows()[0];if(win.webContents.isLoading())await new Promise(r=>win.webContents.once('did-finish-load',r));
 try{
  win.setContentSize(1440,960);
  await new Promise(r=>setTimeout(r,800));
  const result=await win.webContents.executeJavaScript(`(async()=>{
   const $=s=>document.querySelector(s),wait=ms=>new Promise(r=>setTimeout(r,ms)),check=(v,m)=>{if(!v)throw Error(m)};
   const report=await desktop.invoke('self-test');
   check(report&&Array.isArray(report.checks)&&report.checks.length,'report has checks');
   check(report.overall==='unsupported','non-Windows honestly reports unsupported, got '+report.overall);
   check(/no credentials/i.test(report.privacy),'privacy statement present');
   const blob=JSON.stringify(report);
   check(!/[A-Za-z]:\\\\Users/.test(blob),'no windows user paths leak');
   check(!/\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b/.test(blob),'no raw IPv4 leaks');
   $('nav [data-page=settings]').click();await wait(200);
   $('[data-action=self-test]').click();await wait(400);
   const panel=[...document.querySelectorAll('#content .panel')].find(p=>p.querySelector('h2')?.textContent==='Readiness diagnostics');
   check(panel,'diagnostics panel present');
   check(panel.querySelector('.diag-checks'),'checks rendered in UI');
   check(panel.textContent.includes('no credentials'),'privacy note shown in UI');
   check(panel.querySelector('[data-action=copy-report]'),'copy-report available after run');
   return {overall:report.overall,checkCount:report.checks.length,ui:true};
  })()`);
  fs.writeFileSync(path.join(__dirname,'.qa','diagnostics-results.json'),JSON.stringify(result,null,2));
  fs.writeFileSync(path.join(__dirname,'.qa','diagnostics.png'),(await win.webContents.capturePage()).toPNG());
  app.exit(0);
 }catch(e){fs.writeFileSync(path.join(__dirname,'.qa','diagnostics-results.json'),JSON.stringify({error:e.stack}));app.exit(1);}
});
