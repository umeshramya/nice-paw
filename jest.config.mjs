/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm', // ✅ important for ESM
  testEnvironment: 'node',

  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],

  moduleFileExtensions: ['ts', 'js', 'json'], // ✅ add this

  extensionsToTreatAsEsm: ['.ts'],

  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // ✅ required for ESM imports
  },

  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.json',
      },
    ],
  },

  testEnvironmentOptions: {
    experimentalVmModules: true, // ✅ critical for ESM
  },

  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '*.ts',              // ✅ include root files like index.ts
    '!**/node_modules/**',
    '!**/__tests__/**'
  ],

  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],

  clearMocks: true,
};