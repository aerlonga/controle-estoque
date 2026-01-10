const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker/locale/pt_BR');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Configurar faker para português do Brasil
faker.seed(123);

// Dados base para equipamentos
const equipmentTypes = [
    {
        type: 'Desktop',
        models: ['Dell OptiPlex 7090', 'HP EliteDesk 800 G6', 'Lenovo ThinkCentre M720', 'Dell Precision 3650'],
        count: 18
    },
    {
        type: 'Notebook',
        models: ['Dell Latitude 5420', 'HP ProBook 450 G8', 'Lenovo ThinkPad E14', 'Acer Aspire 5'],
        count: 20
    },
    {
        type: 'Monitor',
        models: ['LG UltraWide 29"', 'Samsung 24"', 'Dell UltraSharp 27"', 'AOC 21.5"', 'Philips 23.8"'],
        count: 25
    },
    {
        type: 'Teclado',
        models: ['Logitech K120', 'Microsoft Wired 600', 'Dell KB216', 'HP K1500'],
        count: 15
    },
    {
        type: 'Mouse',
        models: ['Logitech M90', 'Microsoft Basic', 'Dell MS116', 'HP X500'],
        count: 15
    },
    {
        type: 'Switch',
        models: ['TP-Link TL-SG1024', 'D-Link DGS-1016A', 'Cisco SG110-24'],
        count: 5
    },
    {
        type: 'Roteador',
        models: ['TP-Link Archer C6', 'D-Link DIR-615', 'Asus RT-AC68U'],
        count: 4
    }
];

async function clearDatabase() {
    await prisma.historicoEquipamento.deleteMany({});
    await prisma.movimentacao.deleteMany({});
    await prisma.equipamento.deleteMany({});
    await prisma.tokenBlacklist.deleteMany({});
    await prisma.usuario.deleteMany({});
}

async function createUsers() {
    const hashedPassword = await bcrypt.hash('senha123', 10);

    const admin = await prisma.usuario.create({
        data: {
            nome: 'Administrador Sistema',
            usuario_rede: 'admin',
            senha_hash: hashedPassword,
            perfil: 'ADMIN',
            status_usuario: 1
        }
    });

    const users = [];
    for (let i = 0; i < 5; i++) {
        const user = await prisma.usuario.create({
            data: {
                nome: faker.person.fullName(),
                usuario_rede: faker.internet.username().toLowerCase(),
                senha_hash: hashedPassword,
                perfil: 'USUARIO',
                status_usuario: 1
            }
        });
        users.push(user);
    }

    return [admin, ...users];
}

async function createEquipments(users) {

    const equipments = [];
    let totalCreated = 0;

    for (const equipType of equipmentTypes) {
        for (let i = 0; i < equipType.count; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomModel = equipType.models[Math.floor(Math.random() * equipType.models.length)];

            const serialNumber = `${equipType.type.substring(0, 3).toUpperCase()}${faker.string.alphanumeric(8).toUpperCase()}`;

            const rand = Math.random();
            let status;
            if (rand < 0.6) status = 'NO_DEPOSITO';
            else if (rand < 0.9) status = 'FORA_DEPOSITO';
            else status = 'DESCARTADO';

            const equipment = await prisma.equipamento.create({
                data: {
                    patrimonio: Math.random() > 0.3 ? `PAT-${faker.number.int({ min: 10000, max: 99999 })}` : null,
                    nome: equipType.type,
                    modelo: randomModel,
                    numero_serie: serialNumber,
                    status: status,
                    local: status === 'FORA_DEPOSITO' ? faker.helpers.arrayElement([
                        'Sala 101', 'Sala 202', 'Sala 305', 'Recepção',
                        'Diretoria', 'RH', 'TI', 'Financeiro', 'Comercial'
                    ]) : null,
                    usuario_id: randomUser.id,
                    created_at: faker.date.between({
                        from: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 180 dias atrás
                        to: new Date()
                    })
                }
            });

            equipments.push(equipment);
            totalCreated++;
        }
    }

    return equipments;
}

async function createMovements(equipments, users) {
    const movements = [];
    const movementCount = Math.floor(equipments.length * 2);

    for (let i = 0; i < movementCount; i++) {
        const randomEquipment = equipments[Math.floor(Math.random() * equipments.length)];
        const randomUser = users[Math.floor(Math.random() * users.length)];

        const tipo = Math.random() > 0.5 ? 'ENTRADA' : 'SAIDA';

        const dataMovimentacao = faker.date.recent({ days: 60 });

        const observacoes = [
            'Equipamento devolvido após uso',
            'Transferência entre setores',
            'Manutenção preventiva',
            'Atualização de software',
            'Instalação em nova sala',
            'Retorno de empréstimo',
            null,
            null
        ];

        const movement = await prisma.movimentacao.create({
            data: {
                equipamento_id: randomEquipment.id,
                tipo: tipo,
                data_movimentacao: dataMovimentacao,
                usuario_id: randomUser.id,
                observacao: faker.helpers.arrayElement(observacoes),
                created_at: dataMovimentacao
            }
        });

        movements.push(movement);
    }

    return movements;
}

async function main() {

    try {
        await clearDatabase();
        const users = await createUsers();
        const equipments = await createEquipments(users);
        await createMovements(equipments, users);

    } catch (error) {
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
