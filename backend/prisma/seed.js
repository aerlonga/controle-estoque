const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const usuariosExistentes = await prisma.usuario.count();

    if (usuariosExistentes > 0) {
        console.log('Já existem usuários no banco de dados. Seed cancelado.');
        return;
    }

    const senhaHash = await bcrypt.hash('admin123', 10);

    const admin = await prisma.usuario.create({
        data: {
            nome: 'Administrador',
            usuario_rede: 'admin',
            senha_hash: senhaHash,
            status_usuario: 1
        }
    });
}

main()
    .catch((e) => {
        console.error('Erro ao executar seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
