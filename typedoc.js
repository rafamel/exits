module.exports = {
  mode: 'file',
  includeDeclarations: true,
  excludePrivate: true,
  excludeProtected: true,
  excludeExternals: true,
  moduleResolution: 'node',
  module: 'system',
  exclude: ['**/utils/**/*.ts', '**/store.ts', '**/logger.ts']
};
