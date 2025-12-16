const authService = require('../../../src/services/authService');
const { clearDatabase, createTestUser, prisma } = require('../../helpers/testHelper');
const jwt = require('jsonwebtoken');

describe('AuthService', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  describe('login', () => {
    it('deve fazer login com credenciais válidas e retornar token e dados do usuário', async () => {
      // Arrange
      const usuario = await createTestUser({
        usuario_rede: 'test_user',
        senha: 'senha123',
        nome: 'Teste Login'
      });

      // Act
      const resultado = await authService.login('test_user', 'senha123');

      // Assert
      expect(resultado).toHaveProperty('token');
      expect(resultado).toHaveProperty('usuario');
      expect(resultado.usuario).toMatchObject({
        id: usuario.id,
        nome: 'Teste Login',
        usuario_rede: 'test_user'
      });
      expect(resultado.usuario).not.toHaveProperty('senha_hash');

      // Verificar que o token é válido
      const decoded = jwt.verify(resultado.token, process.env.JWT_SECRET);
      expect(decoded.id).toBe(usuario.id);
      expect(decoded.usuario_rede).toBe('test_user');
    });

    it('deve lançar erro ao tentar login com usuário inexistente', async () => {
      // Act & Assert
      await expect(
        authService.login('usuario_inexistente', 'senha123')
      ).rejects.toThrow('Credenciais inválidas');
    });

    it('deve lançar erro ao tentar login com senha incorreta', async () => {
      // Arrange
      await createTestUser({
        usuario_rede: 'test_user',
        senha: 'senha_correta'
      });

      // Act & Assert
      await expect(
        authService.login('test_user', 'senha_errada')
      ).rejects.toThrow('Credenciais inválidas');
    });

    it('deve lançar erro ao tentar login com usuário desativado', async () => {
      // Arrange
      await createTestUser({
        usuario_rede: 'user_desativado',
        senha: 'senha123',
        status_usuario: 0
      });

      // Act & Assert
      await expect(
        authService.login('user_desativado', 'senha123')
      ).rejects.toThrow('Usuário desativado');
    });

    it('deve lançar erro quando usuario_rede não é fornecido', async () => {
      // Act & Assert
      await expect(
        authService.login('', 'senha123')
      ).rejects.toThrow('Usuário de rede e senha são obrigatórios');
    });

    it('deve lançar erro quando senha não é fornecida', async () => {
      // Act & Assert
      await expect(
        authService.login('test_user', '')
      ).rejects.toThrow('Usuário de rede e senha são obrigatórios');
    });
  });

  describe('verificarToken', () => {
    it('deve verificar e decodificar token válido corretamente', async () => {
      // Arrange
      const usuario = await createTestUser();
      const token = jwt.sign(
        {
          id: usuario.id,
          usuario_rede: usuario.usuario_rede,
          nome: usuario.nome
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Act
      const decoded = await authService.verificarToken(token);

      // Assert
      expect(decoded.id).toBe(usuario.id);
      expect(decoded.usuario_rede).toBe(usuario.usuario_rede);
      expect(decoded.nome).toBe(usuario.nome);
    });

    it('deve lançar erro para token expirado', async () => {
      // Arrange
      const token = jwt.sign(
        { id: 1, usuario_rede: 'test', nome: 'Test' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' } // Token já expirado
      );

      // Act & Assert
      await expect(
        authService.verificarToken(token)
      ).rejects.toThrow('Token expirado');
    });

    it('deve lançar erro para token inválido', async () => {
      // Arrange
      const tokenInvalido = 'token_completamente_invalido';

      // Act & Assert
      await expect(
        authService.verificarToken(tokenInvalido)
      ).rejects.toThrow('Token inválido');
    });

    it('deve lançar erro para token na blacklist', async () => {
      // Arrange
      const usuario = await createTestUser();
      const token = jwt.sign(
        { id: usuario.id, usuario_rede: usuario.usuario_rede, nome: usuario.nome },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Adicionar token à blacklist
      await authService.blacklistToken(token);

      // Act & Assert
      await expect(
        authService.verificarToken(token)
      ).rejects.toThrow('Token inválido');
    });
  });

  describe('blacklistToken', () => {
    it('deve adicionar token à blacklist com expiração correta', async () => {
      // Arrange
      const usuario = await createTestUser();
      const token = jwt.sign(
        { id: usuario.id, usuario_rede: usuario.usuario_rede, nome: usuario.nome },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Act
      await authService.blacklistToken(token);

      // Assert
      const blacklisted = await prisma.tokenBlacklist.findUnique({
        where: { token }
      });

      expect(blacklisted).not.toBeNull();
      expect(blacklisted.token).toBe(token);
      expect(blacklisted.expiresAt).toBeInstanceOf(Date);
    });

    it('deve lidar gracefully com token inválido ao adicionar na blacklist', async () => {
      // Arrange
      const tokenInvalido = 'token_invalido_sem_payload';

      // Act & Assert - não deve lançar erro
      await expect(
        authService.blacklistToken(tokenInvalido)
      ).resolves.not.toThrow();
    });
  });
});
