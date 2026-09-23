const brand=require('./branding');
// These presentation values may change. appId and package name remain stable.
const build=require('./package.json').build;
module.exports={...build,productName:brand.productName,
 extraResources:[{from:'build/host-setup.ps1',to:'host-setup.ps1'},{from:'build/host-prerequisites.ps1',to:'host-prerequisites.ps1'}],
 nsis:{...build.nsis,include:'build/installer.nsh'}
};
