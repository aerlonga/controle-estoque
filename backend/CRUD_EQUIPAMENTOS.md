# 📦 CRUD de Equipamentos - Guia Passo a Passo

## 🎯 Objetivo

Este guia ensina como implementar o **CRUD completo de Equipamentos**, seguindo o mesmo padrão arquitetural usado no CRUD de Usuários.

---

## 📋 Passo a Passo da Implementação

### 1️⃣ Schema Prisma (Modelo de Dados)

**Arquivo:** `backend/prisma/schema.prisma`

✅ **JÁ EXISTE!** O modelo já está definido:

```prisma
enum StatusEquipamento {
  NO_DEPOSITO
  FORA_DEPOSITO
  DESCARTADO
}

model Equipamento {
  id           Int               @id @default(autoincrement())
  patrimonio   String?           // Opcional
  nome         String
  modelo       String
  numero_serie String            @unique
  status       StatusEquipamento @default(NO_DEPOSITO)
  local        String?
  usuario_id   Int
  created_at   DateTime          @default(now())
  updated_at   DateTime          @updatedAt

  usuario       Usuario        @relation("EquipamentoCadastrado", fields: [usuario_id], references: [id])
  movimentacoes Movimentacao[] @relation("MovimentacaoEquipamento")

  @@map("equipamentos")
}
```

**O que cada campo significa:**
- `id`: ID auto-incrementado (chave primária)
- `patrimonio`: Número de patrimônio (opcional) 
- `nome`: Nome/descrição do equipamento (ex: "Notebook Dell")
- `modelo`: Modelo específico (ex: "Latitude 5420")
- `numero_serie`: Número de série **único** (ex: "SN123456789")
- `status`: Enum com 3 valores possíveis
  - `NO_DEPOSITO`: Equipamento guardado
  - `FORA_DEPOSITO`: Equipamento em uso/emprestado
  - `DESCARTADO`: Equipamento descartado (soft delete)
- `local`: Localização atual (opcional)
- `usuario_id`: Quem cadastrou o equipamento
- `created_at`: Data de criação (automático)
- `updated_at`: Data de atualização (automático)

---

### 2️⃣ Migration (Criar Tabela no Banco)

**Se a migration já existe**, pule este passo. Caso contrário:

```bash
# Entrar no container
docker compose exec backend bash

# Criar migration
npx prisma migrate dev --name criar_tabela_equipamentos

# Ou aplicar migrations existentes
npx prisma migrate deploy
```

**O que acontece:**
- Prisma cria um arquivo SQL em `prisma/migrations/`
- A tabela `equipamentos` é criada no PostgreSQL
- Com todos os índices, constraints e relações

---

### 3️⃣ Service (Lógica de Negócio)

**Arquivo:** `backend/src/services/equipamentoService.js` **(CRIAR NOVO)**

```javascript
const prisma = require('../models/prisma');

module.exports = equipamentoService;
```

---

### 4️⃣ Controller (Manipulador HTTP)

**Arquivo:** `backend/src/controllers/equipamentoController.js` **(CRIAR NOVO)**

---

### 5️⃣ Routes (Definição de Endpoints)

**Arquivo:** `backend/src/routes/equipamentoRoutes.js` **(CRIAR NOVO)**

---

### 6️⃣ Registrar Rotas no Index

**Arquivo:** `backend/src/routes/index.js` **(MODIFICAR)**

---

## 📍 Endpoints da API

**Base URL:** `http://localhost:3000/api`

### 1. Criar Equipamento

**POST** `/equipamentos`

```bash
curl -X POST http://localhost:3000/api/equipamentos \
  -H "Content-Type: application/json" \
  -d '{
    "patrimonio": "PAT-001",
    "nome": "Notebook Dell",
    "modelo": "Latitude 5420",
    "numero_serie": "SN123456789",
    "local": "Sala 101",
    "usuario_id": 1
  }'
```

