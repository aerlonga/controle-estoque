const request = require('supertest');
const app = require('../../src/app');
const { clearDatabase, createTestUser, createTestEquipamento, createTestMovimentacao, generateToken, prisma } = require('../helpers/testHelper');

describe('Movimentacoes Routes - Integration Tests', () => {
  let authToken;
  let usuario;
  let equipamento;

  beforeEach(async () => {
    await clearDatabase();
    usuario = await createTestUser({
      nome: 'Usuario Teste',
      usuario_rede: 'test_user'
    });
    authToken = generateToken(usuario);
    equipamento = await createTestEquipamento(usuario.id, { status: 'NO_DEPOSITO' });
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  describe('POST /api/movimentacoes', () => {
    it('deve criar movimentação SAIDA e atualizar status do equipamento', async () => {
      // Act
      const response = await request(app)
        .post('/api/movimentacoes')
        .set('Cookie', [`token=${authToken}`])
        .send({
          equipamento_id: equipamento.id,
          tipo: 'SAIDA',
          observacao: 'Saída para manutenção'
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.tipo).toBe('SAIDA');
      expect(response.body.equipamento_id).toBe(equipamento.id);
      expect(response.body.usuario_id).toBe(usuario.id);
      expect(response.body.equipamento).toBeDefined();
      expect(response.body.usuario).toBeDefined();

      // Verificar que o equipamento mudou de status
      const equipamentoAtualizado = await prisma.equipamento.findUnique({
        where: { id: equipamento.id }
      });
      expect(equipamentoAtualizado.status).toBe('FORA_DEPOSITO');
    });

    it('deve criar movimentação ENTRADA e atualizar status do equipamento', async () => {
      // Arrange - primeiro fazer uma SAIDA
      await prisma.equipamento.update({
        where: { id: equipamento.id },
        data: { status: 'FORA_DEPOSITO' }
      });

      // Act
      const response = await request(app)
        .post('/api/movimentacoes')
        .set('Cookie', [`token=${authToken}`])
        .send({
          equipamento_id: equipamento.id,
          tipo: 'ENTRADA',
          observacao: 'Retorno de manutenção'
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.tipo).toBe('ENTRADA');

      // Verificar que o equipamento mudou de status
      const equipamentoAtualizado = await prisma.equipamento.findUnique({
        where: { id: equipamento.id }
      });
      expect(equipamentoAtualizado.status).toBe('NO_DEPOSITO');
    });

    it('deve retornar 401 sem autenticação', async () => {
      // Act
      const response = await request(app)
        .post('/api/movimentacoes')
        .send({
          equipamento_id: equipamento.id,
          tipo: 'SAIDA'
        });

      // Assert
      expect(response.status).toBe(401);
    });

    it('deve retornar 400 com validação de regra de negócio (SAIDA sem estar NO_DEPOSITO)', async () => {
      // Arrange - mudar equipamento para FORA_DEPOSITO
      await prisma.equipamento.update({
        where: { id: equipamento.id },
        data: { status: 'FORA_DEPOSITO' }
      });

      // Act
      const response = await request(app)
        .post('/api/movimentacoes')
        .set('Cookie', [`token=${authToken}`])
        .send({
          equipamento_id: equipamento.id,
          tipo: 'SAIDA'
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('NO_DEPOSITO');
    });

    it('deve retornar 400 com validação de regra de negócio (ENTRADA sem estar FORA_DEPOSITO)', async () => {
      // Equipamento já está NO_DEPOSITO

      // Act
      const response = await request(app)
        .post('/api/movimentacoes')
        .set('Cookie', [`token=${authToken}`])
        .send({
          equipamento_id: equipamento.id,
          tipo: 'ENTRADA'
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('FORA_DEPOSITO');
    });

    it('deve retornar 400 ao tentar movimentar equipamento DESCARTADO', async () => {
      // Arrange
      await prisma.equipamento.update({
        where: { id: equipamento.id },
        data: { status: 'DESCARTADO' }
      });

      // Act
      const response = await request(app)
        .post('/api/movimentacoes')
        .set('Cookie', [`token=${authToken}`])
        .send({
          equipamento_id: equipamento.id,
          tipo: 'SAIDA'
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('descartado');
    });

    it('deve retornar 400 com dados de validação inválidos', async () => {
      // Act
      const response = await request(app)
        .post('/api/movimentacoes')
        .set('Cookie', [`token=${authToken}`])
        .send({
          equipamento_id: equipamento.id,
          tipo: 'TIPO_INVALIDO' // Tipo inválido
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Erro de validação');
    });
  });

  describe('GET /api/movimentacoes', () => {
    beforeEach(async () => {
      // Criar algumas movimentações para teste
      await createTestMovimentacao(equipamento.id, usuario.id, { tipo: 'SAIDA' });
      
      const outroEquipamento = await createTestEquipamento(usuario.id, { status: 'NO_DEPOSITO' });
      await createTestMovimentacao(outroEquipamento.id, usuario.id, { tipo: 'SAIDA' });
    });

    it('deve listar movimentações com paginação', async () => {
      // Act
      const response = await request(app)
        .get('/api/movimentacoes')
        .set('Cookie', [`token=${authToken}`])
        .query({ page: 1, limit: 10 });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta).toBeDefined();
      expect(response.body.data[0].equipamento).toBeDefined();
      expect(response.body.data[0].usuario).toBeDefined();
    });

    it('deve filtrar por equipamento_id', async () => {
      // Act
      const response = await request(app)
        .get('/api/movimentacoes')
        .set('Cookie', [`token=${authToken}`])
        .query({ equipamento_id: equipamento.id });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.every(m => m.equipamento_id === equipamento.id)).toBe(true);
    });

    it('deve filtrar por tipo', async () => {
      // Arrange - criar uma ENTRADA
      await prisma.equipamento.update({
        where: { id: equipamento.id },
        data: { status: 'FORA_DEPOSITO' }
      });
      await createTestMovimentacao(equipamento.id, usuario.id, { tipo: 'ENTRADA' });

      // Act
      const response = await request(app)
        .get('/api/movimentacoes')
        .set('Cookie', [`token=${authToken}`])
        .query({ tipo: 'ENTRADA' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.every(m => m.tipo === 'ENTRADA')).toBe(true);
    });

    it('deve filtrar por usuario_id', async () => {
      // Arrange
      const outroUsuario = await createTestUser({ usuario_rede: 'outro_user' });
      const equipOutro = await createTestEquipamento(outroUsuario.id, { status: 'NO_DEPOSITO' });
      await createTestMovimentacao(equipOutro.id, outroUsuario.id);

      // Act
      const response = await request(app)
        .get('/api/movimentacoes')
        .set('Cookie', [`token=${authToken}`])
        .query({ usuario_id: usuario.id });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.every(m => m.usuario_id === usuario.id)).toBe(true);
    });
  });

  describe('GET /api/movimentacoes/:id', () => {
    it('deve retornar movimentação específica com relacionamentos', async () => {
      // Arrange
      const movimentacao = await createTestMovimentacao(equipamento.id, usuario.id);

      // Act
      const response = await request(app)
        .get(`/api/movimentacoes/${movimentacao.id}`)
        .set('Cookie', [`token=${authToken}`]);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(movimentacao.id);
      expect(response.body.equipamento).toBeDefined();
      expect(response.body.usuario).toBeDefined();
    });

    it('deve retornar 404 para ID inexistente', async () => {
      // Act
      const response = await request(app)
        .get('/api/movimentacoes/99999')
        .set('Cookie', [`token=${authToken}`]);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.error).toContain('não encontrada');
    });
  });

  describe('GET /api/movimentacoes/equipamento/:equipamento_id', () => {
    it('deve listar movimentações de um equipamento específico', async () => {
      // Arrange
      await createTestMovimentacao(equipamento.id, usuario.id);
      const outroEquipamento = await createTestEquipamento(usuario.id, { status: 'NO_DEPOSITO' });
      await createTestMovimentacao(outroEquipamento.id, usuario.id);

      // Act
      const response = await request(app)
        .get(`/api/movimentacoes/equipamento/${equipamento.id}`)
        .set('Cookie', [`token=${authToken}`]);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.every(m => m.equipamento_id === equipamento.id)).toBe(true);
    });
  });

  describe('GET /api/movimentacoes/usuario/:usuario_id', () => {
    it('deve listar movimentações de um usuário específico', async () => {
      // Arrange
      await createTestMovimentacao(equipamento.id, usuario.id);
      
      const outroUsuario = await createTestUser({ usuario_rede: 'outro' });
      const equipOutro = await createTestEquipamento(outroUsuario.id, { status: 'NO_DEPOSITO' });
      await createTestMovimentacao(equipOutro.id, outroUsuario.id);

      // Act
      const response = await request(app)
        .get(`/api/movimentacoes/usuario/${usuario.id}`)
        .set('Cookie', [`token=${authToken}`]);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.every(m => m.usuario_id === usuario.id)).toBe(true);
    });
  });
});
