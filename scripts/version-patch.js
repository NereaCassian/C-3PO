const pkg = require('../package.json');
const v = pkg.version.split('.');
v[2] = parseInt(v[2]) + 1;
const newVersion = 'v' + v.join('.');
console.log(`Generating changelog for version ${newVersion}`);
require('child_process').execSync(`npm run changelog:version ${newVersion}`, { stdio: 'inherit' }); 