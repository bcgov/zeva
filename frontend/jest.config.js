module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: ['src/**/*.{js,jsx}'],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 10,
      lines: 20,
      statements: -6000
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
