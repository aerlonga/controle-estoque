# 📦 CRUD de Movimentações - Guia Completo

Este documento explica como implementar e utilizar o CRUD de **Movimentações** no sistema de controle de estoque.

## 📖 Índice
- [Visão Geral](#visão-geral)
- [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
- [Implementação](#implementação)
  - [Service (Lógica de Negócio)](#service-lógica-de-negócio)
  - [Controller (Manipulador HTTP)](#controller-manipulador-http)
  - [Routes (Definição de Endpoints)](#routes-definição-de-endpoints)
- [Endpoints da API](#endpoints-da-api)
- [Exemplos de Uso](#exemplos-de-uso)

---

## Visão Geral

**Movimentação** registra todas as ENTRADAS e SAÍDAS de equipamentos do depósito. Cada vez que um equipamento entra ou sai, uma movimentação é criada, e o **status do equipamento é atualizado automaticamente**.

### Características Principais:
- ✅ Registro de ENTRADA/SAÍDA de equipamentos
- ✅ Atualização automática do status do equipamento
- ✅ Histórico completo de movimentações
- ✅ Filtros por equipamento, usuário, tipo e data
- ✅ Relacionamentos com Equipamento e Usuário

---

## Estrutura do Banco de Dados

### Enum: TipoMovimentacao
```prisma
enum TipoMovimentacao {
  ENTRADA      // Equipamento voltou para o depósito
  SAIDA        // Equipamento saiu do depósito
}
```

### Model: Movimentacao
```prisma
model Movimentacao {
  id                Int              @id @default(autoincrement())
  equipamento_id    Int              // ID do equipamento movimentado
  tipo              TipoMovimentacao // ENTRADA ou SAIDA
  data_movimentacao DateTime         @default(now())
  usuario_id        Int              // Quem fez a movimentação
  observacao        String?          // Observações opcionais
  created_at        DateTime         @default(now())

  equipamento Equipamento @relation(fields: [equipamento_id], references: [id])
  usuario     Usuario     @relation(fields: [usuario_id], references: [id])

  @@map("movimentacoes")
}
```

**Campos:**
- `id`: Identificador único (auto-incremento)
- `equipamento_id`: Equipamento que foi movimentado (**obrigatório**)
- `tipo`: ENTRADA ou SAIDA (**obrigatório**)
- `data_movimentacao`: Data/hora da movimentação (padrão: agora)
- `usuario_id`: Usuário responsável pela movimentação (**obrigatório**)
- `observacao`: Texto livre para observações (opcional)
- `created_at`: Timestamp de criação do registro

---

## Implementação

### Service (Lógica de Negócio)

**Arquivo:** `backend/src/services/movimentacaoService.js`

```javascript
const prisma = require('../models/prisma');

const movimentacaoService = {
  // Criar movimentação
  async criar(dados) {
    const { equipamento_id, tipo, usuario_id, observacao, data_movimentacao } = dados;

    // Validações
    if (!equipamento_id || isNaN(equipamento_id)) {
      throw new Error('ID do equipamento é obrigatório');
    }

    if (!tipo || !['ENTRADA', 'SAIDA'].includes(tipo)) {
      throw new Error('Tipo deve ser ENTRADA ou SAIDA');
    }

    if (!usuario_id || isNaN(usuario_id)) {
      throw new Error('ID do usuário é obrigatório');
    }

    // Verificar se equipamento existe
    const equipamento = await prisma.equipamento.findUnique({
      where: { id: parseInt(equipamento_id) }
    });

    if (!equipamento) {
      throw new Error('Equipamento não encontrado');
    }

    // Verificar se usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(usuario_id) }
    });

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // Criar movimentação
    const movimentacao = await prisma.movimentacao.create({
      data: {
        equipamento_id: parseInt(equipamento_id),
        tipo: tipo,
        usuario_id: parseInt(usuario_id),
        observacao: observacao ? observacao.trim() : null,
        data_movimentacao: data_movimentacao ? new Date(data_movimentacao) : new Date()
      },
      include: {
        equipamento: {
          select: {
            id: true,
            patrimonio: true,
            nome: true,
            modelo: true,
            numero_serie: true
          }
        },
        usuario: {
          select: {
            id: true,
            nome: true,
            usuario_rede: true
          }
        }
      }
    });

    // ⚡ ATUALIZA STATUS DO EQUIPAMENTO AUTOMATICAMENTE
    const novoStatus = tipo === 'ENTRADA' ? 'NO_DEPOSITO' : 'FORA_DEPOSITO';
    
    await prisma.equipamento.update({
      where: { id: parseInt(equipamento_id) },
      data: { status: novoStatus }
    });

    return movimentacao;
  },

  // Listar com filtros
  async listar(filtros = {}) {
    const { equipamento_id, tipo, usuario_id, data_inicio, data_fim } = filtros;

    const where = {};

    if (equipamento_id) {
      where.equipamento_id = parseInt(equipamento_id);
    }

    if (tipo && ['ENTRADA', 'SAIDA'].includes(tipo)) {
      where.tipo = tipo;
    }

    if (usuario_id) {
      where.usuario_id = parseInt(usuario_id);
    }

    // Filtro por intervalo de datas
    if (data_inicio || data_fim) {
      where.data_movimentacao = {};
      
      if (data_inicio) {
        where.data_movimentacao.gte = new Date(data_inicio);
      }
      
      if (data_fim) {
        where.data_movimentacao.lte = new Date(data_fim);
      }
    }

    const movimentacoes = await prisma.movimentacao.findMany({
      where,
      include: {
        equipamento: {
          select: {
            id: true,
            patrimonio: true,
            nome: true,
            modelo: true,
            numero_serie: true
          }
        },
        usuario: {
          select: {
            id: true,
            nome: true,
            usuario_rede: true
          }
        }
      },
      orderBy: {
        data_movimentacao: 'desc'
      }
    });

    return movimentacoes;
  },

  // Buscar por ID
  async buscarPorId(id) {
    const movimentacao = await prisma.movimentacao.findUnique({
      where: { id: parseInt(id) },
      include: {
        equipamento: {
          select: {
            id: true,
            patrimonio: true,
            nome: true,
            modelo: true,
            numero_serie: true,
            status: true
          }
        },
        usuario: {
          select: {
            id: true,
            nome: true,
            usuario_rede: true
          }
        }
      }
    });

    if (!movimentacao) {
      throw new Error('Movimentação não encontrada');
    }

    return movimentacao;
  },

  // Histórico de um equipamento específico
  async listarPorEquipamento(equipamento_id) {
    const movimentacoes = await prisma.movimentacao.findMany({
      where: { equipamento_id: parseInt(equipamento_id) },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            usuario_rede: true
          }
        }
      },
      orderBy: {
        data_movimentacao: 'desc'
      }
    });

    return movimentacoes;
  },

  // Movimentações feitas por um usuário
  async listarPorUsuario(usuario_id) {
    const movimentacoes = await prisma.movimentacao.findMany({
      where: { usuario_id: parseInt(usuario_id) },
      include: {
        equipamento: {
          select: {
            id: true,
            patrimonio: true,
            nome: true,
            modelo: true,
            numero_serie: true
          }
        }
      },
      orderBy: {
        data_movimentacao: 'desc'
      }
    });

    return movimentacoes;
  }
};

module.exports = movimentacaoService;
```

**💡 Conceitos importantes:**

- **Atualização automática de status**: Quando cria uma ENTRADA, o equipamento fica `NO_DEPOSITO`. Quando cria uma SAIDA, fica `FORA_DEPOSITO`.
- **Filtros dinâmicos**: Monta o objeto `where` dinamicamente baseado nos filtros recebidos
- **`include`**: Retorna dados relacionados (equipamento e usuário) junto com a movimentação

---

### Controller (Manipulador HTTP)

**Arquivo:** `backend/src/controllers/movimentacaoController.js`

```javascript
const movimentacaoService = require('../services/movimentacaoService');

const movimentacaoController = {
  // POST /api/movimentacoes
  async criar(req, res) {
    try {
      const movimentacao = await movimentacaoService.criar(req.body);
      return res.status(201).json(movimentacao);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  // GET /api/movimentacoes?tipo=ENTRADA&equipamento_id=1
  async listar(req, res) {
    try {
      const filtros = {
        equipamento_id: req.query.equipamento_id,
        tipo: req.query.tipo,
        usuario_id: req.query.usuario_id,
        data_inicio: req.query.data_inicio,
        data_fim: req.query.data_fim
      };

      const movimentacoes = await movimentacaoService.listar(filtros);
      return res.status(200).json(movimentacoes);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // GET /api/movimentacoes/:id
  async buscarPorId(req, res) {
    try {
      const movimentacao = await movimentacaoService.buscarPorId(req.params.id);
      return res.status(200).json(movimentacao);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  },

  // GET /api/movimentacoes/equipamento/:equipamento_id
  async listarPorEquipamento(req, res) {
    try {
      const movimentacoes = await movimentacaoService.listarPorEquipamento(req.params.equipamento_id);
      return res.status(200).json(movimentacoes);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // GET /api/movimentacoes/usuario/:usuario_id
  async listarPorUsuario(req, res) {
    try {
      const movimentacoes = await movimentacaoService.listarPorUsuario(req.params.usuario_id);
      return res.status(200).json(movimentacoes);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};

module.exports = movimentacaoController;
```

**💡 Query Params vs Route Params:**
- **Route Params** (`req.params.id`): Valores na URL `/api/movimentacoes/5` → id = 5
- **Query Params** (`req.query.tipo`): Valores após `?` → `/api/movimentacoes?tipo=ENTRADA` → tipo = "ENTRADA"

---

### Routes (Definição de Endpoints)

**Arquivo:** `backend/src/routes/movimentacaoRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const movimentacaoController = require('../controllers/movimentacaoController');

// POST /api/movimentacoes - Criar movimentação
router.post('/', movimentacaoController.criar);

// GET /api/movimentacoes - Listar com filtros opcionais
router.get('/', movimentacaoController.listar);

// GET /api/movimentacoes/:id - Buscar por ID
router.get('/:id', movimentacaoController.buscarPorId);

// GET /api/movimentacoes/equipamento/:equipamento_id - Histórico do equipamento
router.get('/equipamento/:equipamento_id', movimentacaoController.listarPorEquipamento);

// GET /api/movimentacoes/usuario/:usuario_id - Movimentações do usuário
router.get('/usuario/:usuario_id', movimentacaoController.listarPorUsuario);

module.exports = router;
```

**Arquivo:** `backend/src/routes/index.js` (registrar as rotas)

```javascript
const movimentacaoRoutes = require('./movimentacaoRoutes');

router.use('/movimentacoes', movimentacaoRoutes);
```

---

## Endpoints da API

### 1️⃣ Criar Movimentação

**POST** `/api/movimentacoes`

**Request Body:**
```json
{
  "equipamento_id": 1,
  "tipo": "SAIDA",
  "usuario_id": 2,
  "observacao": "Equipamento enviado para manutenção",
  "data_movimentacao": "2024-01-15T10:30:00"
}
```

**Campos:**
- `equipamento_id` (**obrigatório**): ID do equipamento
- `tipo` (**obrigatório**): `ENTRADA` ou `SAIDA`
- `usuario_id` (**obrigatório**): ID do usuário
- `observacao` (opcional): Texto livre
- `data_movimentacao` (opcional): Data customizada (padrão: agora)

**Response (201):**
```json
{
  "id": 15,
  "equipamento_id": 1,
  "tipo": "SAIDA",
  "data_movimentacao": "2024-01-15T10:30:00.000Z",
  "usuario_id": 2,
  "observacao": "Equipamento enviado para manutenção",
  "created_at": "2024-01-15T13:30:00.000Z",
  "equipamento": {
    "id": 1,
    "patrimonio": "PAT-001",
    "nome": "Notebook Dell",
    "modelo": "Inspiron 15",
    "numero_serie": "SN123456"
  },
  "usuario": {
    "id": 2,
    "nome": "João Silva",
    "usuario_rede": "joao.silva"
  }
}
```

**⚠️ Efeito Colateral:** O status do equipamento foi alterado para `FORA_DEPOSITO` automaticamente!

**Exemplo curl:**
```bash
curl -X POST http://localhost:3000/api/movimentacoes \
  -H "Content-Type: application/json" \
  -d '{
    "equipamento_id": 1,
    "tipo": "SAIDA",
    "usuario_id": 2,
    "observacao": "Equipamento enviado para manutenção"
  }'
```

---

### 2️⃣ Listar Movimentações (com filtros)

**GET** `/api/movimentacoes`

**Query Params (todos opcionais):**
- `equipamento_id`: Filtrar por equipamento
- `tipo`: `ENTRADA` ou `SAIDA`
- `usuario_id`: Filtrar por usuário
- `data_inicio`: Data inicial (ISO 8601)
- `data_fim`: Data final (ISO 8601)

**Exemplos:**

```bash
# Todas as movimentações
curl http://localhost:3000/api/movimentacoes

# Apenas SAÍDAS
curl http://localhost:3000/api/movimentacoes?tipo=SAIDA

# Movimentações de um equipamento
curl http://localhost:3000/api/movimentacoes?equipamento_id=1

# Movimentações em um período
curl "http://localhost:3000/api/movimentacoes?data_inicio=2024-01-01&data_fim=2024-01-31"

# Combinando filtros
curl "http://localhost:3000/api/movimentacoes?tipo=ENTRADA&usuario_id=2"
```

**Response (200):**
```json
[
  {
    "id": 15,
    "equipamento_id": 1,
    "tipo": "SAIDA",
    "data_movimentacao": "2024-01-15T10:30:00.000Z",
    "usuario_id": 2,
    "observacao": "Equipamento enviado para manutenção",
    "created_at": "2024-01-15T13:30:00.000Z",
    "equipamento": {
      "id": 1,
      "patrimonio": "PAT-001",
      "nome": "Notebook Dell",
      "modelo": "Inspiron 15",
      "numero_serie": "SN123456"
    },
    "usuario": {
      "id": 2,
      "nome": "João Silva",
      "usuario_rede": "joao.silva"
    }
  }
]
```

---

### 3️⃣ Buscar Movimentação por ID

**GET** `/api/movimentacoes/:id`

**Exemplo:**
```bash
curl http://localhost:3000/api/movimentacoes/15
```

**Response (200):** Mesma estrutura do criar

---

### 4️⃣ Histórico de um Equipamento

**GET** `/api/movimentacoes/equipamento/:equipamento_id`

Retorna **todas as movimentações** (ENTRADA e SAIDA) de um equipamento específico, ordenadas da mais recente para a mais antiga.

**Exemplo:**
```bash
curl http://localhost:3000/api/movimentacoes/equipamento/1
```

**Response (200):**
```json
[
  {
    "id": 20,
    "equipamento_id": 1,
    "tipo": "ENTRADA",
    "data_movimentacao": "2024-01-20T14:00:00.000Z",
    "usuario_id": 3,
    "observacao": "Retornou da manutenção",
    "created_at": "2024-01-20T14:00:00.000Z",
    "usuario": {
      "id": 3,
      "nome": "Maria Santos",
      "usuario_rede": "maria.santos"
    }
  },
  {
    "id": 15,
    "equipamento_id": 1,
    "tipo": "SAIDA",
    "data_movimentacao": "2024-01-15T10:30:00.000Z",
    "usuario_id": 2,
    "observacao": "Equipamento enviado para manutenção",
    "created_at": "2024-01-15T13:30:00.000Z",
    "usuario": {
      "id": 2,
      "nome": "João Silva",
      "usuario_rede": "joao.silva"
    }
  }
]
```

---

### 5️⃣ Movimentações de um Usuário

**GET** `/api/movimentacoes/usuario/:usuario_id`

Retorna todas as movimentações feitas por um usuário específico.

**Exemplo:**
```bash
curl http://localhost:3000/api/movimentacoes/usuario/2
```

**Response (200):**
```json
[
  {
    "id": 15,
    "equipamento_id": 1,
    "tipo": "SAIDA",
    "data_movimentacao": "2024-01-15T10:30:00.000Z",
    "usuario_id": 2,
    "observacao": "Equipamento enviado para manutenção",
    "created_at": "2024-01-15T13:30:00.000Z",
    "equipamento": {
      "id": 1,
      "patrimonio": "PAT-001",
      "nome": "Notebook Dell",
      "modelo": "Inspiron 15",
      "numero_serie": "SN123456"
    }
  }
]
```

---

## Exemplos de Uso

### Cenário 1: Registrar saída de equipamento

```bash
# 1. Equipamento saiu do depósito
curl -X POST http://localhost:3000/api/movimentacoes \
  -H "Content-Type: application/json" \
  -d '{
    "equipamento_id": 5,
    "tipo": "SAIDA",
    "usuario_id": 1,
    "observacao": "Emprestado para departamento de TI"
  }'

# ✅ Resultado: Movimentação criada + Status do equipamento alterado para FORA_DEPOSITO
```

### Cenário 2: Registrar retorno de equipamento

```bash
# 2. Equipamento voltou para o depósito
curl -X POST http://localhost:3000/api/movimentacoes \
  -H "Content-Type: application/json" \
  -d '{
    "equipamento_id": 5,
    "tipo": "ENTRADA",
    "usuario_id": 1,
    "observacao": "Devolvido pelo departamento de TI"
  }'

# ✅ Resultado: Movimentação criada + Status do equipamento alterado para NO_DEPOSITO
```

### Cenário 3: Ver histórico completo de um equipamento

```bash
# Ver todas as movimentações do equipamento 5
curl http://localhost:3000/api/movimentacoes/equipamento/5
```

### Cenário 4: Relatório mensal de movimentações

```bash
# Ver todas as movimentações de janeiro de 2024
curl "http://localhost:3000/api/movimentacoes?data_inicio=2024-01-01&data_fim=2024-01-31"
```

---

## 🔑 Regras de Negócio Importantes

1. **Atualização automática de status:**
   - `ENTRADA` → Equipamento fica `NO_DEPOSITO`
   - `SAIDA` → Equipamento fica `FORA_DEPOSITO`

2. **Validações:**
   - Equipamento e usuário devem existir
   - Tipo deve ser exatamente `ENTRADA` ou `SAIDA`
   - IDs devem ser números válidos

3. **Timestamps:**
   - `data_movimentacao`: Quando ocorreu a movimentação (pode ser customizada)
   - `created_at`: Quando o registro foi criado no banco

4. **Observações:**
   - Campo opcional para adicionar contexto à movimentação
   - Útil para rastreabilidade e auditoria

---

## ✅ Checklist de Implementação

- [x] Model no Prisma schema
- [x] Service com lógica de negócio
- [x] Controller para manipular HTTP
- [x] Routes definidas
- [x] Rotas registradas no index
- [x] Atualização automática de status do equipamento
- [x] Filtros implementados

---

## 🚀 Próximos Passos

- Adicionar autenticação JWT para saber qual usuário está logado
- Implementar paginação para listas grandes
- Criar relatórios de movimentações por período
- Adicionar validação de regras de negócio (ex: não permitir SAIDA de equipamento já FORA_DEPOSITO)
