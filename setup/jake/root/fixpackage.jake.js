const fs = require('fs');
const path = require('path');
const hjson = require('hjson');

desc('Modifies package.json in output directory');
task('fixpackage', (ROOT_DIR, OUT_DIR, mode = 'package') => {
  if (!ROOT_DIR || !OUT_DIR) {
    throw Error('No root or output paths were passed');
  }

  // Modify package.json
  const plain = fs.readFileSync(path.join(ROOT_DIR, 'package.json'));
  const pkg = JSON.parse(plain);

  pkg.main = pkg.main ? pkg.main.replace(/^(\.\/)?src\//, './') : './index.js';

  if (pkg.bin) {
    pkg.bin = Object.keys(pkg.bin).reduce((acc, key) => {
      acc[key] = pkg.bin[key].replace(/^(\.\/)?src\//, './');
      return acc;
    }, {});
  }

  delete pkg.scripts.prepublishOnly;
  delete pkg.scripts.publish;

  fs.writeFileSync(
    path.join(ROOT_DIR, OUT_DIR, 'package.json'),
    JSON.stringify(pkg, null, 2)
  );

  // Modify tsconfig
  if (fs.existsSync(path.join(ROOT_DIR, 'tsconfig.json'))) {
    const tsconfig = hjson.parse(
      String(fs.readFileSync(path.join(ROOT_DIR, 'tsconfig.json')))
    );
    delete tsconfig.include;
    delete tsconfig.exclude;
    const cpo = tsconfig.compilerOptions;
    cpo.paths = Object.keys(cpo.paths || {}).reduce((acc, key) => {
      acc[key] = cpo.paths[key].map((x) => x.replace(/^(\.\/)?src\//, './'));
      return acc;
    }, {});
    fs.writeFileSync(
      path.join(ROOT_DIR, OUT_DIR, 'tsconfig.json'),
      JSON.stringify(tsconfig, null, 2)
    );
  }
});
