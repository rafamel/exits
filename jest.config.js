const { EXT_JS, EXT_TS } = require('./project.config');
const EXT = EXT_JS + ',' + EXT_TS;
const EXT_ARR = EXT.split(',').map((x) => x.trim());

module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [`<rootDir>/src/**/*.{${EXT}}`],
  modulePathIgnorePatterns: [
    '<rootDir>/build',
    '<rootDir>/src/@types',
    '<rootDir>/src/bin'
  ],
  moduleFileExtensions: EXT_ARR.concat(['json']),
  testPathIgnorePatterns: ['/node_modules/']
};
