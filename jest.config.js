export default {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: ['.jsx'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/__tests__/**/*.js', '**/*.test.js', '**/*.simple.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.jsx',
    '!src/tui/index.js',
    '!src/index.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  transformIgnorePatterns: [
    'node_modules/(?!(date-fns)/)'
  ]
}