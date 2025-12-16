# Guia de Testes Automatizados - Backend Controle de Estoque

## 📋 Visão Geral

Este projeto implementa uma suite completa de testes automatizados usando **Jest** e **Supertest** para o backend do sistema de controle de estoque.

## 🚀 Executando os Testes

### Pré-requisitos

1. **Banco de Dados PostgreSQL de Teste**: Configure uma instância PostgreSQL separada para testes
2. **Arquivo `.env.test`**: Configure as variáveis de ambiente para testes (já criado)
3. **Migrations**: As migrations serão aplicadas automaticamente antes dos testes

### Comandos Disponíveis

```bash
# Executar TODOS os testes
npm test

# Executar apenas testes de unidade (rápidos)
npm run test:unit

# Executar apenas testes de integração (mais lentos)
npm run test:integration

# Executar testes com relatório de cobertura
npm run test:coverage

# Executar testes em modo watch (útil durante desenvolvimento)
npm run test:watch
```

### Primeira Execução

Antes de executar os testes pela primeira vez, certifique-se de:

1. **Configurar o banco de dados de teste** no arquivo `.env.test`:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5433/estoque_test?schema=public"
   ```

2. **Criar o banco de dados de teste**:
   ```bash
   # Criar database manualmente ou via Docker
   docker-compose up -d postgres_test
   ```

3. **Executar os testes**:
   ```bash
   npm test
   ```

## 📁 Estrutura de Diretórios

```
backend/
├── __tests__/
│   ├── setup/
│   │   ├── globalSetup.js          # Setup executado antes de todos os testes
│   │   └── globalTeardown.js       # Cleanup executado após todos os testes
│   ├── helpers/
│   │   ├── testHelper.js           # Funções auxiliares (createTestUser, etc.)
│   │   └── prismaTestClient.js     # Cliente Prisma para testes
│   ├── unit/
│   │   ├── services/              # Testes de unidade dos services
│   │   ├── middlewares/           # Testes de unidade dos middlewares
│   │   └── validators/            # Testes dos schemas Zod
│   └── integration/
│       ├── auth.test.js           # Testes de integração das rotas de auth
│       ├── usuarios.test.js       # Testes de integração das rotas de usuários
│       ├── equipamentos.test.js   # Testes de integração das rotas de equipamentos
│       ├── movimentacoes.test.js  # Testes de integração das rotas de movimentações
│       └── app.test.js            # Testes de integração da aplicação
├── jest.config.js                  # Configuração do Jest
├── .env.test                       # Variáveis de ambiente para testes
└── package.json
```

## 🧪 Tipos de Testes

### Testes de Unidade (`__tests__/unit/`)

Testam componentes individuais isoladamente:

- **Services**: Lógica de negócio (authService, usuarioService, equipamentoService, movimentacaoService)
- **Middlewares**: Autenticação e validação (authMiddleware, validateSchema)
- **Validators**: Schemas de validação Zod

**Características**:
- Rápidos de executar
- Testam lógica isolada
- Usam mocks para dependências externas quando necessário

### Testes de Integração (`__tests__/integration/`)

Testam o sistema como um todo, incluindo rotas HTTP:

- **Auth Routes**: Login, logout, cookies, tokens
- **Usuario Routes**: CRUD completo de usuários
- **Equipamento Routes**: CRUD completo de equipamentos
- **Movimentacao Routes**: Criação e listagem de movimentações
- **App**: Configuração da aplicação Express

**Características**:
- Mais lentos (usam banco de dados real)
- Testam fluxo completo da requisição
- Validam integração entre camadas

## 📊 Cobertura de Código

A cobertura de código está configurada com os seguintes limites mínimos:

- **Statements**: 80%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 80%

Para visualizar o relatório de cobertura:

```bash
npm run test:coverage
```

Após a execução, abra `coverage/lcov-report/index.html` no navegador para ver o relatório detalhado.

## 🛠️ Helper Functions

O arquivo `__tests__/helpers/testHelper.js` contém funções auxiliares reutilizáveis:

### Funções Disponíveis

```javascript
// Limpar todas as tabelas do banco de dados de teste
await clearDatabase();

// Criar usuário de teste
const usuario = await createTestUser({
  nome: 'João Silva',
  usuario_rede: 'joao.silva',
  senha: 'senha123'
});

