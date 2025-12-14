const request = require('supertest');
const app = require('../../src/app');
const { clearDatabase, createTestUser, prisma } = require('../helpers/testHelper');

describe('Auth Routes - Integration Tests', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  describe('POST /api/auth/login', () => {
    it('deve fazer login com sucesso e retornar token + cookie', async () => {
      // Arrange
      await createTestUser({
        usuario_rede: 'test_user',
        senha: 'senha123',
        nome: 'Usuario Teste'
      });

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario_rede: 'test_user',
          senha: 'senha123'
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('usuario');
      expect(response.body.usuario.nome).toBe('Usuario Teste');
      expect(response.body.usuario.usuario_rede).toBe('test_user');
      expect(response.body.usuario).not.toHaveProperty('senha_hash');

      // Verificar cookie
      expect(response.headers['set-cookie']).toBeDefined();
      const cookieHeader = response.headers['set-cookie'][0];
      expect(cookieHeader).toContain('token=');
      expect(cookieHeader).toContain('HttpOnly');
    });

    it('deve retornar 401 com credenciais inválidas', async () => {
      // Arrange
      await createTestUser({
        usuario_rede: 'test_user',
        senha: 'senha_correta'
      });

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario_rede: 'test_user',
          senha: 'senha_errada'
        });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Credenciais inválidas');
    });

    it('deve retornar 400 quando dados de validação estão faltando', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario_rede: 'test_user'
          // senha faltando
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Erro de validação');
      expect(response.body.details).toBeDefined();
    });

    it('deve retornar 401 para usuário desativado', async () => {
      // Arrange
      await createTestUser({
        usuario_rede: 'user_desativado',
        senha: 'senha123',
        status_usuario: 0
      });

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario_rede: 'user_desativado',
          senha: 'senha123'
        });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Usuário desativado');
    });

    it('deve retornar 401 para usuário inexistente', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario_rede: 'usuario_nao_existe',
          senha: 'senha123'
        });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Credenciais inválidas');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('deve fazer logout com sucesso e limpar cookie', async () => {
      // Arrange - fazer login primeiro
      const usuario = await createTestUser({
        usuario_rede: 'test_user',
        senha: 'senha123'
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          usuario_rede: 'test_user',
          senha: 'senha123'
        });

      const token = loginResponse.body.token;

      // Act
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [`token=${token}`]);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logout realizado com sucesso');

      // Verificar que o cookie foi limpo
      expect(response.headers['set-cookie']).toBeDefined();
      const cookieHeader = response.headers['set-cookie'][0];
      expect(cookieHeader).toContain('token=;');

      // Verificar que o token foi adicionado à blacklist
      const blacklisted = await prisma.tokenBlacklist.findUnique({
        where: { token }
      });
      expect(blacklisted).not.toBeNull();
    });

    it('deve fazer logout com sucesso usando Authorization header', async () => {
      // Arrange
      const usuario = await createTestUser({
        usuario_rede: 'test_user',
        senha: 'senha123'
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          usuario_rede: 'test_user',
          senha: 'senha123'
        });

      const token = loginResponse.body.token;

      // Act
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logout realizado com sucesso');
    });

    it('deve permitir logout sem token (graceful)', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/logout');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logout realizado com sucesso');
    });
  });
});
