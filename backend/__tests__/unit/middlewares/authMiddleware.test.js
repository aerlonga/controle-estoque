const authMiddleware = require('../../../src/middlewares/authMiddleware');
const { createTestUser, generateToken, clearDatabase, prisma } = require('../../helpers/testHelper');

describe('authMiddleware', () => {
  let usuario;
  let validToken;

  beforeEach(async () => {
    await clearDatabase();
    usuario = await createTestUser();
    validToken = generateToken(usuario);
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  it('deve aceitar token válido no cookie e chamar next()', async () => {
    // Arrange
    const req = {
      cookies: { token: validToken },
      headers: {}
    };
    const res = {};
    const next = jest.fn();

    // Act
    await authMiddleware(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(usuario.id);
    expect(req.user.usuario_rede).toBe(usuario.usuario_rede);
  });

  it('deve aceitar token válido no header Authorization (Bearer)', async () => {
    // Arrange
    const req = {
      cookies: {},
      headers: {
        authorization: `Bearer ${validToken}`
      }
    };
    const res = {};
    const next = jest.fn();

    // Act
    await authMiddleware(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(usuario.id);
  });

  it('deve aceitar header Authorization case-insensitive', async () => {
    // Arrange
    const req = {
      cookies: {},
      headers: {
        authorization: `bearer ${validToken}` // lowercase
      }
    };
    const res = {};
    const next = jest.fn();

    // Act
    await authMiddleware(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });

  it('deve popular req.user com dados decodificados do token', async () => {
    // Arrange
    const req = {
      cookies: { token: validToken },
      headers: {}
    };
    const res = {};
    const next = jest.fn();

    // Act
    await authMiddleware(req, res, next);

    // Assert
    expect(req.user).toEqual({
      id: usuario.id,
      usuario_rede: usuario.usuario_rede,
      nome: usuario.nome
    });
  });

  it('deve retornar 401 se token não fornecido', async () => {
    // Arrange
    const req = {
      cookies: {},
      headers: {}
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    // Act
    await authMiddleware(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Token não fornecido'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 401 se token inválido', async () => {
    // Arrange
    const req = {
      cookies: { token: 'token_invalido' },
      headers: {}
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    // Act
    await authMiddleware(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 401 se token expirado', async () => {
    // Arrange
    const jwt = require('jsonwebtoken');
    const tokenExpirado = jwt.sign(
      { id: usuario.id, usuario_rede: usuario.usuario_rede, nome: usuario.nome },
      process.env.JWT_SECRET,
      { expiresIn: '-1h' }
    );

    const req = {
      cookies: { token: tokenExpirado },
      headers: {}
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    // Act
    await authMiddleware(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Token expirado'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 401 se token na blacklist', async () => {
    // Arrange
    const authService = require('../../../src/services/authService');
    await authService.blacklistToken(validToken);

    const req = {
      cookies: { token: validToken },
      headers: {}
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    // Act
    await authMiddleware(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Token inválido'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve priorizar cookie sobre header Authorization', async () => {
    // Arrange
    const outroUsuario = await createTestUser({ usuario_rede: 'outro_usuario' });
    const outroToken = generateToken(outroUsuario);

    const req = {
      cookies: { token: validToken }, // Token do primeiro usuário
      headers: {
        authorization: `Bearer ${outroToken}` // Token de outro usuário
      }
    };
    const res = {};
    const next = jest.fn();

    // Act
    await authMiddleware(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe(usuario.id); // Deve usar o token do cookie
  });
});
