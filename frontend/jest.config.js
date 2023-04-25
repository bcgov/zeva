module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.{js,jsx}'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: -50
    }
  },
  moduleFileExtensions: ['js', 'node', 'json'],
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': '<rootDir>/__mocks__/style.js'
  },
  setupFiles: ['./jest.setup.js'],
  testEnvironmentOptions: {
    url: 'http://localhost/'
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  coveragePathIgnorePatterns: ['node_modules/'],
  verbose: true,
  globals: {
    __VERSION__: ''
  }
}
