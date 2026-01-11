FROM node:22-alpine

# 1. Instala o bash (necessário no Alpine se você quiser usá-lo no exec)
RUN apk add --no-cache bash

# 2. Define o diretório e garante que a pasta pertença ao usuário node
WORKDIR /app
RUN chown -R node:node /app

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# 3. Copia os arquivos de configuração com as permissões corretas
COPY --chown=node:node package*.json ./

# 4. Instala as dependências como usuário node
RUN npm ci

# 5. Copia o código da aplicação
COPY --chown=node:node . .

# Expõe a porta do Vite
EXPOSE 5173

# O ENTRYPOINT roda o nosso script de automação
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# 7. Inicia o servidor (o comando --host é essencial no Docker)
CMD ["npm", "run", "dev", "--", "--host"]
