# Seed Scripts

Este projeto possui dois scripts de seed diferentes:

## 1. Seed de Produção (`seed.js`)

**Comando:** `npm run seed`

Este é o seed principal, adequado para ambientes de produção e desenvolvimento inicial. Ele:

- ✅ Cria apenas o usuário administrador padrão
- ✅ Não apaga dados existentes se o admin já existir
- ✅ É seguro para executar em produção (com as devidas precauções)
- ✅ Leve e rápido

**Credenciais criadas:**
- Login: `admin`
- Senha: `senha123`

**Uso:**
```bash
cd backend
npm run seed
```

## 2. Seed Fake (`seedFakes.js`)

**Comando:** `npm run seed:fake`

Este seed é destinado apenas para desenvolvimento e testes. Ele:

- ⚠️ **APAGA TODOS OS DADOS** do banco antes de executar
- 🔒 **BLOQUEADO EM PRODUÇÃO** (NODE_ENV=production)
- 📊 Gera grandes volumes de dados falsos para testes
- 🎲 Usa Faker.js para criar dados realistas

**Dados gerados:**
- 1 Admin + 1.000 usuários (configurável)
- 10.000 equipamentos (configurável)
- 10.000 movimentações (configurável)

**Regras aplicadas:**
- **Patrimônio:** Apenas números (ex: `00010000`, `00010001`)
- **Número de Série:** Alfanumérico (ex: `DES45A7B2C9D`, `NOT12XYZ789`)

**Configuração:**
Edite as constantes no topo do arquivo `seedFakes.js`:
```javascript
const USUARIOS = 1000;        // Quantidade de usuários
const EQUIPAMENTOS = 10000;    // Quantidade de equipamentos
const MOVIMENTACOES = 10000;   // Quantidade de movimentações
```

**Uso:**
```bash
cd backend
npm run seed:fake
```

## Validações de Campos

### Patrimônio
- ✅ Apenas números são aceitos
- ❌ Letras, hífens ou outros caracteres são rejeitados
- Exemplos válidos: `12345`, `00010000`
- Exemplos inválidos: `PAT-12345`, `ABC123`

### Número de Série
- ✅ Alfanumérico (letras e números)
- ✅ Pode conter maiúsculas e minúsculas
- Exemplos válidos: `SN123456`, `DES45A7B2C9D`, `ABC123XYZ`

## Recomendações

1. **Desenvolvimento Local:** Use `npm run seed:fake` para ter dados de teste
2. **Primeira Instalação:** Use `npm run seed` para criar apenas o admin
3. **Produção:** Use `npm run seed` com cautela, ou crie usuários manualmente
4. **Testes Automatizados:** Os testes já possuem seus próprios seeds

## Exemplo de Workflow

```bash
# Primeira vez configurando o projeto
npm run seed

# Para desenvolvimento com dados de teste
npm run seed:fake

# Para resetar e gerar novos dados de teste
npm run seed:fake
```
