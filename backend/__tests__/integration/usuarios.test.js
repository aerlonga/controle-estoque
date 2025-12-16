const request = require('supertest');
const app = require('../../src/app');
const { clearDatabase, createTestUser, generateToken, prisma } = require('../helpers/testHelper');

describe('Usuarios Routes - Integration Tests', () => {
  let authToken;
  let usuario;

  beforeEach(async () => {
    await clearDatabase();
    usuario = await createTestUser({
      nome: 'Admin User',
      usuario_rede: 'admin'
    });
    authToken = generateToken(usuario);
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  describe('POST /api/usuarios', () => {
    it('deve criar usuário com dados válidos', async () => {
      // Act
      const response = await request(app)
        .post('/api/usuarios')
        .set('Cookie', [`token=${authToken}`])
        .send({
          nome: 'Novo Usuario',
          usuario_rede: 'novo_user',
          senha: 'senha123456'
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.nome).toBe('Novo Usuario');
      expect(response.body.usuario_rede).toBe('novo_user');
      expect(response.body).not.toHaveProperty('senha_hash');
    });

    it('deve retornar 401 sem autenticação', async () => {
      // Act
      const response = await request(app)
        .post('/api/usuarios')
        .send({
          nome: 'Novo Usuario',
          usuario_rede: 'novo_user',
          senha: 'senha123'
        });

      // Assert
      expect(response.status).toBe(401);
    });

    it('deve retornar 400 com dados inválidos', async () => {
      // Act
      const response = await request(app)
        .post('/api/usuarios')
        .set('Cookie', [`token=${authToken}`])
        .send({
          nome: 'Jo', // Muito curto
          usuario_rede: 'user',
          senha: '123' // Muito curta
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Erro de validação');
    });

    it('deve retornar 400 ao tentar criar usuário com usuario_rede duplicado', async () => {
      // Arrange - criar primeiro usuário
      await request(app)
        .post('/api/usuarios')
        .set('Cookie', [`token=${authToken}`])
        .send({
          nome: 'Usuario 1',
          usuario_rede: 'usuario_duplicado',
          senha: 'senha123'
        });

      // Act - tentar criar com mesmo usuario_rede
      const response = await request(app)
        .post('/api/usuarios')
        .set('Cookie', [`token=${authToken}`])
        .send({
          nome: 'Usuario 2',
          usuario_rede: 'usuario_duplicado',
          senha: 'senha456'
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('já cadastrado');
    });
  });

  describe('GET /api/usuarios', () => {
    it('deve listar usuários com paginação', async () => {
      // Arrange - criar mais usuários
      for (let i = 1; i <= 3; i++) {
        await createTestUser({
          nome: `Usuario ${i}`,
          usuario_rede: `user${i}`
        });
      }

      // Act
      const response = await request(app)
        .get('/api/usuarios')
        .set('Cookie', [`token=${authToken}`])
        .query({ page: 1, limit: 10 });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.currentPage).toBe(1);
    });

    it('deve retornar 401 sem autenticação', async () => {
      // Act
      const response = await request(app)
        .get('/api/usuarios');

      // Assert
      expect(response.status).toBe(401);
    });

    it('deve paginar corretamente', async () => {
      // Arrange - criar 15 usuários
      for (let i = 1; i <= 15; i++) {
        await createTestUser({
          nome: `Usuario ${i}`,
          usuario_rede: `user_pag_${i}`
        });
      }

      // Act - página 1
      const response1 = await request(app)
        .get('/api/usuarios')
        .set('Cookie', [`token=${authToken}`])
        .query({ page: 1, limit: 10 });

      // Act - página 2
      const response2 = await request(app)
        .get('/api/usuarios')
        .set('Cookie', [`token=${authToken}`])
        .query({ page: 2, limit: 10 });

      // Assert
      expect(response1.body.data.length).toBe(10);
      expect(response2.body.data.length).toBeGreaterThan(0);
      expect(response1.body.meta.isFirstPage).toBe(true);
      expect(response2.body.meta.isFirstPage).toBe(false);
    });
  });

  describe('GET /api/usuarios/:id', () => {
    it('deve retornar usuário específico', async () => {
      // Arrange
      const novoUsuario = await createTestUser({
        nome: 'Usuario Especifico',
        usuario_rede: 'user_especifico'
      });

      // Act
      const response = await request(app)
        .get(`/api/usuarios/${novoUsuario.id}`)
        .set('Cookie', [`token=${authToken}`]);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(novoUsuario.id);
      expect(response.body.nome).toBe('Usuario Especifico');
      expect(response.body).not.toHaveProperty('senha_hash');
    });

    it('deve retornar 404 para ID inexistente', async () => {
      // Act
      const response = await request(app)
        .get('/api/usuarios/99999')
        .set('Cookie', [`token=${authToken}`]);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.error).toContain('não encontrado');
    });
  });

  describe('PUT /api/usuarios/:id', () => {
    it('deve atualizar usuário', async () => {
      // Arrange
      const usuarioParaAtualizar = await createTestUser({
        nome: 'Nome Original',
        usuario_rede: 'original_user'
      });

      // Act
      const response = await request(app)
        .put(`/api/usuarios/${usuarioParaAtualizar.id}`)
        .set('Cookie', [`token=${authToken}`])
        .send({
          nome: 'Nome Atualizado'
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.nome).toBe('Nome Atualizado');
      expect(response.body.usuario_rede).toBe('original_user');
    });

    it('deve retornar 400 com dados inválidos', async () => {
      // Arrange
      const usuarioParaAtualizar = await createTestUser();

      // Act
      const response = await request(app)
        .put(`/api/usuarios/${usuarioParaAtualizar.id}`)
        .set('Cookie', [`token=${authToken}`])
        .send({
          nome: 'Jo' // Muito curto
        });

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/usuarios/:id', () => {
    it('deve desativar usuário (soft delete)', async () => {
      // Arrange
      const usuarioParaDesativar = await createTestUser({
        nome: 'Usuario Para Desativar',
        usuario_rede: 'user_desativar'
      });

      // Act
      const response = await request(app)
        .delete(`/api/usuarios/${usuarioParaDesativar.id}`)
        .set('Cookie', [`token=${authToken}`]);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('desativado com sucesso');

      // Verificar que foi desativado, não deletado
      const usuarioNoBanco = await prisma.usuario.findUnique({
        where: { id: usuarioParaDesativar.id }
      });
      expect(usuarioNoBanco).not.toBeNull();
      expect(usuarioNoBanco.status_usuario).toBe(0);
    });

    it('deve retornar 400 para ID inexistente', async () => {
      // Act
      const response = await request(app)
        .delete('/api/usuarios/99999')
        .set('Cookie', [`token=${authToken}`]);

      // Assert
      expect(response.status).toBe(400);
    });
  });
});
