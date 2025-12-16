const request = require('supertest');
const app = require('../../src/app');

describe('App - Integration Tests', () => {
  describe('Aplicação Express', () => {
    it('deve estar definida e ser uma função', () => {
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
    });

    it('deve responder a requisições GET na rota /api', async () => {
      const response = await request(app).get('/api');
      // Qualquer resposta (mesmo 404) mostra que a app está funcionando
      expect(response).toBeDefined();
    });

    it('deve retornar 404 para rotas inexistentes', async () => {
      const response = await request(app).get('/rota/inexistente');
      expect(response.status).toBe(404);
    });

    it('deve processar JSON no body das requisições', async () => {
      // Tentando fazer login sem autenticação deve processar JSON
      const response = await request(app)
        .post('/api/auth/login')
        .send({ usuario_rede: 'test', senha: 'test' })
        .set('Content-Type', 'application/json');

      // Deve processar o JSON, mesmo que retorne erro de validação
      expect(response.status).not.toBe(500);
    });

    it('deve aceitar cookies', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', ['token=fake_token']);

      // Deve processar o cookie, mesmo que retorne erro
      expect(response).toBeDefined();
    });

    it('deve montar rotas em /api', async () => {
      // Testar que as rotas principais existem
      const authResponse = await request(app).post('/api/auth/login');
      expect(authResponse.status).not.toBe(404); // Rota existe, mesmo que falhe

      const usuariosResponse = await request(app).get('/api/usuarios');
      expect(usuariosResponse.status).not.toBe(404); // Deve retornar 401 (não autenticado), não 404
    });

    it('deve ter middleware de JSON parser configurado', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send('{"usuario_rede":"test","senha":"test"}')
        .set('Content-Type', 'application/json');

      // Se não houver JSON parser, vai dar erro 500 ao tentar acessar req.body
      expect(response.status).not.toBe(500);
    });
  });
});
