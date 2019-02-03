const fs = require('fs');
const path = require('path');

desc('Modifies package.json in output directory to match build structure');
task('fixpackage', (ROOT_DIR, OUT_DIR) => {
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
});
