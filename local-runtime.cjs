'use strict';
const fs=require('node:fs'),path=require('node:path');
const {spawn,execFile}=require('node:child_process');
const {promisify}=require('node:util');
const execute=promisify(execFile);
const INSTALLER='https://ollama.com/download/OllamaSetup.exe';
function createWindowsRuntime({directory,api,fetchImpl=fetch,env=process.env,executeImpl=execute,spawnImpl=spawn,platformName=process.platform}) {
  const find=async()=>{
    const candidates=[path.join(env.LOCALAPPDATA||'','Programs','Ollama','ollama.exe'),path.join(env.ProgramFiles||'','Ollama','ollama.exe')];
    try{const {stdout}=await executeImpl('where.exe',['ollama.exe'],{windowsHide:true,timeout:5000});candidates.push(...stdout.trim().split(/\r?\n/));}catch{}
    return candidates.find(file=>path.isAbsolute(file)&&fs.existsSync(file))||null;
  };
  async function install(progress) {
    if(platformName!=='win32')throw Error('Automatic Ollama installation is available on Windows.');
    fs.mkdirSync(directory,{recursive:true});
    const target=path.join(directory,'OllamaSetup.exe'),partial=target+'.part';
    progress({phase:'downloading-runtime',message:'Downloading Ollama from its official website.',total:null,completed:0});
    const response=await fetchImpl(INSTALLER,{signal:AbortSignal.timeout(1800000)});
    if(!response.ok||!response.body)throw Error('Ollama could not download. Check the connection and retry.');
    const total=Number(response.headers.get('content-length'))||null;
    const handle=await fs.promises.open(partial,'w');let completed=0,last=0;
    try{for await(const chunk of response.body){await handle.writeFile(chunk);completed+=chunk.length;if(completed>3*1024**3)throw Error('The Ollama installer exceeded the expected size.');if(Date.now()-last>200){progress({phase:'downloading-runtime',message:'Downloading Ollama.',total,completed});last=Date.now();}}}finally{await handle.close();}
    if(total&&completed!==total)throw Error('Ollama download was incomplete. Retry setup.');
    await fs.promises.rename(partial,target);
    progress({phase:'checking-installer',message:'Checking the Ollama installer signature.',total:null,completed:0});
    // Filename is passed through an environment value, never interpreted as code.
    const script="$s=Get-AuthenticodeSignature -LiteralPath $env:FOXSOCKET_INSTALLER; if($s.Status -ne 'Valid' -or $s.SignerCertificate.Subject -notmatch '(?i)Ollama'){exit 1}";
    try{await executeImpl(path.join(env.SystemRoot,'System32','WindowsPowerShell','v1.0','powershell.exe'),['-NoProfile','-NonInteractive','-Command',script],{windowsHide:true,timeout:60000,env:{...env,FOXSOCKET_INSTALLER:target}});}catch{throw Error('The Ollama installer signature could not be verified. Check Windows date and internet access, then retry.');}
    progress({phase:'installing-runtime',message:'Installing Ollama for your Windows account. This may take several minutes.',total:null,completed:0});
    try{await executeImpl(target,['/VERYSILENT','/SUPPRESSMSGBOXES','/NORESTART','/SP-'],{windowsHide:true,timeout:1800000});}catch{throw Error('Ollama installation did not finish. Check any Windows prompt, then retry.');}
    if(!await find())throw Error('Ollama was not found after installation. Retry setup.');
  }
  async function start() {
    if(await api.reachable())return;
    const exe=await find();if(!exe)throw Error('Ollama is not installed. Choose Set up local model.');
    const child=spawnImpl(exe,['serve'],{detached:true,windowsHide:true,stdio:'ignore',env:{...env,OLLAMA_HOST:'127.0.0.1:11434'}});
    let spawnError=null;child.on('error',error=>spawnError=error);child.unref();
    for(let attempt=0;attempt<60;attempt++){if(spawnError)throw Error('Ollama could not start. Retry local setup.');if(await api.reachable())return;await new Promise(resolve=>setTimeout(resolve,1000));}
    throw Error('Ollama did not become available. Retry setup or restart Windows.');
  }
  return {find,install,start};
}
module.exports={createWindowsRuntime,INSTALLER};
