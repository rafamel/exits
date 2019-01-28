const path = require('path');
const dir = (file) => path.join(CONFIG_DIR, file);
const series = (...x) => `(${x.map((x) => x || 'shx echo').join(') && (')})`;
// prettier-ignore
const scripts = (x) => Object.entries(x)
  .reduce((m, [k, v]) => (m.scripts[k] = v || 'shx echo') && m, { scripts: {} });
const {
  OUT_DIR,
  DOCS_DIR,
  CONFIG_DIR,
  EXT_JS,
  EXT_TS,
  TYPESCRIPT,
  RELEASE_BUILD,
  RELEASE_DOCS,
  BIN_ENTRY,
  BIN_OUT_DIR
} = require('./project.config');
const EXT = EXT_JS + ',' + EXT_TS;
const DOT_EXT = '.' + EXT.replace(/,/g, ',.');
const { COMMIT, CZ } = process.env;
process.argv.join(',');

process.env.LOG_LEVEL = 'disable';
module.exports = scripts({
  build: series(
    'nps validate',
    `jake run:zero["shx rm -r ${OUT_DIR} ${BIN_OUT_DIR}"]`,
    `shx mkdir ${OUT_DIR} ${BIN_OUT_DIR}`,
    `jake fixpackage["${__dirname}","${OUT_DIR}"]`,
    'nps private.build',
    `pkg --out-path ${BIN_OUT_DIR} --targets node8-linux-x86,node8-macos-x86,node8-win-x86,node8-linux-x64,node8-macos-x64,node8-win-x64 ${BIN_ENTRY}`
  ),
  publish: `cd ${OUT_DIR} && npm publish`,
  watch: series(
    `jake run:zero["shx rm -r ${OUT_DIR}"]`,
    `shx mkdir ${OUT_DIR}`,
    `onchange "./src/**/*.{${EXT}}" --initial --kill -- ` +
      `jake clear run:exec["shx echo ⚡"] run:zero["nps private.watch"]`
  ),
  fix: [
    'prettier',
    `--write "./**/*.{${EXT},.json,.scss}"`,
    `--config "${dir('.prettierrc.js')}"`,
    `--ignore-path "${dir('.prettierignore')}"`
  ].join(' '),
  types: TYPESCRIPT && 'tsc --noEmit',
  lint: {
    default: `eslint ./src ./test --ext ${DOT_EXT} -c ${dir('.eslintrc.js')}`,
    md: `markdownlint README.md --config ${dir('markdown.json')}`,
    scripts: 'jake lintscripts["' + __dirname + '"]'
  },
  test: {
    default: series('nps lint types', 'cross-env NODE_ENV=test jest'),
    watch:
      `onchange "./{src,test}/**/*.{${EXT}}" --initial --kill -- ` +
      'jake clear run:exec["shx echo ⚡"] run:zero["nps test"]'
  },
  validate: series(
    COMMIT &&
      !CZ &&
      'jake run:conditional[' +
        `"\nCommits should be done via 'npm run commit'. Continue?",` +
        '"","exit 1",Yes,5]',
    'nps test lint.md lint.scripts',
    'jake run:zero["npm outdated"]',
    COMMIT && `jake run:conditional["\nCommit?","","exit 1",Yes,5]`
  ),
  docs:
    TYPESCRIPT &&
    series(
      `jake run:zero["shx rm -r ${DOCS_DIR}"]`,
      `typedoc --out ${DOCS_DIR} ./src`
    ),
  changelog: 'conventional-changelog -p angular -i CHANGELOG.md -s',
  update: series('npm update --save/save-dev', 'npm outdated'),
  clean: series(
    `jake run:zero["shx rm -r ${OUT_DIR} ${DOCS_DIR} ${BIN_OUT_DIR} coverage CHANGELOG.md"]`,
    'shx rm -rf node_modules'
  ),
  // Private
  private: {
    preversion: series(
      'shx echo "Recommended version bump is:"',
      'conventional-recommended-bump --preset angular --verbose',
      `jake run:conditional["\nContinue?","","exit 1",Yes]`
    ),
    version: series(
      RELEASE_BUILD && 'nps build',
      RELEASE_DOCS && 'nps docs',
      'nps changelog',
      'git add .'
    ),
    build: [
      'concurrently',
      `"babel src --out-dir ${OUT_DIR} --extensions ${DOT_EXT} --source-maps inline"`,
      TYPESCRIPT ? `"tsc --emitDeclarationOnly --outDir ${OUT_DIR}"` : '',
      '-n babel,tsc',
      '-c green,magenta'
    ].join(' '),
    watch:
      'concurrently "nps lint" "nps private.build" -n eslint,- -c yellow,gray'
  }
});
