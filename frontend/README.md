# Frontend - Sistema de Controle de Estoque

Frontend moderno para o sistema de controle de estoque, desenvolvido com React e Vite.

## 🚀 Tecnologias

- **React 19**
- **Vite**
- **Material UI (MUI)**
- **Tailwind CSS**
- **React Query** & **Zustand**
- **React Hook Form** + **Zod**

## 🛠️ Como Rodar (Desenvolvimento Local)

### 1. Instalação

```bash
cd frontend
npm install
```

### 2. Configuração

Copie o arquivo de exemplo de variáveis de ambiente:

```bash
cp .env.example .env
```

Verifique se a variável `VITE_API_URL` aponta para o seu backend (padrão: `http://localhost:3000/api`).

### 3. Execução

```bash
npm run dev
```
A aplicação estará disponível em: http://localhost:5173

## 🐳 Execução via Docker

O frontend também é executado automaticamente via Docker Compose na raiz do projeto.
Veja o `README.md` principal para instruções completas.

## 📁 Estrutura

- `src/components`: Componentes reutilizáveis
- `src/pages`: Páginas da aplicação
- `src/services`: Integração com API (Axios)
- `src/store`: Gerenciamento de estado (Zustand)
- `src/hooks`: Custom Hooks
