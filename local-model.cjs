'use strict';
const BASE = 'http://127.0.0.1:11434';
const MODELS = Object.freeze([
  {id:'llama3.2:3b',label:'Recommended · Llama 3.2 3B',download:'About 2 GB',memory:'Passed basic chat checks in our test. More memory than 1B; performance still depends on this PC.'},
  {id:'llama3.2:1b',label:'Small · Llama 3.2 1B (limited quality)',download:'About 1.3 GB',memory:'Lower memory use, but failed basic instruction checks in our test. Not recommended for everyday chat.'},
]);
const DEFAULT_MODEL = MODELS[0].id;
const normalized = value => value.includes(':') ? value : value + ':latest';
function validateModel(model) {
  if(typeof model!=='string'||model.length>200||!/^[a-zA-Z0-9][a-zA-Z0-9._:/-]*$/.test(model)||model.includes('..'))throw Error('Choose a valid local model name.');
  if(/(?:^|[:/-])cloud(?:$|[:/-])/i.test(model))throw Error('Choose an on-device model for local setup.');
  return model;
}
function createLocalApi({fetchImpl=fetch}={}) {
  async function request(endpoint, body, timeout=10000) {
    const response=await fetchImpl(BASE+endpoint,{method:body?'POST':'GET',headers:body?{'content-type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(timeout),cache:'no-store'});
    if(!response.ok){const error=await response.json().catch(()=>({}));throw Error(error.error||'Ollama returned HTTP '+response.status);}
    return response;
  }
  async function installed(model) {
    validateModel(model);
    const data=await (await request('/api/tags')).json();
    if(!Array.isArray(data.models))throw Error('Ollama returned an invalid model list.');
    return data.models.some(item=>typeof item.name==='string'&&normalized(item.name)===normalized(model));
  }
  async function verify(model) {
    if(!await installed(model))throw Error('The selected model is not downloaded. Choose Set up local model.');
    const info=await (await request('/api/show',{model})).json();
    if(info.remote_host||info.remote_model)throw Error('This model uses a remote server. Choose an on-device model.');
    const checks=[];
    for(const check of require('./local-chat.cjs').CHECKS) {
      const data=await (await request('/api/chat',{model,messages:require('./local-chat.cjs').messages([{role:'user',content:check.prompt}]),stream:false,think:false,options:{num_predict:128,temperature:0.4}},180000)).json();
      const reply=String(data.message?.content||'').replace(/<think>[\s\S]*?<\/think>/gi,'').trim();
      if(data.done!==true||!reply)throw Error('The selected model did not finish a text reply. Retry or choose another model.');
      if(typeof data.model!=='string'||normalized(data.model)!==normalized(model))throw Error('Ollama replied using a different model. Select it explicitly and retry.');
      if(!check.accept(reply))throw Error('The model is connected but did not pass the '+check.id+' check. Retry or choose the balanced model. Reply: '+reply.slice(0,180));
      checks.push({id:check.id,reply:reply.slice(0,500)});
    }
    return {ok:true,providerId:'local',model,reply:checks.map(c=>c.id+': '+c.reply).join(' · '),checks};
  }
  async function pull(model,onProgress) {
    validateModel(model);
    const response=await request('/api/pull',{model,stream:true},3600000);
    if(!response.body)throw Error('Ollama did not return download progress.');
    const decoder=new TextDecoder();let pending='',success=false;
    const line=text=>{if(!text.trim())return;const item=JSON.parse(text);if(item.error)throw Error(item.error);if(item.status==='success')success=true;
      const total=Number(item.total),completed=Number(item.completed);
      onProgress({message:String(item.status||'Downloading model').slice(0,160),total:Number.isFinite(total)&&total>0?total:null,completed:Number.isFinite(completed)&&completed>=0?completed:0});};
    for await(const chunk of response.body){pending+=decoder.decode(chunk,{stream:true});if(pending.length>1048576)throw Error('Invalid download progress response.');let pos;while((pos=pending.indexOf('\n'))>=0){line(pending.slice(0,pos));pending=pending.slice(pos+1);}}
    pending+=decoder.decode();line(pending);
    if(!success)throw Error('The model download was interrupted. Resume setup to retry; Ollama can reuse downloaded layers.');
  }
  return {installed,verify,pull,reachable:async()=>{try{await (await request('/api/tags')).json();return true;}catch{return false;}}};
}
function createLocalSetup({read=()=>null,write=()=>{},api,platform,onChange=()=>{}}) {
  const saved=read();
  let state={phase:'idle',model:DEFAULT_MODEL,message:'Choose a model to run on this PC.',...saved,busy:false,verified:false};
  if(saved?.busy)state={...state,phase:'interrupted',message:'Setup was interrupted. Resume to continue.',error:saved.error||null};
  if(saved?.phase==='ready')state.message='Last setup succeeded. Checking a fresh reply after reopening.';
  let job=null,verifiedModel=null,rechecked=false;
  const set=patch=>{state={...state,...patch,updatedAt:Date.now()};write(state);onChange({...state});return {...state};};
  function prepare(model=state.model,{install=true}={}) {
    validateModel(model);
    if(job)return job;
    job=Promise.resolve().then(async()=>{
      verifiedModel=null;set({busy:true,phase:'checking',model,verified:false,error:null,reply:null,total:null,completed:0,message:'Checking the local model service.'});
      try {
        if(!await api.reachable()) {
          if(!await platform.find()){
            if(!install)throw Error('Ollama is not installed. Choose Set up local model.');
            await platform.install(update=>set({phase:update.phase||'downloading-runtime',...update}));
          }
          set({phase:'starting',total:null,completed:0,message:'Starting Ollama on this PC.'});await platform.start();
        }
        if(!await api.installed(model)){
          if(!install)throw Error('The selected model is not downloaded. Resume local setup to download it.');
          set({phase:'downloading-model',message:'Requesting the model download.',total:null,completed:0});
          await api.pull(model,update=>set({phase:'downloading-model',...update}));
        }
        set({phase:'verifying',message:'Asking the selected model for a real reply. The first load can take a few minutes.',total:null,completed:0});
        const result=await api.verify(model);verifiedModel=model;
        return set({phase:'ready',busy:false,verified:true,message:'Connected. Basic arithmetic and instruction checks passed; answer quality can still vary.',reply:result.reply,error:null});
      } catch(error){verifiedModel=null;return set({phase:'attention',busy:false,verified:false,error:error.message,message:'Setup needs attention. Retry to continue.'});}
    }).finally(()=>job=null);return job;
  }
  async function status(model) {
    validateModel(model);
    if(!rechecked&&saved?.phase==='ready'&&saved.model===model){rechecked=true;await prepare(model,{install:false});}
    if(state.busy)return {ok:false,providerId:'local',model,error:'Local setup is still running.'};
    try {
      if(!await api.reachable()){verifiedModel=null;return {ok:false,providerId:'local',model,error:'Ollama is not running. Resume local setup to start it.'};}
      if(!await api.installed(model)){verifiedModel=null;return {ok:false,providerId:'local',model,error:'The selected model is not downloaded.'};}
      return {ok:verifiedModel===model,providerId:'local',model,error:verifiedModel===model?null:'Verify a real reply to finish setup.'};
    }catch(error){verifiedModel=null;return {ok:false,providerId:'local',model,error:error.message};}
  }
  return {prepare,verify:model=>prepare(model,{install:false}),status,get:()=>({...state}),invalidate:()=>{verifiedModel=null;},models:MODELS};
}
module.exports={createLocalApi,createLocalSetup,MODELS,DEFAULT_MODEL,validateModel};
