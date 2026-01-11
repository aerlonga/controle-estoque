# Sistema de Controle de Estoque

Aplicação Full-stack para gerenciamento de equipamentos e inventário, com autenticação e relatórios.

## 🚀 Tecnologias

- **Frontend**: React + Vite + Material UI (MUI)
- **Backend**: Node.js 22 + Express
- **Banco de Dados**: PostgreSQL 15
- **ORM**: Prisma
- **Infraestrutura**: Docker + Docker Compose

---

## 📋 Pré-requisitos

Para rodar o projeto da maneira mais fácil, você precisa apenas de:

- **Docker**
- **Docker Compose**

---

## 🐳 Como Rodar o Projeto (Docker)

Esta é a maneira recomendada, pois configura automaticamente todo o ambiente (Banco de Dados, Backend e Frontend).

**Nota:** Ao usar Docker, **NÃO** é necessário instalar o Node.js nem rodar `npm install` na sua máquina. O Docker cuida de tudo.

### 1. Configure as Variáveis de Ambiente
Na raiz do projeto, existe um arquivo `env.example`. Copie-o ou renomeie para `.env` e ajuste as configurações conforme sua preferência.

```ini
# .env (na raiz do projeto)
POSTGRES_USER=seu_usuario
POSTGRES_PASSWORD=sua_senha_segura
POSTGRES_DB=estoque

PORT=3000
DATABASE_URL=postgresql://seu_usuario:sua_senha_segura@postgres:5432/estoque?schema=public

JWT_SECRET=seu_segredo_jwt_super_seguro
JWT_EXPIRES_IN=7d
```

### 2. Suba os Containers
Este comando irá baixar as imagens, construir o projeto, instalar as dependências automaticamente e iniciar tudo.

```bash
docker-compose up -d --build
```
> **Nota:** Se você alterar as credenciais no `.env` após já ter rodado o projeto uma vez, será necessário limpar os volumes antigos para que o banco seja recriado com a nova senha:
> `docker-compose down -v`

### 3. Popule o Banco de Dados (Opcional)
Se quiser criar usuários e dados iniciais para teste:

```bash
docker exec -it estoque-backend npm run seed
```

### 4. Acesse a Aplicação
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Como Rodar Manualmente (Sem Docker)

Se preferir rodar localmente (ex: para debugar), você precisará instalar o Node.js e ter um PostgreSQL rodando.

### Backend

1. Entre na pasta: `cd backend`
2. Crie o arquivo `.env` baseado no `.env.example`:
   ```bash
   cp .env.example .env
   ```
   > **Atenção:** No `.env` local do backend, o `DATABASE_URL` deve apontar para o host do seu banco (geralmente `localhost`) em vez de `postgres`.
3. Instale as dependências: `npm install`
4. Rode as migrations: `npx prisma migrate dev`
5. Inicie o servidor: `npm run dev`

### Frontend

1. Entre na pasta: `cd frontend`
2. Crie o arquivo `.env`:
   ```bash
   cp .env.example .env
   ```
3. Instale as dependências: `npm install`
4. Inicie o projeto: `npm run dev`

---

## 📚 Comandos Úteis

### Ver logs em tempo real
```bash
docker-compose logs -f
```

### Acessar o Banco de Dados via Terminal
```bash
docker exec -it estoque-postgres psql -U <seu_usuario_postgres> -d estoque
```

### Parar Tudo
```bash
docker-compose down
```
