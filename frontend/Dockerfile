FROM node:22-alpine

WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala dependências
RUN npm ci

# Copia o código da aplicação
COPY . .

# Expõe a porta do Vite
EXPOSE 5173

# Inicia o servidor de desenvolvimento
CMD ["npm", "run", "dev", "--", "--host"]
