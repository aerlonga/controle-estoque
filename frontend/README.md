# Frontend - Sistema de Controle de Estoque

Frontend React moderno para o sistema de controle de estoque, construído com Vite e as melhores práticas de 2026.

## 🚀 Stack Tecnológica

- **React 19** - Biblioteca UI
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **React Query (@tanstack/react-query)** - Gerenciamento de estado do servidor
- **React Router (@tanstack/react-router)** - Roteamento
- **Zustand** - Gerenciamento de estado global
- **Axios** - Cliente HTTP
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   ├── pages/          # Páginas da aplicação
│   │   └── Login.jsx   # Página de login
│   ├── services/       # Serviços de API
│   │   └── api.js      # Endpoints do backend
│   ├── store/          # Stores Zustand
│   │   └── authStore.js # Estado de autenticação
│   ├── lib/            # Configurações de bibliotecas
│   │   └── axios.js    # Configuração do Axios
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Funções utilitárias
│   ├── App.jsx         # Componente principal
│   ├── main.jsx        # Entry point
│   └── index.css       # Estilos globais (Tailwind)
├── public/             # Arquivos estáticos
├── .env.example        # Exemplo de variáveis de ambiente
├── tailwind.config.js  # Configuração do Tailwind
├── vite.config.js      # Configuração do Vite
└── package.json        # Dependências
```

## 🛠️ Instalação e Execução

### 1. Instalar dependências

```bash
cd frontend
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` se necessário (a URL padrão já aponta para `http://localhost:3000/api`).

### 3. Executar em modo desenvolvimento

```bash
npm run dev
```

O frontend estará disponível em: **http://localhost:5173**

### 4. Build para produção

```bash
npm run build
```

### 5. Preview do build de produção

```bash
npm run preview
```

## 🔐 Autenticação

O sistema usa **JWT (JSON Web Token)** para autenticação.

### Credenciais Padrão

- **Usuário:** `admin`
- **Senha:** `admin123`

### Como funciona

1. Usuário faz login com `usuario_rede` e `senha`
2. Backend retorna um token JWT
3. Token é armazenado no `localStorage` e no Zustand store
4. Axios interceptor adiciona o token automaticamente em todas as requisições
5. Se o token expirar (401), usuário é redirecionado para o login

## 📡 Serviços de API

Todos os serviços estão em `src/services/api.js`:

### Auth Service
- `login(usuario_rede, senha)` - Faz login

### Usuario Service
- `listar()` - Lista usuários ativos
- `buscarPorId(id)` - Busca usuário por ID
- `criar(dados)` - Cria novo usuário
- `atualizar(id, dados)` - Atualiza usuário
- `desativar(id)` - Desativa usuário

### Equipamento Service
- `listar()` - Lista equipamentos
- `buscarPorId(id)` - Busca equipamento por ID
- `criar(dados)` - Cria novo equipamento
- `atualizar(id, dados)` - Atualiza equipamento
- `descartar(id)` - Descarta equipamento

### Movimentacao Service
- `listar(filtros)` - Lista movimentações (com filtros opcionais)
- `buscarPorId(id)` - Busca movimentação por ID
- `criar(dados)` - Cria nova movimentação
- `listarPorEquipamento(equipamentoId)` - Histórico do equipamento
- `listarPorUsuario(usuarioId)` - Movimentações do usuário

## 🎨 Tailwind CSS

O projeto usa Tailwind CSS para estilização. Classes utilitárias podem ser usadas diretamente nos componentes.

Arquivo de configuração: `tailwind.config.js`

## 📦 Gerenciamento de Estado

### Zustand (Estado Global)

- **authStore** (`src/store/authStore.js`): Gerencia autenticação
  - `user`: Dados do usuário logado
  - `token`: Token JWT
  - `isAuthenticated`: Status de autenticação
  - `login(user, token)`: Função para fazer login
  - `logout()`: Função para fazer logout
  - `updateUser(user)`: Atualiza dados do usuário

### React Query (Estado do Servidor)

Usado para fazer cache e gerenciar requisições à API. Exemplo:

```jsx
import { useQuery } from '@tanstack/react-query';
import { equipamentoService } from '../services/api';

function Equipamentos() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['equipamentos'],
    queryFn: equipamentoService.listar,
  });

  // ...
}
```

## 🧩 Formulários com React Hook Form + Zod

Exemplo de uso:

```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  nome: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
});

function MeuFormulario() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('nome')} />
      {errors.nome && <span>{errors.nome.message}</span>}
      {/* ... */}
    </form>
  );
}
```

## 🌐 Conexão com Backend

O backend deve estar rodando em **http://localhost:3000**

Para iniciar o backend:

```bash
cd ../
docker compose up -d
```

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa o linter

## 🚧 Próximos Passos

- [ ] Implementar dashboard principal
- [ ] Criar páginas de CRUD de Usuários
- [ ] Criar páginas de CRUD de Equipamentos
- [ ] Criar páginas de CRUD de Movimentações
- [ ] Adicionar componentes shadcn/ui
- [ ] Implementar rotas com React Router
- [ ] Adicionar paginação e filtros
- [ ] Implementar gráficos e relatórios
- [ ] Adicionar testes (Vitest + React Testing Library)

## 🎯 Estrutura de Desenvolvimento Recomendada

1. **Componentes Pequenos e Reutilizáveis**: Crie componentes focados em uma única responsabilidade
2. **Custom Hooks**: Extraia lógica complexa para hooks customizados
3. **Validação com Zod**: Sempre valide dados de formulários
4. **React Query para API**: Use para todas as chamadas ao backend
5. **Zustand para Estado Global**: Use apenas para estado que precisa ser compartilhado

---

Desenvolvido com ⚛️ React e ⚡ Vite