**Resposta (201 Created):**
```json
{
  "id": 1,
  "patrimonio": "PAT-001",
  "nome": "Notebook Dell",
  "modelo": "Latitude 5420",
  "numero_serie": "SN123456789",
  "status": "NO_DEPOSITO",
  "local": "Sala 101",
  "usuario_id": 1,
  "created_at": "2025-12-14T14:30:00.000Z",
  "updated_at": "2025-12-14T14:30:00.000Z",
  "usuario": {
    "id": 1,
    "nome": "João Silva",
    "usuario_rede": "joao.silva"
  }
}
```

**Validações:**
- `nome`: obrigatório, mínimo 3 caracteres
- `modelo`: obrigatório, mínimo 2 caracteres
- `numero_serie`: obrigatório, único, mínimo 3 caracteres
- `usuario_id`: obrigatório, deve existir na tabela usuarios
- `patrimonio`: opcional
- `local`: opcional

---

### 2. Listar Equipamentos Ativos

**GET** `/equipamentos`

```bash
curl http://localhost:3000/api/equipamentos
```

**Resposta (200 OK):**
```json
[
  {
    "id": 1,
    "patrimonio": "PAT-001",
    "nome": "Notebook Dell",
    "modelo": "Latitude 5420",
    "numero_serie": "SN123456789",
    "status": "NO_DEPOSITO",
    "local": "Sala 101",
    "usuario_id": 1,
    "created_at": "2025-12-14T14:30:00.000Z",
    "updated_at": "2025-12-14T14:30:00.000Z",
    "usuario": {
      "id": 1,
      "nome": "João Silva",
      "usuario_rede": "joao.silva"
    }
  }
]
```

**Nota:** Retorna apenas equipamentos com `status != DESCARTADO`.

---

### 3. Buscar Equipamento por ID

**GET** `/equipamentos/:id`

```bash
curl http://localhost:3000/api/equipamentos/1
```

**Resposta (200 OK):**
```json
{
  "id": 1,
  "patrimonio": "PAT-001",
  "nome": "Notebook Dell",
  "modelo": "Latitude 5420",
  "numero_serie": "SN123456789",
  "status": "NO_DEPOSITO",
  "local": "Sala 101",
  "usuario_id": 1,
  "created_at": "2025-12-14T14:30:00.000Z",
  "updated_at": "2025-12-14T14:30:00.000Z",
  "usuario": {
    "id": 1,
    "nome": "João Silva",
    "usuario_rede": "joao.silva"
  },
  "movimentacoes": []
}
```

**Erro (404 Not Found):**
```json
{
  "error": "Equipamento não encontrado"
}
```

---

### 4. Atualizar Equipamento

**PUT** `/equipamentos/:id`

```bash
curl -X PUT http://localhost:3000/api/equipamentos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Notebook Dell Atualizado",
    "local": "Sala 202",
    "status": "FORA_DEPOSITO"
  }'
```

**Resposta (200 OK):**
```json
{
  "id": 1,
  "patrimonio": "PAT-001",
  "nome": "Notebook Dell Atualizado",
  "modelo": "Latitude 5420",
  "numero_serie": "SN123456789",
  "status": "FORA_DEPOSITO",
  "local": "Sala 202",
  "usuario_id": 1,
  "created_at": "2025-12-14T14:30:00.000Z",
  "updated_at": "2025-12-14T14:35:00.000Z",
  "usuario": {
    "id": 1,
    "nome": "João Silva",
    "usuario_rede": "joao.silva"
  }
}
```

**Campos atualizáveis:**
- `patrimonio`
- `nome`
- `modelo`
- `numero_serie` (se não estiver em uso)
- `status` (valores: `NO_DEPOSITO`, `FORA_DEPOSITO`, `DESCARTADO`)
- `local`

---

### 5. Descartar Equipamento (Soft Delete)

**DELETE** `/equipamentos/:id`

```bash
curl -X DELETE http://localhost:3000/api/equipamentos/1
```

**Resposta (200 OK):**
```json
{
  "message": "Equipamento descartado com sucesso"
}
```

**Comportamento:**
- Define `status = DESCARTADO`
- Registro **permanece no banco**
- Não aparece mais na listagem padrão (`GET /equipamentos`)

