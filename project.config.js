module.exports = {
  // Whether to use TypeScript. Boolean.
  TYPESCRIPT: true,
  // Output build directory. String.
  OUT_DIR: 'build',
  // Output directory for docs. String.
  DOCS_DIR: 'docs',
  // Path to most tooling configuration files. String.
  CONFIG_DIR: __dirname,
  // Output directory for binaries. String.
  BIN_DIR: 'bin',
  // Architectures to build binaries for with pkg. Comma separated string.
  BIN_ARCHS:
    'node8-linux-x86,node8-macos-x86,node8-win-x86,node8-linux-x64,node8-macos-x64,node8-win-x64',
  // Extensions for JS and TS files. Comma separated string (no dots).
  EXT_JS: 'js,mjs,jsx',
  EXT_TS: 'ts,tsx',
  // Build project on version bump. Boolean.
  RELEASE_BUILD: true,
  // Generate docs from TS on version bump. Boolean.
  RELEASE_DOCS: false
};
