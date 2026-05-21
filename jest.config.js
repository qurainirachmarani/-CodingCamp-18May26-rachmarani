/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  // app.js uses 'use strict' and plain globals (no ES module exports).
  // Tests will load the script via a helper or jest.resetModules().
  // CommonJS transform is the default for Jest, so no extra transform config needed.
  testMatch: ['**/__tests__/**/*.js', '**/*.test.js'],
  clearMocks: true,
};

module.exports = config;
