# 🌱 Guia de Uso do Seed - Controle de Estoque

## 📝 Descrição

Este arquivo de seed permite gerar dados de teste em massa para testar a robustez e performance da aplicação de controle de estoque.

## ⚙️ Configuração

Abra o arquivo `seed.js` e ajuste as constantes no início do arquivo conforme necessário:

```javascript
// ========================================
// CONFIGURAÇÃO DE QUANTIDADE DE REGISTROS
// ========================================
const USUARIOS = 1000;        // Quantidade de usuários (além do admin)
const EQUIPAMENTOS = 10000;    // Quantidade de equipamentos
const MOVIMENTACOES = 10000;   // Quantidade de movimentações
// ========================================
```

## 📊 Cenários de Teste

### Teste Pequeno (Desenvolvimento)
```javascript
const USUARIOS = 100;
const EQUIPAMENTOS = 1000;
const MOVIMENTACOES = 2000;
```
⏱️ Tempo estimado: ~30 segundos

### Teste Médio (Homologação)
```javascript
const USUARIOS = 1000;
const EQUIPAMENTOS = 10000;
const MOVIMENTACOES = 20000;
```
⏱️ Tempo estimado: ~5-10 minutos

### Teste Grande (Produção Simulada)
```javascript
const USUARIOS = 10000;
const EQUIPAMENTOS = 100000;
const MOVIMENTACOES = 200000;
```
⏱️ Tempo estimado: ~30-60 minutos

## 🚀 Como Executar

No diretório `backend`, execute:

```bash
npx prisma db seed
```

ou

```bash
npm run seed
```

## 📦 O que será criado?

### Usuários
- **1 Administrador fixo**
  - Login: `admin`
  - Senha: `senha123`
  - Perfil: ADMIN
  
- **Usuários aleatórios** (quantidade configurável)
  - Nomes brasileiros realistas (faker pt_BR)
  - Logins únicos: `user_<número>_<username>`
  - Senha padrão: `senha123`
  - 10% admins, 90% usuários comuns
  - 95% ativos, 5% inativos

### Equipamentos
- **Tipos variados**: Desktop, Notebook, Monitor, Teclado, Mouse, Switch, Roteador, Servidor, Impressora, Scanner
- **Modelos realistas**: Dell, HP, Lenovo, etc.
- **Status distribuídos**:
  - 50% NO_DEPOSITO
  - 35% FORA_DEPOSITO (com local definido)
  - 15% DESCARTADO
- **Patrimônios sequenciais**: PAT-00010000, PAT-00010001, etc.
- **Números de série únicos**: Prefixo do tipo + 8 caracteres alfanuméricos
- **Datas de cadastro**: Distribuídas ao longo do último ano

### Movimentações
- **Tipos**: 50% ENTRADA, 50% SAIDA
- **Datas**: Distribuídas ao longo dos últimos 180 dias
- **Observações variadas**: Manutenção, transferência, empréstimo, etc.
- **Vinculação aleatória** com equipamentos e usuários existentes

## 📈 Logs de Progresso

O seed exibe logs detalhados durante a execução:

```
==========================================
🚀 INICIANDO SEED DO BANCO DE DADOS
==========================================
📊 Configuração:
   - Usuários: 1000 + 1 admin
   - Equipamentos: 10000
   - Movimentações: 10000
==========================================

🔄 Criando 1 admin + 1000 usuários...
✅ Admin criado - Login: admin | Senha: senha123
   📝 100/1000 usuários criados...
   📝 200/1000 usuários criados...
   ...

🔄 Criando 10000 equipamentos...
   📦 1000/10000 equipamentos criados...
   📦 2000/10000 equipamentos criados...
   ...

🔄 Criando 10000 movimentações...
   🔄 1000/10000 movimentações criadas...
   ...

==========================================
✅ SEED CONCLUÍDO COM SUCESSO!
==========================================
⏱️  Tempo de execução: 305.42 segundos
👥 Total de usuários: 1001
📦 Total de equipamentos: 10000
🔄 Total de movimentações: 10000
==========================================

🔐 Credenciais do Admin:
   Login: admin
   Senha: senha123
==========================================
```

## ⚠️ Avisos Importantes

1. **Backup**: Faça backup do banco antes de executar o seed
2. **Limpeza**: O seed APAGA todos os dados existentes antes de criar novos
3. **Performance**: Para volumes muito grandes (>100k registros), execute em um ambiente com bom processamento
4. **Memória**: Certifique-se de ter memória RAM suficiente
5. **Credenciais**: O admin sempre terá login `admin` e senha `senha123`

## 🔧 Troubleshooting

### Erro de timeout
Se ocorrer timeout, reduza a quantidade de registros ou ajuste o timeout do Prisma:

```javascript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['error', 'warn'],
});
```

### Memória insuficiente
Reduza o `batchSize` nas funções de criação ou diminua a quantidade total de registros.

### Banco muito lento
Considere criar índices adicionais nas tabelas antes de executar o seed com grandes volumes.

## ✅ Validação dos Dados

Após executar o seed, você pode validar os dados:

```sql
-- Contar registros
SELECT COUNT(*) FROM Usuario;
SELECT COUNT(*) FROM Equipamento;
SELECT COUNT(*) FROM Movimentacao;

-- Verificar admin
SELECT * FROM Usuario WHERE usuario_rede = 'admin';

-- Distribuição de status
SELECT status, COUNT(*) FROM Equipamento GROUP BY status;

-- Movimentações por tipo
SELECT tipo, COUNT(*) FROM Movimentacao GROUP BY tipo;
```
