module.exports = {
  // Ambiente de teste Node.js
  testEnvironment: 'node',
  maxWorkers: 1,

  // Padrões para encontrar arquivos de teste
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Diretórios a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ],

  // Cobertura de código
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js', // Ignora entry point
    '!src/models/prisma.js' // Ignora configuração do Prisma
  ],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80
    }
  },

  // Diretório de saída da cobertura
  coverageDirectory: 'coverage',

  // Reporters de cobertura
  coverageReporters: ['text', 'lcov', 'html'],

  // Setup global antes de todos os testes
  globalSetup: './__tests__/setup/globalSetup.js',

  // Teardown global após todos os testes
  globalTeardown: './__tests__/setup/globalTeardown.js',

  // Timeout padrão para testes (10 segundos)
  testTimeout: 10000,

  // Limpar mocks automaticamente entre testes
  clearMocks: true,

  // Restaurar mocks automaticamente entre testes
  restoreMocks: true,

  // Verbose output
  verbose: true
};
