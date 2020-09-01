module.exports = {
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: -50,
    },
  },
  moduleFileExtensions: ['js', 'node'],
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': '<rootDir>/__mocks__/style.js',
  },
  testURL: 'http://localhost/',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react.*|@babel.*|es.*)/)',
  ],
  verbose: true,
  globals: {
    __APIBASE__: '/',
    __KEYCLOAK_CLIENT_ID__: '',
    __KEYCLOAK_LOGOUT_REDIRECT_URL__: '',
    __KEYCLOAK_REALM_NAME__: '',
    __KEYCLOAK_URL__: '',
    __VERSION__: '',
  },

};
