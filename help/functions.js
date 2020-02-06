const xm = require('../xmtoolbox');

const getFunctions = obj => Object.getOwnPropertyNames(obj).filter(item => true);

const modules = {};

getFunctions(xm).forEach(module => {
  modules[module] = getFunctions(xm[module]);
});

for (const key in modules) {
  console.log(`- ${key}`);
  for (let i = 0; i < modules[key].length; i++) {
    console.log(`  - ${modules[key][i]}()`);
  }
}
