# Implementação CRUD Usuários - MVC + Services

## 📁 Estrutura Criada

```
backend/src/
├── controllers/
│   └── usuarioController.js       # HTTP: req/res handling
├── services/
│   └── usuarioService.js          # Lógica de negócio
├── routes/
│   ├── index.js                   # Rotas centralizadas
│   └── usuarioRoutes.js           # Endpoints de usuário
├── middlewares/                   # Pasta para futuros middlewares
└── models/
    └── prisma.js                  # Cliente Prisma
```

---

## 🏗️ Arquitetura MVC + Services

### Fluxo de uma Requisição:

```
Cliente (Postman/cURL)
    ↓
Route (usuarioRoutes.js) → Define endpoint POST /usuarios
    ↓
Controller (usuarioController.js) → Valida requisição HTTP
    ↓
Service (usuarioService.js) → Executa lógica de negócio
    ↓
Prisma (models/prisma.js) → Acessa banco de dados
    ↓
PostgreSQL → Persiste dados
```

---

## 🔨 Arquivos Implementados

### 1. Service (`services/usuarioService.js`)

**Responsabilidade:** Lógica de negócio

**Métodos:**
- `criar(dados)` - Cria usuário com senha criptografada
- `listar()` - Retorna todos os usuários
- `buscarPorId(id)` - Busca por ID
- `atualizar(id, dados)` - Atualiza usuário
- `excluir(id)` - Remove usuário (com validação)

**Características:**
- ✅ Validações de negócio
- ✅ Criptografia de senha com bcrypt
- ✅ Verifica duplicidade de `usuario_rede`
- ✅ Não retorna `senha_hash` nas respostas
- ✅ Impede excluir usuário com equipamentos

---

### 2. Controller (`controllers/usuarioController.js`)

**Responsabilidade:** Orquestrar requisições HTTP

**Métodos:**
- `criar(req, res)` → POST 201 Created
- `listar(req, res)` → GET 200 OK
- `buscarPorId(req, res)` → GET 200 OK / 404 Not Found
- `atualizar(req, res)` → PUT 200 OK / 400 Bad Request
- `excluir(req, res)` → DELETE 200 OK / 400 Bad Request

**Características:**
- ✅ Try/catch para tratamento de erros
- ✅ Status HTTP adequados
- ✅ Delega lógica para o Service

---

### 3. Routes (`routes/usuarioRoutes.js`)

**Responsabilidade:** Definir endpoints REST

```javascript
POST   /api/usuarios      → Criar
GET    /api/usuarios      → Listar todos
GET    /api/usuarios/:id  → Buscar por ID
PUT    /api/usuarios/:id  → Atualizar
DELETE /api/usuarios/:id  → Excluir
```

---

## 📝 Como Usar como Exemplo

Para implementar CRUD de **Equipamentos**, siga este padrão:

### 1. Criar `services/equipamentoService.js`

Copie `usuarioService.js` e adapte:

```javascript
// Diferenças principais:
- usuario → equipamento
- Adicionar lógica de status (NO_DEPOSITO, FORA_DEPOSITO, DESCARTADO)
- "Excluir" = Mudar status para DESCARTADO
- Validar campos específicos (patrimonio opcional, numero_serie único)
```

### 2. Criar `controllers/equipamentoController.js`

Copie `usuarioController.js` e adapte:

```javascript
// Mesma estrutura, só muda:
- usuarioService → equipamentoService
- Comentários adequados
```

### 3. Criar `routes/equipamentoRoutes.js`

Copie `usuarioRoutes.js` e adapte:

```javascript
const equipamentoController = require('../controllers/equipamentoController');

router.post('/', equipamentoController.criar);
router.get('/', equipamentoController.listar);
// ... etc
```

### 4. Registrar em `routes/index.js`

```javascript
const equipamentoRoutes = require('./equipamentoRoutes');
router.use('/equipamentos', equipamentoRoutes);
```

---

## 🧪 Testando

### Com cURL:

```bash
# Criar usuário
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "usuario_rede": "joao.silva",
    "senha_hash": "senha123"
  }'

# Listar
curl http://localhost:3000/api/usuarios

# Buscar por ID
curl http://localhost:3000/api/usuarios/1

# Atualizar
curl -X PUT http://localhost:3000/api/usuarios/1 \
  -H "Content-Type: application/json" \
  -d '{"nome": "João Pedro Silva"}'

# Excluir
curl -X DELETE http://localhost:3000/api/usuarios/1
```

---

## ⚠️ Problema Atual

O container está crasheando com erro do PrismaClient. Isso ocorre porque:

1. O Prisma Client precisa ser gerado APÓS o `npm install`
2. O Docker está tentando usar o Prisma antes de gerar

**Solução temporária:** Rodar sem Docker

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

Depois testar os endpoints em `http://localhost:3000/api`
