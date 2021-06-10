module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  setupFiles: ['jest-date-mock'],
  moduleNameMapper: {
    // Stub out and css files that are imported while testing
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/unit/stubs/cssStub.js'
  }
};
