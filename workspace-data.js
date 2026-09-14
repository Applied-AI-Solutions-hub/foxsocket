const crypto = require('node:crypto');
const MAX_BYTES = 16 * 1024 * 1024;
function object(value) { if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Invalid workspace backup.'); return value; }
function text(value, max) { if (typeof value !== 'string' || value.length > max) throw Error('Invalid or oversized backup text.'); return value; }
function list(value, max) { if (!Array.isArray(value) || value.length > max) throw Error('Invalid or oversized backup list.'); return value; }
function messages(value) { return list(value, 10000).map(m => { object(m); if (!['user','assistant','error'].includes(m.role)) throw Error('Invalid message role.'); return {role:m.role,text:text(m.text,1000000),...(Number.isFinite(m.time)?{time:m.time}:{})}; }); }
function content(value) {
 object(value);
 return {notes:text(value.notes ?? '',50000), tasks:list(value.tasks ?? [],500).map(t=>{object(t);if(typeof t.done!=='boolean')throw Error('Invalid task.');return {id:crypto.randomUUID(),text:text(t.text,500),done:t.done};}),chat:messages(value.chat ?? []),conversations:list(value.conversations ?? [],1000).map(c=>{object(c);return {title:text(c.title ?? 'Imported conversation',200),chat:messages(c.chat)};})};
}
function exportBackup(state) {
 // Allowlist content; never include connection/setup, session keys, folders or hardware snapshots.
 const result={format:'foxsocket-workspace',version:1,createdAt:new Date().toISOString(),content:content(state)};
 const encoded=JSON.stringify(result,null,2);
 if(Buffer.byteLength(encoded)>MAX_BYTES)throw Error('This workspace exceeds the 16 MB portable-backup limit. Your local data has not changed.');
 return encoded;
}
function parseBackup(raw) {
 if(Buffer.byteLength(raw)>MAX_BYTES)throw Error('Backup exceeds 16 MB.');
 let parsed;try{parsed=JSON.parse(raw);}catch{throw Error('This is not a valid JSON backup.');}
 object(parsed);
 if(parsed.format!=='foxsocket-workspace'||parsed.version!==1)throw Error('Use a Foxsocket portable workspace backup (version 1). Legacy full-state backups require manual recovery.');
 return content(parsed.content);
}
function restoreContent(state, incoming) {
 const clean=content(incoming);
 const session=()=>`agent:${state.connection?.agentId||'main'}:command-center-${crypto.randomUUID()}`;
 // Keep this PC's connection, identity and service settings. Imported history does not restore model-side memory.
 return {...state,...clean,session:session(),conversations:clean.conversations.map(c=>({...c,id:session(),connection:state.connection||null}))};
}
module.exports={MAX_BYTES,exportBackup,parseBackup,restoreContent};
