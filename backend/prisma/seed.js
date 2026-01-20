const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker/locale/pt_BR');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// ========================================
// PROTEÇÃO CONTRA EXECUÇÃO EM PRODUÇÃO
// ========================================
if (process.env.NODE_ENV === 'production') {
    console.error('\n❌❌❌ ERRO CRÍTICO ❌❌❌');
    console.error('==========================================');
    console.error('⛔ SEED NÃO PODE SER EXECUTADO EM PRODUÇÃO!');
    console.error('==========================================');
    console.error('Este script APAGA TODOS OS DADOS do banco');
    console.error('antes de criar dados de teste.');
    console.error('');
    console.error('Se você realmente precisa popular o banco');
    console.error('em produção, faça isso manualmente ou crie');
    console.error('um script específico para produção.');
    console.error('==========================================\n');
    process.exit(1);
}
// ========================================

// ========================================
// CONFIGURAÇÃO DE QUANTIDADE DE REGISTROS
// ========================================
// Ajuste estes valores conforme necessário:
// - Para teste pequeno: 100, 1000, 200
// - Para teste médio: 1000, 10000, 20000
// - Para teste grande: 10000, 100000, 200000
const USUARIOS = 1000;        // Quantidade de usuários (além do admin)
const EQUIPAMENTOS = 10000;    // Quantidade de equipamentos
const MOVIMENTACOES = 10000;   // Quantidade de movimentações
// ========================================


// Configurar faker para português do Brasil
faker.seed(123);


async function clearDatabase() {
    await prisma.historicoEquipamento.deleteMany({});
    await prisma.movimentacao.deleteMany({});
    await prisma.equipamento.deleteMany({});
    await prisma.tokenBlacklist.deleteMany({});
    await prisma.usuario.deleteMany({});
}

async function createUsers() {
    console.log(`🔄 Criando 1 admin + ${USUARIOS} usuários...`);
    const hashedPassword = await bcrypt.hash('senha123', 10);

    // Criar admin (mantém login "admin" e senha "senha123")
    const admin = await prisma.usuario.create({
        data: {
            nome: 'Administrador Sistema',
            usuario_rede: 'admin',
            senha_hash: hashedPassword,
            perfil: 'ADMIN',
            status_usuario: 1
        }
    });

    console.log('✅ Admin criado - Login: admin | Senha: senha123');

    const users = [admin];
    const batchSize = 100; // Criar em lotes para melhor performance

    for (let i = 0; i < USUARIOS; i++) {
        const user = await prisma.usuario.create({
            data: {
                nome: faker.person.fullName(),
                usuario_rede: `user_${i}_${faker.internet.username().toLowerCase()}`,
                senha_hash: hashedPassword,
                perfil: Math.random() > 0.9 ? 'ADMIN' : 'USUARIO', // 10% admins
                status_usuario: Math.random() > 0.05 ? 1 : 0 // 95% ativos
            }
        });
        users.push(user);

        // Log de progresso a cada 100 usuários
        if ((i + 1) % 100 === 0) {
            console.log(`   📝 ${i + 1}/${USUARIOS} usuários criados...`);
        }
    }

    console.log(`✅ Total de ${users.length} usuários criados (1 admin + ${USUARIOS} usuários)`);
    return users;
}

