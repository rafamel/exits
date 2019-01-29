module.exports = {
  // Whether to use TypeScript. Boolean.
  TYPESCRIPT: true,
  // Output build directory. String.
  OUT_DIR: 'build',
  // Output directory for docs. String.
  DOCS_DIR: 'docs',
  // Path to most tooling configuration files. String.
  CONFIG_DIR: __dirname,
  // Extensions for JS and TS files. Comma separated string (no dots).
  EXT_JS: 'js,mjs,jsx',
  EXT_TS: 'ts,tsx',
  // Build project on version bump. Boolean.
  RELEASE_BUILD: true,
  // Generate docs from TS on version bump. Boolean.
  RELEASE_DOCS: false
};
