FROM node:22

# 1. Instala OpenSSL necessário para o Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# 2. Define o diretório de trabalho e garante que a pasta pertença ao usuário node
WORKDIR /app
RUN chown -R node:node /app

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# 3. Copia os arquivos de dependência com as permissões corretas
COPY --chown=node:node package*.json ./

# 4. Instala dependências (roda como usuário node)
RUN npm ci

# 5. Copia o restante do código garantindo a posse do usuário node
COPY --chown=node:node . .

# Expõe a porta
EXPOSE 3000

# O ENTRYPOINT roda o nosso script de automação
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# 7. Script de inicialização
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run dev"]
