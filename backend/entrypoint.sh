#!/bin/sh

# 1. Corrige as permissões da pasta /app para o usuário node
chown -R node:node /app

# 2. Verifica se as dependências precisam ser instaladas
if [ ! -f node_modules/package.json ]; then
    echo "Instalando dependências (isso pode demorar um pouco)..."
    # Executa o install como usuário node
    su node -c "npm install"
fi

# 3. Se for o backend, gera o prisma (opcional: mova migrations para cá também)
if [ -f "prisma/schema.prisma" ]; then
    echo "Gerando Prisma Client..."
    su node -c "npx prisma generate"
    echo "Aplicando migrações..."
    su node -c "npx prisma migrate deploy"
    
    echo "Populando banco de dados (Seed)..."
    su node -c "npm run seed"
fi

# 4. Executa o comando final
echo "Iniciando aplicação como usuário node..."
exec su node -s /bin/sh -c "$*"