#!/bin/sh

# 1. Corrige as permissões da pasta /app para o usuário node
chown -R node:node /app

# 2. Verifica se as dependências precisam ser instaladas
if [ ! -f node_modules/package.json ]; then
    echo "Instalando dependências (isso pode demorar um pouco)..."
    su node -c "npm install"
fi

# 3. Se for o backend, gera o prisma
if [ -f "prisma/schema.prisma" ]; then
    echo "Gerando Prisma Client..."
    su node -c "npx prisma generate"
fi

# 4. Executa o comando final como usuário node preservando os argumentos
echo "Iniciando aplicação como usuário node..."
exec su node -s /bin/sh -c "$*"