---

## ✅ Checklist de Implementação

Use este checklist para acompanhar sua implementação:

- [ ] **1. Verificar schema** - Abrir `prisma/schema.prisma` e conferir model Equipamento
- [ ] **2. Rodar migrations** - `npx prisma migrate deploy` (se necessário)
- [ ] **3. Criar Service** - Criar arquivo `src/services/equipamentoService.js`
- [ ] **4. Criar Controller** - Criar arquivo `src/controllers/equipamentoController.js`
- [ ] **5. Criar Routes** - Criar arquivo `src/routes/equipamentoRoutes.js`
- [ ] **6. Registrar rotas** - Modificar `src/routes/index.js`
- [ ] **7. Testar criação** - `POST /api/equipamentos`
- [ ] **8. Testar listagem** - `GET /api/equipamentos`
- [ ] **9. Testar busca por ID** - `GET /api/equipamentos/1`
- [ ] **10. Testar atualização** - `PUT /api/equipamentos/1`
- [ ] **11. Testar soft delete** - `DELETE /api/equipamentos/1`

---

## 🔄 Comparação: PHP/Java vs Node.js

| Conceito | PHP (Laravel) | Java (Spring) | Node.js (Express + Prisma) |
|----------|---------------|---------------|----------------------------|
| **Roteamento** | `Route::post('/equipamentos')` | `@PostMapping("/equipamentos")` | `router.post('/', controller.criar)` |
| **Controller** | `EquipamentoController` | `@RestController` | `equipamentoController` |
| **Service** | `EquipamentoService` | `@Service` | `equipamentoService` |
| **ORM** | Eloquent | JPA/Hibernate | Prisma |
| **Validação** | `$request->validate()` | `@Valid` | Validação manual ou lib |
| **Resposta JSON** | `return response()->json()` | `return ResponseEntity` | `res.status(200).json()` |
| **Async** | Não nativo (precisa Swoole) | CompletableFuture | Nativo (`async/await`) |

---

## 🧪 Testando com cURL

### Exemplo de fluxo completo:

```bash
# 1. Criar equipamento
curl -X POST http://localhost:3000/api/equipamentos \
  -H "Content-Type: application/json" \
  -d '{"patrimonio":"PAT-001","nome":"Notebook Dell","modelo":"Latitude 5420","numero_serie":"SN001","usuario_id":1}'

# 2. Listar todos
curl http://localhost:3000/api/equipamentos

# 3. Buscar ID 1
curl http://localhost:3000/api/equipamentos/1

# 4. Atualizar
curl -X PUT http://localhost:3000/api/equipamentos/1 \
  -H "Content-Type: application/json" \
  -d '{"local":"Sala 202","status":"FORA_DEPOSITO"}'

# 5. Descartar
curl -X DELETE http://localhost:3000/api/equipamentos/1

# 6. Listar novamente (não deve aparecer o ID 1)
curl http://localhost:3000/api/equipamentos
```

---

## 🐛 Problemas Comuns

### 1. "Equipamento não encontrado"
- Verifique se o ID existe
- Confira se o equipamento não foi descartado

### 2. "Número de série já cadastrado"
- O campo `numero_serie` é único
- Use outro número de série

### 3. "ID do usuário é obrigatório"
- Certifique-se de enviar `usuario_id` no corpo da requisição
- O usuário deve existir na tabela `usuarios`

### 4. Erro 500 no servidor
- Veja os logs: `docker compose logs backend -f`
- Verifique se o Prisma está conectado ao banco

---

## 🚀 Próximos Passos

Após dominar o CRUD de Equipamentos, você pode:

1. **Implementar CRUD de Movimentações** (entrada/saída de equipamentos)
2. **Adicionar autenticação JWT** para proteger os endpoints
3. **Criar validações com biblioteca** (ex: Joi, Yup, Zod)
4. **Implementar paginação** na listagem
5. **Adicionar filtros** (por status, por usuário, etc.)
6. **Criar testes automatizados** (Jest + Supertest)

---

Bons estudos! 🎓