// Gerar token JWT para testes
const token = generateToken(usuario);

// Criar equipamento de teste
const equipamento = await createTestEquipamento(usuario.id, {
  nome: 'Notebook Dell',
  modelo: 'Latitude 5420'
});

// Criar movimentação de teste
const movimentacao = await createTestMovimentacao(
  equipamento.id,
  usuario.id,
  { tipo: 'SAIDA' }
);

// Gerar dados aleatórios únicos
const random = generateRandomData();
// { usuario_rede, numero_serie, patrimonio, email }
```

## ✅ Convenções de Nomenclatura

### Arquivos de Teste

- Testes de unidade: `*.test.js` em `__tests__/unit/`
- Testes de integração: `*.test.js` em `__tests__/integration/`
- Estrutura de diretórios espelha a estrutura de `src/`

### Estrutura de Testes

```javascript
describe('NomeDoComponente', () => {
  beforeEach(async () => {
    // Setup antes de cada teste
    await clearDatabase();
  });

  afterAll(async () => {
    // Cleanup após todos os testes
    await clearDatabase();
    await prisma.$disconnect();
  });

  describe('nomeDaFuncao', () => {
    it('deve <comportamento esperado>', async () => {
      // Arrange (preparação)
      // Act (ação)
      // Assert (verificação)
    });
  });
});
```

## 🔧 Troubleshooting

### Problema: "Port 5433 already in use"

**Solução**: Outro processo está usando a porta do banco de teste. Pare o processo ou mude a porta em `.env.test`.

### Problema: "Database does not exist"

**Solução**: Crie o banco de dados de teste:
```bash
createdb estoque_test
# ou via Docker
docker-compose up -d postgres_test
```

### Problema: "Cannot find module 'supertest'"

**Solução**: Instale as dependências de desenvolvimento:
```bash
npm install
```

### Problema: Testes falhando por timeout

**Solução**: Aumente o timeout no Jest (já configurado para 10s em `jest.config.js`). Se persistir, verifique a conexão com o banco de dados.

### Problema: Migrations não aplicadas

**Solução**: Execute manualmente:
```bash
DATABASE_URL=<url_do_banco_teste> npx prisma migrate deploy
```

## 📝 Como Adicionar Novos Testes

### 1. Teste de Unidade para um Service

```javascript
// __tests__/unit/services/meuService.test.js
const meuService = require('../../../src/services/meuService');
const { clearDatabase, prisma } = require('../../helpers/testHelper');

describe('MeuService', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('minhaFuncao', () => {
    it('deve fazer algo esperado', async () => {
      // Arrange
      const dados = { /* ... */ };

      // Act
      const resultado = await meuService.minhaFuncao(dados);

      // Assert
      expect(resultado).toBeDefined();
    });
  });
});
```

### 2. Teste de Integração para uma Rota

```javascript
// __tests__/integration/minhaRota.test.js
const request = require('supertest');
const app = require('../../../src/app');
const { clearDatabase, createTestUser, generateToken } = require('../../helpers/testHelper');

describe('Minha Rota - Integration Tests', () => {
  let authToken;

  beforeEach(async () => {
    await clearDatabase();
    const usuario = await createTestUser();
    authToken = generateToken(usuario);
  });

  describe('GET /api/minha-rota', () => {
    it('deve retornar dados com autenticação', async () => {
      const response = await request(app)
        .get('/api/minha-rota')
        .set('Cookie', [`token=${authToken}`]);

      expect(response.status).toBe(200);
    });
  });
});
```

## 🎯 Boas Práticas

1. **Sempre limpe o banco de dados**: Use `clearDatabase()` no `beforeEach`
2. **Desconecte o Prisma**: Use `await prisma.$disconnect()` no `afterAll`
3. **Use dados aleatórios**: Utilize `generateRandomData()` para evitar conflitos
4. **Teste casos de sucesso E erro**: Não esqueça dos cenários negativos
5. **Siga o padrão AAA**: Arrange, Act, Assert
6. **Seja específico nas asserções**: Verifique exatamente o que importa
7. **Isole os testes**: Cada teste deve ser independente

## 📚 Documentação Adicional

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)

---

**Última atualização**: 2025-12-14
