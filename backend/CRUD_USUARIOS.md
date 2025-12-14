# 📖 API de Controle de Estoque - Documentação

## 🏗️ Arquitetura: MVC + Services

### Credenciais iniciais:

Usuário: admin
Senha: admin123

### Estrutura de Pastas

```
backend/src/
├── controllers/     # HTTP handlers (req/res)
├── services/        # Lógica de negócio
├── routes/          # Definição de endpoints
├── middlewares/     # Middlewares futuros
└── models/
    └── prisma.js    # Cliente Prisma
```

### Fluxo de Requisição

```
Cliente HTTP
    ↓
Route (/api/usuarios)
    ↓
Controller (usuarioController.js)
    ↓
Service (usuarioService.js)
    ↓
Prisma Client
    ↓
PostgreSQL
```

---

## � CRUD de Usuários

### Modelo de Dados

```prisma
model Usuario {
  id             Int      @id @default(autoincrement())
  nome           String
  usuario_rede   String   @unique
  senha_hash     String
  status_usuario Int      @default(1)  // 1 = ativo, 0 = desativado
  created_at     DateTime @default(now()) @db.Timestamptz(3)
}
```

---

## 📍 Endpoints

**Base URL:** `http://localhost:3000/api`

### 1. Criar Usuário

**POST** `/usuarios`

```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "usuario_rede": "joao.silva",
    "senha_hash": "senha123"
  }'
```

**Resposta (201 Created):**
```json
{
  "id": 1,
  "nome": "João Silva",
  "usuario_rede": "joao.silva",
  "created_at": "2025-12-07T18:30:00.000Z"
}
```

**Validações:**
- `nome`: obrigatório, mínimo 3 caracteres
- `usuario_rede`: obrigatório, único, sem espaços
- `senha_hash`: obrigatório, mínimo 6 caracteres (criptografado com bcrypt)

---

### 2. Listar Usuários Ativos

**GET** `/usuarios`

```bash
curl http://localhost:3000/api/usuarios
```

**Resposta (200 OK):**
```json
[
  {
    "id": 1,
    "nome": "João Silva",
    "usuario_rede": "joao.silva",
    "created_at": "2025-12-07T18:30:00.000Z"
  }
]
```

**Nota:** Retorna apenas usuários com `status_usuario = 1` (ativos).

---

### 3. Buscar Usuário por ID

**GET** `/usuarios/:id`

```bash
curl http://localhost:3000/api/usuarios/1
```

**Resposta (200 OK):**
```json
{
  "id": 1,
  "nome": "João Silva",
  "usuario_rede": "joao.silva",
  "created_at": "2025-12-07T18:30:00.000Z"
}
```

**Erro (404 Not Found):**
```json
{
  "error": "Usuário não encontrado"
}
```

---

### 4. Atualizar Usuário

**PUT** `/usuarios/:id`

```bash
curl -X PUT http://localhost:3000/api/usuarios/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Pedro Silva"
  }'
```

**Resposta (200 OK):**
```json
{
  "id": 1,
  "nome": "João Pedro Silva",
  "usuario_rede": "joao.silva",
  "created_at": "2025-12-07T18:30:00.000Z"
}
```

**Campos atualizáveis:**
- `nome`
- `usuario_rede` (se não estiver em uso)
- `senha_hash` (será re-criptografada)

---

### 5. Desativar Usuário (Soft Delete)

**DELETE** `/usuarios/:id`

```bash
curl -X DELETE http://localhost:3000/api/usuarios/1
```

**Resposta (200 OK):**
```json
{
  "message": "Usuário desativado com sucesso"
}
```

**Comportamento:**
- Define `status_usuario = 0`
- Registro **permanece no banco**
- Não aparece mais na listagem padrão

---

## 🔐 Segurança

### Criptografia de Senha

```javascript
const bcrypt = require('bcrypt');

// Ao criar/atualizar
const senhaHash = await bcrypt.hash(senha, 10);

// Para validar (login futuro)
const valido = await bcrypt.compare(senhaDigitada, senhaHash);
```

---

## 🌎 Timezone

O banco está configurado para **America/Sao_Paulo** (horário de Brasília).

Todas as datas em `created_at` são salvas com timezone correto.

---

## 🐳 Docker

### Comandos Úteis

```bash
# Subir containers
docker compose up -d

# Ver logs
docker compose logs backend -f

# Entrar no container
docker compose exec backend bash

# Rodar migrations
docker compose exec backend npx prisma migrate deploy

# Reiniciar
docker compose restart backend
```

---

## 🧪 Testando com Postman

**Importe esta collection:**

**Collection:** `Controle Estoque API`

| Método | Endpoint | Body |
|--------|----------|------|
| POST | `/api/usuarios` | `{"nome":"Teste","usuario_rede":"teste","senha_hash":"123456"}` |
| GET | `/api/usuarios` | - |
| GET | `/api/usuarios/1` | - |
| PUT | `/api/usuarios/1` | `{"nome":"Teste Atualizado"}` |
| DELETE | `/api/usuarios/1` | - |

---

## 📊 Tecnologias

- **Node.js 22** (Debian)
- **Express 5**
- **Prisma ORM 5.22**
- **PostgreSQL 15**
- **Docker & Docker Compose**
- **bcrypt** (criptografia)

---

## 🎯 Próximos Passos

Para implementar **CRUD de Equipamentos**, siga o mesmo padrão:

1. Já tem o schema em `prisma/schema.prisma`
2. Copie `usuarioService.js` → `equipamentoService.js`
3. Copie `usuarioController.js` → `equipamentoController.js`
4. Copie `usuarioRoutes.js` → `equipamentoRoutes.js`
5. Registre em `routes/index.js`:
   ```javascript
   router.use('/equipamentos', equipamentoRoutes);
   ```

**Diferenças específicas:**
- "Excluir" = mudar `status` para `DESCARTADO`
- Validar `numero_serie` único
- `patrimonio` é opcional
