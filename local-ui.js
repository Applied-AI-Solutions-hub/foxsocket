(() => {
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const bytes=n=>n>=1024**3?(n/1024**3).toFixed(2)+' GB':(n/1024**2).toFixed(1)+' MB';
 window.localSetupView=({local,choice,models,metrics})=>{
  const total=local.total, completed=local.completed||0;
  const pct=total?Math.min(100,Math.floor(100*completed/total)):null;
  const busy=!!local.busy,ready=local.verified===true&&local.phase==='ready'&&local.model===choice;
  const stages=[['downloading-runtime','Ollama installation'],['downloading-model','Model download'],['verifying','Basic answer checks']];
  const known=models.some(m=>m.id===choice);
  return `<div class="page-intro"><h1>${ready?'Your local model is ready':'Run Sparky on this PC'}</h1><p>Choose a model. Foxsocket installs Ollama, downloads the model, and checks basic arithmetic and instruction following through the chat prompt. No API key is required.</p></div>
   <section class="panel"><h2>1. Choose your local model</h2><p>Ollama needs at least 4 GB of disk space, plus the model download.${metrics?.memoryTotal?' This PC has '+Math.round(metrics.memoryTotal/1024**3)+' GB of RAM.':''} Smaller models are a useful first test; speed and quality depend on this PC.</p>
   <label class="field">Model<select id="local-model" ${busy?'disabled':''}>${models.map(m=>`<option value="${esc(m.id)}" ${m.id===choice?'selected':''}>${esc(m.label)} — ${esc(m.download)}</option>`).join('')}${!known?`<option selected value="${esc(choice)}">${esc(choice)} (custom)</option>`:''}</select></label><p>${esc(models.find(m=>m.id===choice)?.memory||'Quality depends on the selected model.')}</p>
   <details><summary>Use another on-device Ollama model</summary><label class="field">Model name<input id="local-custom-model" value="${esc(choice)}" maxlength="200" ${busy?'disabled':''}></label><p>Use a model supported by your installed Ollama version. Large models may exceed available memory.</p></details>
   <p>Models: <a href="#" data-local-license="true">Llama 3.2 license and model information</a>. Downloads require internet; on-device replies do not.</p>
   <button class="primary" data-action="prepare-local" ${busy?'disabled':''}>${busy?'Setting up…':ready?'Verify another reply':local.phase==='idle'?'Set up local model':'Resume / verify local model'}</button></section>
   <section class="panel" aria-live="polite"><p>Ollama may open its own welcome window after installation. No sign-in or setup there is needed for Foxsocket; return here to follow progress.</p><h2>2. Setup progress</h2><ol>${stages.map(([,label])=>`<li>${label}</li>`).join('')}</ol><strong>${esc(local.message||'Ready to start.')}</strong>
   ${busy?`<div class="local-progress"><progress aria-label="Current download or setup activity" ${pct===null?'':`max="100" value="${pct}"`}></progress><p>${pct===null?'Working — waiting for the current step to finish.':`${bytes(completed)} / ${bytes(total)} · ${pct}% of the current download layer`}</p></div>`:''}
   ${local.error?`<div class="notice" role="alert">${esc(local.error)}</div>`:''}
   ${local.reply?`<p>Basic check replies: <q>${esc(local.reply)}</q></p>`:''}
   <p>${busy?'Keep Foxsocket open during setup. If you exit or restart, return here to resume.':'Your selected model and last setup result are saved on this PC. These checks do not guarantee every answer is correct.'}</p>
   ${ready?'<button class="primary" data-page="chat">Start a conversation</button>':''}</section>
   <section class="panel"><h2>Other setup options</h2><p>Hosted provider settings are available in Models. Ubuntu and OpenClaw are optional integrations, with separate requirements.</p><div class="actions"><button data-page="settings">Hosted provider settings</button><button data-action="legacy-host">Ubuntu / OpenClaw setup</button></div></section>`;
 };
})();
