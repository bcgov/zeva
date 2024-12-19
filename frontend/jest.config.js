module.exports = {
  testEnvironment: "jest-environment-jsdom",
  collectCoverageFrom: ["src/**/*.{js,jsx}"],
  coverageReporters: ["json", "html", "lcov"],
  coverageThreshold: {
    global: {
      branches: 1,
      functions: 1,
      lines: 1,
      statements: -6000,
    },
  },
  moduleFileExtensions: ["js", "node", "json"],
  moduleNameMapper: {
    "^.+\\.(css|less|scss)$": "<rootDir>/__mocks__/style.js",
  },
  setupFiles: ["./jest.setup.js"],
  testEnvironmentOptions: {
    url: "http://localhost/",
  },
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  testPathIgnorePatterns: ["/node_modules/", "/__tests__/test-data/"],
  coveragePathIgnorePatterns: ["node_modules/", "/__tests__/test-data/"],
  verbose: true,
  globals: {
    __VERSION__: "",
  },
};
