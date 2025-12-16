const usuarioService = require('../../../src/services/usuarioService');
const { clearDatabase, createTestUser, prisma } = require('../../helpers/testHelper');
const bcrypt = require('bcrypt');

describe('UsuarioService', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  describe('criar', () => {
    it('deve criar usuário com dados válidos e hash de senha', async () => {
      // Arrange
      const dados = {
        nome: 'João Silva',
        usuario_rede: 'joao.silva',
        senha: 'senha123'
      };

      // Act
      const usuario = await usuarioService.criar(dados);

      // Assert
      expect(usuario).toHaveProperty('id');
      expect(usuario.nome).toBe('João Silva');
      expect(usuario.usuario_rede).toBe('joao.silva');
      expect(usuario).not.toHaveProperty('senha_hash');

      // Verificar que a senha foi hasheada no banco
      const usuarioNoBanco = await prisma.usuario.findUnique({
        where: { id: usuario.id }
      });
      expect(usuarioNoBanco.senha_hash).not.toBe('senha123');
      const senhaValida = await bcrypt.compare('senha123', usuarioNoBanco.senha_hash);
      expect(senhaValida).toBe(true);
    });

    it('deve rejeitar criação com usuario_rede duplicado', async () => {
      // Arrange
      await createTestUser({ usuario_rede: 'usuario_duplicado' });

      // Act & Assert
      await expect(
        usuarioService.criar({
          nome: 'Outro Nome',
          usuario_rede: 'usuario_duplicado',
          senha: 'senha123'
        })
      ).rejects.toThrow('Usuário de rede já cadastrado');
    });

    it('deve rejeitar criação sem nome', async () => {
      // Act & Assert
      await expect(
        usuarioService.criar({
          usuario_rede: 'teste',
          senha: 'senha123'
        })
      ).rejects.toThrow('Nome, usuário de rede e senha são obrigatórios');
    });

    it('deve rejeitar criação sem usuario_rede', async () => {
      // Act & Assert
      await expect(
        usuarioService.criar({
          nome: 'Teste',
          senha: 'senha123'
        })
      ).rejects.toThrow('Nome, usuário de rede e senha são obrigatórios');
    });

    it('deve rejeitar criação sem senha', async () => {
      // Act & Assert
      await expect(
        usuarioService.criar({
          nome: 'Teste',
          usuario_rede: 'teste'
        })
      ).rejects.toThrow('Nome, usuário de rede e senha são obrigatórios');
    });
  });

  describe('listar', () => {
    it('deve listar apenas usuários ativos (status_usuario = 1)', async () => {
      // Arrange
      await createTestUser({ nome: 'Ativo 1', status_usuario: 1 });
      await createTestUser({ nome: 'Ativo 2', status_usuario: 1 });
      await createTestUser({ nome: 'Desativado', status_usuario: 0 });

      // Act
      const resultado = await usuarioService.listar(1, 10);

      // Assert
      expect(resultado.data).toHaveLength(2);
      expect(resultado.data.every(u => !u.senha_hash)).toBe(true);
    });

    it('deve retornar paginação correta', async () => {
      // Arrange
      for (let i = 1; i <= 15; i++) {
        await createTestUser({ nome: `Usuario ${i}` });
      }

      // Act
      const pagina1 = await usuarioService.listar(1, 10);
      const pagina2 = await usuarioService.listar(2, 10);

      // Assert
      expect(pagina1.data).toHaveLength(10);
      expect(pagina1.meta.currentPage).toBe(1);
      expect(pagina1.meta.isFirstPage).toBe(true);
      expect(pagina1.meta.isLastPage).toBe(false);

      expect(pagina2.data).toHaveLength(5);
      expect(pagina2.meta.currentPage).toBe(2);
      expect(pagina2.meta.isLastPage).toBe(true);
    });

    it('não deve expor senha_hash no resultado', async () => {
      // Arrange
      await createTestUser({ nome: 'Teste' });

      // Act
      const resultado = await usuarioService.listar(1, 10);

      // Assert
      resultado.data.forEach(usuario => {
        expect(usuario).not.toHaveProperty('senha_hash');
      });
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar usuário existente sem senha_hash', async () => {
      // Arrange
      const usuario = await createTestUser({ nome: 'Teste Busca' });

      // Act
      const encontrado = await usuarioService.buscarPorId(usuario.id);

      // Assert
      expect(encontrado.id).toBe(usuario.id);
      expect(encontrado.nome).toBe('Teste Busca');
      expect(encontrado).not.toHaveProperty('senha_hash');
    });

    it('deve lançar erro para ID inexistente', async () => {
      // Act & Assert
      await expect(
        usuarioService.buscarPorId(99999)
      ).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('atualizar', () => {
    it('deve atualizar dados do usuário', async () => {
      // Arrange
      const usuario = await createTestUser({
        nome: 'Nome Original',
        usuario_rede: 'original'
      });

      // Act
      const atualizado = await usuarioService.atualizar(usuario.id, {
        nome: 'Nome Atualizado'
      });

      // Assert
      expect(atualizado.nome).toBe('Nome Atualizado');
      expect(atualizado.usuario_rede).toBe('original');
    });

    it('deve fazer hash de nova senha se fornecida', async () => {
      // Arrange
      const usuario = await createTestUser();

      // Act
      await usuarioService.atualizar(usuario.id, {
        senha: 'nova_senha123'
      });

      // Assert
      const usuarioAtualizado = await prisma.usuario.findUnique({
        where: { id: usuario.id }
      });
      const senhaValida = await bcrypt.compare('nova_senha123', usuarioAtualizado.senha_hash);
      expect(senhaValida).toBe(true);
    });

    it('deve rejeitar usuario_rede duplicado', async () => {
      // Arrange
      await createTestUser({ usuario_rede: 'existente' });
      const outroUsuario = await createTestUser({ usuario_rede: 'outro' });

      // Act & Assert
      await expect(
        usuarioService.atualizar(outroUsuario.id, {
          usuario_rede: 'existente'
        })
      ).rejects.toThrow('Usuário de rede já cadastrado');
    });

    it('deve lançar erro para ID inexistente', async () => {
      // Act & Assert
      await expect(
        usuarioService.atualizar(99999, { nome: 'Teste' })
      ).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('desativar', () => {
    it('deve mudar status_usuario para 0', async () => {
      // Arrange
      const usuario = await createTestUser({ status_usuario: 1 });

      // Act
      const resultado = await usuarioService.desativar(usuario.id);

      // Assert
      expect(resultado.message).toBe('Usuário desativado com sucesso');

      const usuarioDesativado = await prisma.usuario.findUnique({
        where: { id: usuario.id }
      });
      expect(usuarioDesativado.status_usuario).toBe(0);
    });

    it('deve lançar erro para ID inexistente', async () => {
      // Act & Assert
      await expect(
        usuarioService.desativar(99999)
      ).rejects.toThrow('Usuário não encontrado');
    });
  });
});
