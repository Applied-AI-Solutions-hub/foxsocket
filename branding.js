// Presentation branding. Keep identity/storage IDs independent of this file.
((root)=>{
 const brand=Object.freeze({
  productName:'Foxsocket',
  hostName:'Foxsocket Host',
  clientName:'Foxsocket Client',
  maker:'Applied AI Solutions',
  tagline:'Your agent. Your devices. Connected.',
  namingStatus:'Foxsocket — by Applied AI Solutions',
  shortlist:Object.freeze(['Foxsocket']),
 });
 if(typeof module!=='undefined'&&module.exports)module.exports=brand;
 else root.productBrand=brand;
})(typeof window!=='undefined'?window:globalThis);
