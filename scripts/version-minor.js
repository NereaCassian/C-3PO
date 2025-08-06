const pkg = require('../package.json');
const v = pkg.version.split('.');
v[1] = parseInt(v[1]) + 1;
v[2] = 0;
const newVersion = 'v' + v.join('.');
console.log(`Generating changelog for version ${newVersion}`);
require('child_process').execSync(`npm run changelog:version ${newVersion}`, { stdio: 'inherit' }); 