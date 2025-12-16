FROM node:22

# Instala OpenSSL necessário para o Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala dependências
RUN npm ci

# Copia o código da aplicação
COPY . .

# Expõe a porta
EXPOSE 3000

# Script de inicialização (gera client, roda migrations e inicia app)
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm start"]
