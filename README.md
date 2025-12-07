# Sistema de Controle de Estoque

API para gerenciamento de equipamentos em depósito com rastreamento de movimentações.

## 🚀 Tecnologias

- **Node.js 22** + Express
- **PostgreSQL 15**
- **Prisma ORM**
- **Docker** + Docker Compose

## 📋 Pré-requisitos

- Docker
- Docker Compose

## 🐳 Executando com Docker

### Primeira execução (build + inicialização):

```bash
docker compose up -d --build
```

### Execuções seguintes:

```bash
docker compose up -d
```

### Parar os containers:

```bash
docker compose down
```

### Ver logs:

```bash
# Todos os serviços
docker compose logs -f

# Apenas backend
docker compose logs -f backend

# Apenas postgres
docker compose logs -f postgres
```

## 📦 O que o Docker faz automaticamente?

1. Cria container PostgreSQL na porta `5432`
2. Cria banco de dados `estoque`
3. Cria container Node.js na porta `3000`
4. Instala todas as dependências
5. Executa migrations do Prisma
6. Inicia a aplicação

## 🔧 Estrutura

```
controle-estoque/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   └── models/
│   │       └── prisma.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── package.json
└── docker-compose.yml
```

## 🗄️ Banco de Dados

### Acessar PostgreSQL:

```bash
docker compose exec postgres psql -U root -d estoque
```

### Ver tabelas:

```sql
\dt
```

### Estrutura das tabelas:

- `usuarios` - Usuários do sistema
- `equipamentos` - Equipamentos cadastrados
- `movimentacoes` - Histórico de entradas/saídas

## 🛠️ Desenvolvimento

### Executar comandos Prisma:

```bash
# Ver estrutura do banco
docker compose exec backend npx prisma studio

# Criar nova migration
docker compose exec backend npx prisma migrate dev --name nome_migration

# Gerar client Prisma
docker compose exec backend npx prisma generate
```

### Acessar container do backend:

```bash
docker compose exec backend sh
```

## 🌐 Endpoints

A aplicação estará disponível em: `http://localhost:3000`

Endpoint de teste:
- `GET /` - Retorna "Hello world!"

## 📝 Variáveis de Ambiente

As variáveis estão configuradas no `docker-compose.yml`:

- `DATABASE_URL` - String de conexão PostgreSQL
- `PORT` - Porta da aplicação (3000)

## 🔄 Reiniciar aplicação

```bash
docker compose restart backend
```

