// Compatibility profiles describe tested controller behavior. Do not remove a profile without a hardware regression test.
const profiles=Object.freeze({'B650 UD AX-Y1':Object.freeze({mode:'Direct'})});
const colorMode=d=>d.modes.find(m=>m.name===(profiles[d.name]?.mode||'Static'));
const color=c=>c&&['red','green','blue'].every(k=>Number.isInteger(c[k])&&c[k]>=0&&c[k]<=255);
function restoredMode(device,snapshot) {
 if(!snapshot||typeof snapshot!=='object'||!snapshot.mode||!Number.isInteger(snapshot.mode.id))throw Error('Invalid lighting snapshot.');
 const mode=device.modes.find(m=>m.id===snapshot.mode.id&&m.name===snapshot.mode.name);
 if(!mode||!Array.isArray(snapshot.colors)||snapshot.colors.length!==device.colors.length||!snapshot.colors.every(color))throw Error('Lighting snapshot does not match this controller.');
 const saved=snapshot.mode;
 if(!Array.isArray(saved.colors)||!saved.colors.every(color)||saved.colors.length!==mode.colors.length)throw Error('Invalid saved mode colors.');
 const result={...mode,colors:saved.colors.map(c=>({red:c.red,green:c.green,blue:c.blue}))};
 for(const [key,min,max] of [['speed','speedMin','speedMax'],['brightness','brightnessMin','brightnessMax']]) {
  if(saved[key]===undefined)continue;
  if(!Number.isInteger(saved[key])||!Number.isInteger(mode[min])||!Number.isInteger(mode[max])||saved[key]<mode[min]||saved[key]>mode[max])throw Error('Saved lighting parameters are no longer supported.');
  result[key]=saved[key];
 }
 // Direction/colorMode are protocol enums. Accept only unchanged values; do not replay arbitrary payload fields.
 for(const key of ['direction','colorMode'])if(saved[key]!==undefined&&saved[key]!==mode[key])throw Error('Saved lighting mode needs manual selection.');
 return result;
}
module.exports={colorMode,restoredMode};
