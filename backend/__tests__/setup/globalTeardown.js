const prisma = require('../../src/models/prisma');

module.exports = async () => {
  console.log('\n🧹 Global Teardown: Limpando ambiente de testes...\n');

  try {
    // Desconectar do banco de dados
    await prisma.$disconnect();
    console.log('✅ Desconectado do banco de dados com sucesso!\n');
  } catch (error) {
    console.error('❌ Erro ao desconectar do banco:', error.message);
    throw error;
  }
};
