# 🔐 Autenticação JWT - Guia Completo

Este documento explica como funciona a **autenticação JWT** no sistema de controle de estoque.

## 📖 Índice
- [O que é JWT?](#o-que-é-jwt)
- [Como Funciona](#como-funciona)
- [Configuração](#configuração)
- [Fazendo Login](#fazendo-login)
- [Acessando Rotas Protegidas](#acessando-rotas-protegidas)
- [Exemplos de Uso](#exemplos-de-uso)
- [Tratamento de Erros](#tratamento-de-erros)

---

## O que é JWT?

**JWT (JSON Web Token)** é um padrão de autenticação que permite identificar usuários através de **tokens**.

### Como funciona o fluxo:

1. **Login**: Usuário envia `usuario_rede` e `senha`
2. **Servidor valida**: Verifica credenciais no banco de dados
3. **Token gerado**: Servidor cria um token JWT assinado
4. **Cliente armazena**: Token é guardado (localStorage, cookie, etc)
5. **Requisições futuras**: Cliente envia token no header `Authorization: Bearer <token>`
6. **Servidor valida token**: Verifica assinatura e decodifica dados do usuário

### Vantagens:
- ✅ Stateless (servidor não precisa guardar sessões)
- ✅ Seguro (assinado criptograficamente)
- ✅ Expira automaticamente
- ✅ Contém dados do usuário (id, nome, usuario_rede)

---

## Como Funciona

### Arquitetura

```
┌─────────────────┐
│  authService    │ → Lógica de login e validação de token
└─────────────────┘

┌─────────────────┐
│ authMiddleware  │ → Proteção de rotas (verifica token)
└─────────────────┘

┌─────────────────┐
│ authController  │ → Endpoint de login
└─────────────────┘

┌─────────────────┐
│  authRoutes     │ → Rota pública /api/auth/login
└─────────────────┘
```

### Rotas Públicas vs Protegidas

**Públicas (sem autenticação):**
- `POST /api/auth/login` - Login

**Protegidas (exigem JWT):**
- `POST /api/usuarios` - Criar usuário
- `GET /api/usuarios` - Listar usuários
- `GET /api/equipamentos` - Listar equipamentos
- `POST /api/movimentacoes` - Criar movimentação
- ...e todas as outras rotas

---

## Configuração

### Variáveis de Ambiente

Arquivo: `.env`

```bash
# Configurações JWT
JWT_SECRET=seu_secret_super_secreto_mude_em_producao_12345
JWT_EXPIRES_IN=8h
```

**Importante:**
- `JWT_SECRET`: Chave secreta para assinar tokens (use uma string forte e aleatória em produção!)
- `JWT_EXPIRES_IN`: Tempo de expiração do token (exemplos: `1h`, `8h`, `1d`, `7d`)

⚠️ **NUNCA compartilhe o JWT_SECRET publicamente!**

---

## Fazendo Login

### Endpoint: `POST /api/auth/login`

**Request Body:**
```json
{
  "usuario_rede": "joao.silva",
  "senha": "minhasenha123"
}
```

**Response (200 Success):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "João Silva",
    "usuario_rede": "joao.silva",
    "created_at": "2024-01-15T10:00:00.000Z"
  }
}
```

**Response (401 Unauthorized - Credenciais Inválidas):**
```json
{
  "error": "Credenciais inválidas"
}
```

**Response (401 Unauthorized - Usuário Desativado):**
```json
{
  "error": "Usuário desativado"
}
```

### Exemplo com curl:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_rede": "joao.silva",
    "senha": "minhasenha123"
  }'
```

### Exemplo com JavaScript (fetch):

```javascript
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    usuario_rede: 'joao.silva',
    senha: 'minhasenha123'
  })
});

const data = await response.json();

if (response.ok) {
  // Armazenar token
  localStorage.setItem('token', data.token);
  localStorage.setItem('usuario', JSON.stringify(data.usuario));
  
  console.log('Login bem-sucedido!');
} else {
  console.error('Erro:', data.error);
}
```

---

## Acessando Rotas Protegidas

Todas as rotas (exceto `/api/auth/login`) exigem o token JWT no header `Authorization`.

### Formato do Header:

```
Authorization: Bearer <seu_token_jwt>
```

### Exemplo com curl:

```bash
# Listar equipamentos (rota protegida)
curl http://localhost:3000/api/equipamentos \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Exemplo com JavaScript (fetch):

```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3000/api/equipamentos', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const equipamentos = await response.json();
```

---

## Exemplos de Uso

### 1️⃣ Fluxo Completo de Login e Uso

```bash
# 1. Fazer login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario_rede":"testuser","senha":"senha123"}' \
  | jq -r '.token')

echo "Token obtido: $TOKEN"

# 2. Listar equipamentos com o token
curl http://localhost:3000/api/equipamentos \
  -H "Authorization: Bearer $TOKEN"

# 3. Criar movimentação (usuario_id vem automaticamente do token!)
curl -X POST http://localhost:3000/api/movimentacoes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "equipamento_id": 1,
    "tipo": "SAIDA",
    "observacao": "Emprestado para TI"
  }'
```

**Nota:** Observe que **não precisamos mais enviar `usuario_id`** ao criar movimentação! O sistema pega automaticamente do usuário logado.

---

### 2️⃣ Criar Movimentação (Antes vs Depois)

**❌ ANTES (sem JWT):**
```bash
curl -X POST http://localhost:3000/api/movimentacoes \
  -H "Content-Type: application/json" \
  -d '{
    "equipamento_id": 1,
    "tipo": "SAIDA",
    "usuario_id": 2,  ← Tinha que passar manualmente
    "observacao": "Teste"
  }'
```

**✅ AGORA (com JWT):**
```bash
curl -X POST http://localhost:3000/api/movimentacoes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "equipamento_id": 1,
    "tipo": "SAIDA",
    "observacao": "Teste"
  }'
```

O `usuario_id` vem automaticamente do token! 🎉

---

## Tratamento de Erros

### 1. Token Não Fornecido

**Request:**
```bash
curl http://localhost:3000/api/equipamentos
```

**Response (401):**
```json
{
  "error": "Token não fornecido"
}
```

---

### 2. Token Mal Formatado

**Request:**
```bash
curl http://localhost:3000/api/equipamentos \
  -H "Authorization: InvalidFormat"
```

**Response (401):**
```json
{
  "error": "Token mal formatado"
}
```

**Formato correto:** `Authorization: Bearer <token>`

---

### 3. Token Inválido

**Request:**
```bash
curl http://localhost:3000/api/equipamentos \
  -H "Authorization: Bearer token.invalido.aqui"
```

**Response (401):**
```json
{
  "error": "Token inválido"
}
```

---

### 4. Token Expirado

Após o tempo definido em `JWT_EXPIRES_IN` (padrão: 8 horas), o token expira.

**Response (401):**
```json
{
  "error": "Token expirado"
}
```

**Solução:** Fazer login novamente para obter um novo token.

---

## 🔒 Segurança - Boas Práticas

### ✅ DO (Faça):
- Use HTTPS em produção
- Armazene tokens de forma segura (httpOnly cookies são mais seguros que localStorage)
- Use um `JWT_SECRET` forte e aleatório
- Configure tempo de expiração apropriado (não muito longo)
- Implemente refresh tokens para renovação automática
- Valide sempre o token no backend

### ❌ DON'T (Não Faça):
- Nunca compartilhe o `JWT_SECRET`
- Não armazene dados sensíveis no token (ele pode ser decodificado)
- Não use HTTP em produção (apenas HTTPS)
- Não aceite tokens expirados

---

## 🔑 Estrutura do Token JWT

Um token JWT tem 3 partes separadas por pontos:

```
header.payload.signature
```

### Exemplo decodificado:

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload (dados do usuário):**
```json
{
  "id": 1,
  "usuario_rede": "joao.silva",
  "nome": "João Silva",
  "iat": 1642251600,
  "exp": 1642280400
}
```

**Signature:** Assinatura criptográfica usando `JWT_SECRET`

⚠️ **Importante:** O payload NÃO é criptografado, apenas codificado (base64). Qualquer um pode decodificar. Por isso, **nunca coloque senhas ou dados sensíveis no token!**

---

## 📝 Resumo

| Aspecto | Detalhes |
|---------|----------|
| **Login** | `POST /api/auth/login` com `usuario_rede` e `senha` |
| **Token** | Retornado no campo `token` da resposta |
| **Usar Token** | Header `Authorization: Bearer <token>` |
| **Expiração** | Configurável via `JWT_EXPIRES_IN` (padrão: 8h) |
| **Rotas Públicas** | Apenas `/api/auth/login` |
| **Rotas Protegidas** | Todas as outras (`/usuarios`, `/equipamentos`, `/movimentacoes`) |
| **Usuario Automático** | `req.user.id` disponível em todas as rotas protegidas |

---

## 🚀 Próximos Passos

- Implementar **refresh tokens** para renovação automática
- Adicionar endpoint **logout** (blacklist de tokens)
- Implementar **recuperação de senha**
- Adicionar **roles/permissões** (admin, usuário comum, etc.)
- Criar middleware para verificar permissões específicas
