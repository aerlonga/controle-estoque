const request = require('supertest');
const app = require('../../src/app');
const { clearDatabase, createTestUser, createTestEquipamento, generateToken, generateRandomData, prisma } = require('../helpers/testHelper');

describe('Equipamentos Routes - Integration Tests', () => {
  let authToken;
  let usuario;

  beforeEach(async () => {
    await clearDatabase();
    usuario = await createTestUser({
      nome: 'Usuario Teste',
      usuario_rede: 'test_user'
    });
    authToken = generateToken(usuario);
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  describe('POST /api/equipamentos', () => {
    it('deve criar equipamento com dados válidos', async () => {
      // Arrange
      const random = generateRandomData();

      // Act
      const response = await request(app)
        .post('/api/equipamentos')
        .set('Cookie', [`token=${authToken}`])
        .send({
          nome: 'Notebook Dell',
          modelo: 'Latitude 5420',
          numero_serie: random.numero_serie,
          patrimonio: random.patrimonio,
          local: 'Depósito Central',
          usuario_id: usuario.id
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.nome).toBe('Notebook Dell');
      expect(response.body.status).toBe('NO_DEPOSITO');
      expect(response.body.usuario).toBeDefined();
    });

    it('deve retornar 401 sem autenticação', async () => {
      // Act
      const response = await request(app)
        .post('/api/equipamentos')
        .send({
          nome: 'Notebook',
          modelo: 'Dell',
          numero_serie: 'SN123',
          usuario_id: usuario.id
        });

      // Assert
      expect(response.status).toBe(401);
    });

    it('deve retornar 400 com dados inválidos', async () => {
      // Act
      const response = await request(app)
        .post('/api/equipamentos')
        .set('Cookie', [`token=${authToken}`])
        .send({
          nome: 'N', // Muito curto
          modelo: 'Dell',
          numero_serie: 'SN123',
          usuario_id: usuario.id
        });

      // Assert
      expect(response.status).toBe(400);
    });

    it('deve retornar 400 ao tentar criar com numero_serie duplicado', async () => {
      // Arrange
      const random = generateRandomData();
      await createTestEquipamento(usuario.id, { numero_serie: random.numero_serie });

      // Act
      const response = await request(app)
        .post('/api/equipamentos')
        .set('Cookie', [`token=${authToken}`])
        .send({
          nome: 'Outro Equipamento',
          modelo: 'Modelo',
          numero_serie: random.numero_serie,
          usuario_id: usuario.id
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('já cadastrado');
    });
  });

  describe('GET /api/equipamentos', () => {
    it('deve listar equipamentos com paginação', async () => {
      // Arrange
      await createTestEquipamento(usuario.id);
      await createTestEquipamento(usuario.id);

      // Act
      const response = await request(app)
        .get('/api/equipamentos')
        .set('Cookie', [`token=${authToken}`])
        .query({ page: 1, limit: 10 });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(2);
      expect(response.body.meta).toBeDefined();
    });

    it('deve filtrar por status', async () => {
      // Arrange
      await createTestEquipamento(usuario.id, { status: 'NO_DEPOSITO' });
      await createTestEquipamento(usuario.id, { status: 'FORA_DEPOSITO' });
      await createTestEquipamento(usuario.id, { status: 'DESCARTADO' });

      // Act
      const response = await request(app)
        .get('/api/equipamentos')
        .set('Cookie', [`token=${authToken}`])
        .query({ status: 'NO_DEPOSITO' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].status).toBe('NO_DEPOSITO');
    });

    it('deve filtrar por usuario_id', async () => {
      // Arrange
      const outroUsuario = await createTestUser({ usuario_rede: 'outro_usuario' });
      await createTestEquipamento(usuario.id);
      await createTestEquipamento(usuario.id);
      await createTestEquipamento(outroUsuario.id);

      // Act
      const response = await request(app)
        .get('/api/equipamentos')
        .set('Cookie', [`token=${authToken}`])
        .query({ usuario_id: usuario.id });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data.every(e => e.usuario_id === usuario.id)).toBe(true);
    });

    it('não deve listar equipamentos descartados por padrão', async () => {
      // Arrange
      await createTestEquipamento(usuario.id, { status: 'NO_DEPOSITO' });
      await createTestEquipamento(usuario.id, { status: 'DESCARTADO' });

      // Act
      const response = await request(app)
        .get('/api/equipamentos')
        .set('Cookie', [`token=${authToken}`]);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].status).not.toBe('DESCARTADO');
    });
  });

  describe('GET /api/equipamentos/:id', () => {
    it('deve retornar equipamento específico com relacionamentos', async () => {
      // Arrange
      const equipamento = await createTestEquipamento(usuario.id);

      // Act
      const response = await request(app)
        .get(`/api/equipamentos/${equipamento.id}`)
        .set('Cookie', [`token=${authToken}`]);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(equipamento.id);
      expect(response.body.usuario).toBeDefined();
      expect(response.body.movimentacoes).toBeDefined();
    });

    it('deve retornar 404 para ID inexistente', async () => {
      // Act
      const response = await request(app)
        .get('/api/equipamentos/99999')
        .set('Cookie', [`token=${authToken}`]);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.error).toContain('não encontrado');
    });
  });

  describe('PUT /api/equipamentos/:id', () => {
    it('deve atualizar equipamento', async () => {
      // Arrange
      const equipamento = await createTestEquipamento(usuario.id, {
        nome: 'Nome Original',
        local: 'Local Original'
      });

      // Act
      const response = await request(app)
        .put(`/api/equipamentos/${equipamento.id}`)
        .set('Cookie', [`token=${authToken}`])
        .send({
          nome: 'Nome Atualizado',
          local: 'Novo Local'
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.nome).toBe('Nome Atualizado');
      expect(response.body.local).toBe('Novo Local');
    });

    it('deve retornar 400 com dados inválidos', async () => {
      // Arrange
      const equipamento = await createTestEquipamento(usuario.id);

      // Act
      const response = await request(app)
        .put(`/api/equipamentos/${equipamento.id}`)
        .set('Cookie', [`token=${authToken}`])
        .send({
          nome: 'N' // Muito curto
        });

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/equipamentos/:id (descartar)', () => {
    it('deve descartar equipamento mudando status para DESCARTADO', async () => {
      // Arrange
      const equipamento = await createTestEquipamento(usuario.id, {
        status: 'NO_DEPOSITO'
      });

      // Act
      const response = await request(app)
        .delete(`/api/equipamentos/${equipamento.id}`)
        .set('Cookie', [`token=${authToken}`]);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('descartado com sucesso');

      // Verificar que foi descartado, não deletado
      const equipamentoNoBanco = await prisma.equipamento.findUnique({
        where: { id: equipamento.id }
      });
      expect(equipamentoNoBanco).not.toBeNull();
      expect(equipamentoNoBanco.status).toBe('DESCARTADO');
    });

    it('deve retornar 404 para ID inexistente', async () => {
      // Act
      const response = await request(app)
        .delete('/api/equipamentos/99999')
        .set('Cookie', [`token=${authToken}`]);

      // Assert
      expect(response.status).toBe(404);
    });
  });
});
