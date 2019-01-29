const pkg = require('./package.json');
const path = require('path');
const dir = (file) => path.join(CONFIG_DIR, file);
const series = (...x) => `(${x.map((x) => x || 'shx echo').join(') && (')})`;
// prettier-ignore
const scripts = (x) => Object.entries(x)
  .reduce((m, [k, v]) => (m.scripts[k] = v || 'shx echo') && m, { scripts: {} });
const {
  TYPESCRIPT: TS,
  OUT_DIR,
  DOCS_DIR,
  CONFIG_DIR,
  EXT_JS,
  EXT_TS,
  RELEASE_BUILD,
  RELEASE_DOCS
} = require('./project.config');
const EXT = EXT_JS + ',' + EXT_TS;
const DOT_EXT = '.' + EXT.replace(/,/g, ',.');
const { COMMIT, COMMITIZEN } = process.env;

process.env.LOG_LEVEL = 'disable';
module.exports = scripts({
  build: {
    default:
      'cross-env NODE_ENV=production' +
      ' nps validate build.prepare build.transpile build.declaration',
    prepare: series(
      `jake run:zero["shx rm -r ${OUT_DIR}"]`,
      `shx mkdir ${OUT_DIR}`,
      `jake run:zero["shx cp README* LICENSE* CHANGELOG* ${OUT_DIR}/"]`,
      `jake fixpackage["${__dirname}","${OUT_DIR}"]`
    ),
    transpile: `babel src --out-dir ${OUT_DIR} --extensions ${DOT_EXT} --source-maps inline`,
    declaration: TS
      ? `ttsc --project ttsconfig.json --outDir ${OUT_DIR}`
      : 'shx echo'
  },
  publish: `cd ${OUT_DIR} && npm publish`,
  watch: series(
    'nps build.prepare',
    `onchange "./src/**/*.{${EXT}}" --initial --kill -- ` +
      `jake clear run:exec["shx echo ⚡"] run:zero["nps private.watch"]`
  ),
  fix: [
    'prettier',
    `--write "./**/*.{${EXT},.json,.scss}"`,
    `--config "${dir('.prettierrc.js')}"`,
    `--ignore-path "${dir('.prettierignore')}"`
  ].join(' '),
  types: TS && 'tsc',
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
    // prettier-ignore
    COMMIT && !COMMITIZEN && 'jake run:conditional[' +
        `"\nCommits should be done via 'npm run commit'. Continue?",` +
        '"","exit 1",Yes,5]',
    'nps test lint.md lint.scripts',
    'jake run:zero["npm outdated"]',
    COMMIT && `jake run:conditional["\nCommit?","","exit 1",Yes,5]`
  ),
  docs: series(
    TS && `jake run:zero["shx rm -r ${DOCS_DIR}"]`,
    TS && `typedoc --out ${DOCS_DIR} ./src`
  ),
  changelog: 'conventional-changelog -p angular -i CHANGELOG.md -s',
  update: series('npm update --save/save-dev', 'npm outdated'),
  clean: series(
    `jake run:zero["shx rm -r ${OUT_DIR} ${DOCS_DIR} coverage CHANGELOG.md"]`,
    'shx rm -rf node_modules'
  ),
  // Private
  private: {
    watch:
      'concurrently "nps build.transpile" "nps build.declaration" "nps lint"' +
      ' -n babel,tsc,eslint -c green,magenta,yellow',
    preversion: series(
      'shx echo "Recommended version bump is:"',
      'conventional-recommended-bump --preset angular --verbose',
      `jake run:conditional["\nContinue?","","exit 1",Yes]`
    ),
    version: series(
      'nps changelog',
      RELEASE_DOCS && 'nps docs',
      RELEASE_BUILD && 'nps build',
      'git add .'
    )
  }
});
