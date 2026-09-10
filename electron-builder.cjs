const brand=require('./branding');
// These presentation values may change. appId and package name remain stable.
module.exports={...require('./package.json').build,productName:brand.productName};
