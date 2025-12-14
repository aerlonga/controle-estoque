const prisma = require('../../src/models/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Limpa todas as tabelas do banco de dados de teste
 * IMPORTANTE: Ordem de deleção respeita foreign keys
 */
async function clearDatabase() {
  // Deletar na ordem correta (dependentes primeiro)
  await prisma.movimentacao.deleteMany({});
  await prisma.tokenBlacklist.deleteMany({});
  await prisma.equipamento.deleteMany({});
  await prisma.usuario.deleteMany({});
}

/**
 * Cria um usuário de teste
 * @param {Object} dados - Dados do usuário (opcional)
 * @returns {Object} Usuário criado
 */
async function createTestUser(dados = {}) {
  const defaultData = {
    nome: 'Usuário Teste',
    usuario_rede: `user_${Date.now()}`,
    senha: 'senha123',
    status_usuario: 1
  };

  const userData = { ...defaultData, ...dados };
  const senhaHash = await bcrypt.hash(userData.senha, 10);

  const usuario = await prisma.usuario.create({
    data: {
      nome: userData.nome,
      usuario_rede: userData.usuario_rede,
      senha_hash: senhaHash,
      status_usuario: userData.status_usuario
    }
  });

  // Retorna usuário com senha original (não hash) para uso em testes
  return {
    ...usuario,
    senha: userData.senha
  };
}

/**
 * Gera um token JWT válido para testes
 * @param {Object} usuario - Dados do usuário
 * @returns {string} Token JWT
 */
function generateToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      usuario_rede: usuario.usuario_rede,
      nome: usuario.nome
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    }
  );
}

/**
 * Cria um equipamento de teste
 * @param {number} usuario_id - ID do usuário responsável
 * @param {Object} dados - Dados adicionais do equipamento
 * @returns {Object} Equipamento criado
 */
async function createTestEquipamento(usuario_id, dados = {}) {
  const defaultData = {
    nome: 'Notebook Dell',
    modelo: 'Latitude 5420',
    numero_serie: `SN${Date.now()}`,
    patrimonio: `PAT${Date.now()}`,
    status: 'NO_DEPOSITO',
    local: 'Depósito Central',
    usuario_id: usuario_id
  };

  const equipamentoData = { ...defaultData, ...dados };

  return await prisma.equipamento.create({
    data: equipamentoData,
    include: {
      usuario: {
        select: {
          id: true,
          nome: true,
          usuario_rede: true
        }
      }
    }
  });
}

/**
 * Cria uma movimentação de teste
 * @param {number} equipamento_id - ID do equipamento
 * @param {number} usuario_id - ID do usuário
 * @param {Object} dados - Dados adicionais da movimentação
 * @returns {Object} Movimentação criada
 */
async function createTestMovimentacao(equipamento_id, usuario_id, dados = {}) {
  const defaultData = {
    equipamento_id: equipamento_id,
    tipo: 'SAIDA',
    usuario_id: usuario_id,
    observacao: 'Movimentação de teste',
    data_movimentacao: new Date()
  };

  const movimentacaoData = { ...defaultData, ...dados };

  return await prisma.movimentacao.create({
    data: movimentacaoData,
    include: {
      equipamento: {
        select: {
          id: true,
          nome: true,
          modelo: true,
          numero_serie: true
        }
      },
      usuario: {
        select: {
          id: true,
          nome: true,
          usuario_rede: true
        }
      }
    }
  });
}

/**
 * Gera dados aleatórios para testes
 */
function generateRandomData() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);

  return {
    usuario_rede: `user_${timestamp}_${random}`,
    numero_serie: `SN${timestamp}${random}`,
    patrimonio: `PAT${timestamp}${random}`,
    email: `test${timestamp}@example.com`
  };
}

module.exports = {
  clearDatabase,
  createTestUser,
  generateToken,
  createTestEquipamento,
  createTestMovimentacao,
  generateRandomData,
  prisma
};
