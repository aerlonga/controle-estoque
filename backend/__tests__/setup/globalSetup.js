require('dotenv').config({ path: '.env.test' });
const { execSync } = require('child_process');

module.exports = async () => {
  console.log('\n🔧 Global Setup: Preparando ambiente de testes...\n');

  try {
    // Aplicar migrations do Prisma no banco de testes
    console.log('📦 Aplicando migrations do Prisma...');
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      stdio: 'inherit'
    });

    console.log('✅ Ambiente de testes preparado com sucesso!\n');
  } catch (error) {
    console.error('❌ Erro ao preparar ambiente de testes:', error.message);
    throw error;
  }
};
