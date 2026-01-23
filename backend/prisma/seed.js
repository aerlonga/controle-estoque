const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('==========================================');
    console.log('🚀 INICIANDO SEED DO BANCO DE DADOS');
    console.log('==========================================');
    console.log('Este script cria apenas o usuário administrador padrão.');
    console.log('Para dados de teste, use: npm run seed:fake');
    console.log('==========================================\n');

    try {
        // Verificar se já existe um admin
        const adminExistente = await prisma.usuario.findUnique({
            where: { usuario_rede: 'admin' }
        });

        if (adminExistente) {
            console.log('⚠️  Usuário admin já existe no banco de dados.');
            console.log('   Abortando seed para evitar duplicatas.\n');
            console.log('🔐 Credenciais do Admin:');
            console.log('   Login: admin');
            console.log('   Senha: senha123');
            console.log('==========================================\n');
            return;
        }

        // Criar senha hash
        const hashedPassword = await bcrypt.hash('senha123', 10);

        // Criar admin
        const admin = await prisma.usuario.create({
            data: {
                nome: 'Administrador Sistema',
                usuario_rede: 'admin',
                senha_hash: hashedPassword,
                perfil: 'ADMIN',
                status_usuario: 1
            }
        });

        console.log('✅ Usuário administrador criado com sucesso!');
        console.log('==========================================');
        console.log('� Credenciais do Admin:');
        console.log('   Login: admin');
        console.log('   Senha: senha123');
        console.log('==========================================');
        console.log('\n� Dicas:');
        console.log('   - Use estas credenciais para fazer o primeiro login');
        console.log('   - Altere a senha após o primeiro acesso');
        console.log('   - Crie outros usuários através do sistema');
        console.log('   - Para dados de teste, execute: npm run seed:fake');
        console.log('==========================================\n');

    } catch (error) {
        console.error('\n❌ ERRO DURANTE O SEED:');
        console.error(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