async function createEquipments(users) {
    console.log(`🔄 Criando ${EQUIPAMENTOS} equipamentos...`);

    const equipments = [];
    const tiposEquipamento = ['Desktop', 'Notebook', 'Monitor', 'Teclado', 'Mouse', 'Switch', 'Roteador', 'Servidor', 'Impressora', 'Scanner'];
    const modelos = {
        'Desktop': ['Dell OptiPlex 7090', 'HP EliteDesk 800 G6', 'Lenovo ThinkCentre M720', 'Dell Precision 3650'],
        'Notebook': ['Dell Latitude 5420', 'HP ProBook 450 G8', 'Lenovo ThinkPad E14', 'Acer Aspire 5', 'Dell Inspiron 15'],
        'Monitor': ['LG UltraWide 29"', 'Samsung 24"', 'Dell UltraSharp 27"', 'AOC 21.5"', 'Philips 23.8"'],
        'Teclado': ['Logitech K120', 'Microsoft Wired 600', 'Dell KB216', 'HP K1500'],
        'Mouse': ['Logitech M90', 'Microsoft Basic', 'Dell MS116', 'HP X500'],
        'Switch': ['TP-Link TL-SG1024', 'D-Link DGS-1016A', 'Cisco SG110-24'],
        'Roteador': ['TP-Link Archer C6', 'D-Link DIR-615', 'Asus RT-AC68U'],
        'Servidor': ['Dell PowerEdge R740', 'HP ProLiant DL380', 'Lenovo ThinkSystem SR650'],
        'Impressora': ['HP LaserJet Pro', 'Epson EcoTank', 'Brother HL-L2350DW'],
        'Scanner': ['Epson WorkForce ES-50', 'Canon imageFORMULA', 'Fujitsu ScanSnap']
    };

    for (let i = 0; i < EQUIPAMENTOS; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const tipoEquipamento = tiposEquipamento[Math.floor(Math.random() * tiposEquipamento.length)];
        const modelosDisponiveis = modelos[tipoEquipamento];
        const randomModel = modelosDisponiveis[Math.floor(Math.random() * modelosDisponiveis.length)];

        const serialNumber = `${tipoEquipamento.substring(0, 3).toUpperCase()}${faker.string.alphanumeric(8).toUpperCase()}`;

        const rand = Math.random();
        let status;
        if (rand < 0.5) status = 'NO_DEPOSITO';
        else if (rand < 0.85) status = 'FORA_DEPOSITO';
        else status = 'DESCARTADO';

        const equipment = await prisma.equipamento.create({
            data: {
                patrimonio: Math.random() > 0.2 ? `PAT-${String(10000 + i).padStart(8, '0')}` : null,
                nome: tipoEquipamento,
                modelo: randomModel,
                numero_serie: serialNumber,
                status: status,
                local: status === 'FORA_DEPOSITO' ? faker.helpers.arrayElement([
                    'Sala 101', 'Sala 102', 'Sala 103', 'Sala 201', 'Sala 202', 'Sala 203',
                    'Sala 301', 'Sala 302', 'Sala 303', 'Recepção', 'Diretoria', 'RH',
                    'TI', 'Financeiro', 'Comercial', 'Almoxarifado', 'CPD', 'Auditório'
                ]) : null,
                usuario_id: randomUser.id,
                created_at: faker.date.between({
                    from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 365 dias atrás
                    to: new Date()
                })
            }
        });

        equipments.push(equipment);

        // Log de progresso a cada 1000 equipamentos
        if ((i + 1) % 1000 === 0) {
            console.log(`   📦 ${i + 1}/${EQUIPAMENTOS} equipamentos criados...`);
        }
    }

    console.log(`✅ Total de ${equipments.length} equipamentos criados`);
    return equipments;
}

async function createMovements(equipments, users) {
    console.log(`🔄 Criando ${MOVIMENTACOES} movimentações...`);

    const movements = [];

    for (let i = 0; i < MOVIMENTACOES; i++) {
        const randomEquipment = equipments[Math.floor(Math.random() * equipments.length)];
        const randomUser = users[Math.floor(Math.random() * users.length)];

        const tipo = Math.random() > 0.5 ? 'ENTRADA' : 'SAIDA';

        const dataMovimentacao = faker.date.recent({ days: 180 });

        const observacoes = [
            'Equipamento devolvido após uso',
            'Transferência entre setores',
            'Manutenção preventiva',
            'Atualização de software',
            'Instalação em nova sala',
            'Retorno de empréstimo',
            'Manutenção corretiva',
            'Substituição de equipamento',
            'Troca de setor',
            'Empréstimo temporário',
            null,
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

        // Log de progresso a cada 1000 movimentações
        if ((i + 1) % 1000 === 0) {
            console.log(`   🔄 ${i + 1}/${MOVIMENTACOES} movimentações criadas...`);
        }
    }

    console.log(`✅ Total de ${movements.length} movimentações criadas`);
    return movements;
}

async function main() {
    console.log('==========================================');
    console.log('🚀 INICIANDO SEED DO BANCO DE DADOS');
    console.log('==========================================');
    console.log(`📊 Configuração:`);
    console.log(`   - Usuários: ${USUARIOS} + 1 admin`);
    console.log(`   - Equipamentos: ${EQUIPAMENTOS}`);
    console.log(`   - Movimentações: ${MOVIMENTACOES}`);
    console.log('==========================================\n');

    const startTime = Date.now();

    try {
        console.log('🗑️  Limpando banco de dados...');
        await clearDatabase();
        console.log('✅ Banco de dados limpo\n');

        const users = await createUsers();
        console.log('');

        const equipments = await createEquipments(users);
        console.log('');

        await createMovements(equipments, users);
        console.log('');

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        console.log('==========================================');
        console.log('✅ SEED CONCLUÍDO COM SUCESSO!');
        console.log('==========================================');
        console.log(`⏱️  Tempo de execução: ${duration} segundos`);
        console.log(`👥 Total de usuários: ${users.length}`);
        console.log(`📦 Total de equipamentos: ${equipments.length}`);
        console.log(`🔄 Total de movimentações: ${MOVIMENTACOES}`);
        console.log('==========================================');
        console.log('\n🔐 Credenciais do Admin:');
        console.log('   Login: admin');
        console.log('   Senha: senha123');
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
