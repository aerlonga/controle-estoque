const validate = require('../../../src/middlewares/validateSchema');
const { z } = require('zod');

describe('validate middleware', () => {
  // Schema de teste simples
  const testSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    idade: z.number().int().positive(),
    email: z.string().email('Email inválido').optional()
  });

  it('deve validar dados corretos e chamar next()', () => {
    // Arrange
    const req = {
      body: {
        nome: 'João Silva',
        idade: 30
      }
    };
    const res = {};
    const next = jest.fn();
    const middleware = validate(testSchema);

    // Act
    middleware(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({
      nome: 'João Silva',
      idade: 30
    });
  });

  it('deve substituir req[source] pelos dados validados (parsed)', () => {
    // Arrange - Zod faz parsing de strings para números
    const req = {
      body: {
        nome: 'João',
        idade: '25' // String que será convertida para número
      }
    };
    const res = {};
    const next = jest.fn();
    
    const schemaComCoercion = z.object({
      nome: z.string(),
      idade: z.coerce.number() // Converte string para número
    });
    const middleware = validate(schemaComCoercion);

    // Act
    middleware(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(req.body.idade).toBe(25); // Deve ser número, não string
    expect(typeof req.body.idade).toBe('number');
  });

  it('deve retornar 400 com detalhes de erros de validação', () => {
    // Arrange
    const req = {
      body: {
        nome: 'Jo', // Muito curto
        idade: -5 // Negativo
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();
    const middleware = validate(testSchema);

    // Act
    middleware(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Erro de validação',
      details: expect.arrayContaining([
        expect.objectContaining({
          field: 'nome',
          message: 'Nome deve ter no mínimo 3 caracteres'
        }),
        expect.objectContaining({
          field: 'idade'
        })
      ])
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve suportar validação de query params', () => {
    // Arrange
    const querySchema = z.object({
      page: z.coerce.number().int().min(1),
      limit: z.coerce.number().int().min(1).max(100)
    });

    const req = {
      query: {
        page: '2',
        limit: '10'
      }
    };
    const res = {};
    const next = jest.fn();
    const middleware = validate(querySchema, 'query');

    // Act
    middleware(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(req.query.page).toBe(2);
    expect(req.query.limit).toBe(10);
  });

  it('deve suportar validação de params', () => {
    // Arrange
    const paramsSchema = z.object({
      id: z.coerce.number().int()
    });

    const req = {
      params: {
        id: '123'
      }
    };
    const res = {};
    const next = jest.fn();
    const middleware = validate(paramsSchema, 'params');

    // Act
    middleware(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(req.params.id).toBe(123);
  });

  it('deve retornar 400 para campos obrigatórios faltando', () => {
    // Arrange
    const req = {
      body: {} // Vazio
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();
    const middleware = validate(testSchema);

    // Act
    middleware(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('deve permitir campos opcionais ausentes', () => {
    // Arrange
    const req = {
      body: {
        nome: 'João',
        idade: 30
        // email é opcional e não está presente
      }
    };
    const res = {};
    const next = jest.fn();
    const middleware = validate(testSchema);

    // Act
    middleware(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
  });

  it('deve validar campos opcionais quando presentes', () => {
    // Arrange
    const req = {
      body: {
        nome: 'João',
        idade: 30,
        email: 'email_invalido' // Email mal formado
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();
    const middleware = validate(testSchema);

    // Act
    middleware(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Erro de validação',
      details: expect.arrayContaining([
        expect.objectContaining({
          field: 'email',
          message: 'Email inválido'
        })
      ])
    });
  });

  it('deve formatar corretamente o path de campos aninhados', () => {
    // Arrange
    const nestedSchema = z.object({
      usuario: z.object({
        nome: z.string().min(3)
      })
    });

    const req = {
      body: {
        usuario: {
          nome: 'Jo' // Muito curto
        }
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();
    const middleware = validate(nestedSchema);

    // Act
    middleware(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Erro de validação',
      details: expect.arrayContaining([
        expect.objectContaining({
          field: 'usuario.nome'
        })
      ])
    });
  });

  it('deve retornar 500 em caso de erro interno inesperado', () => {
    // Arrange
    const schemaComErro = {
      safeParse: () => {
        throw new Error('Erro inesperado no Zod');
      }
    };

    const req = { body: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();
    const middleware = validate(schemaComErro);

    // Act
    middleware(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Erro interno na validação'
    });
  });
});
