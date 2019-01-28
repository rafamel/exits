const fs = require('fs');
const path = require('path');

desc('Modifies package.json in output directory');
task('fixpackage', (ROOT_DIR, OUT_DIR) => {
  if (!ROOT_DIR || !OUT_DIR) {
    throw Error('No root or output paths were passed');
  }
  // Copy all files
  fs.readdirSync(ROOT_DIR)
    .filter((x) => !fs.lstatSync(path.join(ROOT_DIR, x)).isDirectory())
    .forEach((x) => {
      if (x === 'package.json') return;
      fs.createReadStream(path.join(ROOT_DIR, x)).pipe(
        fs.createWriteStream(path.join(ROOT_DIR, OUT_DIR, x))
      );
    });

  // Modify package.json
  const plain = fs.readFileSync(path.join(ROOT_DIR, 'package.json'));
  const packagejson = JSON.parse(plain);

  packagejson.main = './index.js';
  delete packagejson.scripts.prepublishOnly;
  delete packagejson.scripts.publish;

  fs.writeFileSync(
    path.join(ROOT_DIR, OUT_DIR, 'package.json'),
    JSON.stringify(packagejson, null, 2)
  );
});
