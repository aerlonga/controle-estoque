const equipamentoService = require('../../../src/services/equipamentoService');
const { clearDatabase, createTestUser, createTestEquipamento, generateRandomData, prisma } = require('../../helpers/testHelper');

describe('EquipamentoService', () => {
  let usuario;

  beforeEach(async () => {
    await clearDatabase();
    usuario = await createTestUser();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  describe('criar', () => {
    it('deve criar equipamento com status NO_DEPOSITO por padrão', async () => {
      // Arrange
      const random = generateRandomData();
      const dados = {
        nome: 'Notebook Dell',
        modelo: 'Latitude 5420',
        numero_serie: random.numero_serie,
        patrimonio: random.patrimonio,
        local: 'Depósito',
        usuario_id: usuario.id
      };

      // Act
      const equipamento = await equipamentoService.criar(dados);

      // Assert
      expect(equipamento).toHaveProperty('id');
      expect(equipamento.nome).toBe('Notebook Dell');
      expect(equipamento.status).toBe('NO_DEPOSITO');
      expect(equipamento.usuario_id).toBe(usuario.id);
      expect(equipamento.usuario).toBeDefined();
    });

    it('deve rejeitar numero_serie duplicado', async () => {
      // Arrange
      const random = generateRandomData();
      await createTestEquipamento(usuario.id, { numero_serie: random.numero_serie });

      // Act & Assert
      await expect(
        equipamentoService.criar({
          nome: 'Outro Equipamento',
          modelo: 'Modelo X',
          numero_serie: random.numero_serie,
          usuario_id: usuario.id
        })
      ).rejects.toThrow('Número de série já cadastrado');
    });

    it('deve validar campo nome obrigatório', async () => {
      // Act & Assert
      await expect(
        equipamentoService.criar({
          modelo: 'Modelo',
          numero_serie: 'SN123',
          usuario_id: usuario.id
        })
      ).rejects.toThrow('Nome deve ter pelo menos 3 caracteres');
    });

    it('deve validar campo modelo obrigatório', async () => {
      // Act & Assert
      await expect(
        equipamentoService.criar({
          nome: 'Equipamento',
          numero_serie: 'SN123',
          usuario_id: usuario.id
        })
      ).rejects.toThrow('Modelo deve ter pelo menos 2 caracteres');
    });

    it('deve validar campo numero_serie obrigatório', async () => {
      // Act & Assert
      await expect(
        equipamentoService.criar({
          nome: 'Equipamento',
          modelo: 'Modelo',
          usuario_id: usuario.id
        })
      ).rejects.toThrow('Número de série deve ter pelo menos 3 caracteres');
    });

    it('deve validar campo usuario_id obrigatório', async () => {
      // Act & Assert
      await expect(
        equipamentoService.criar({
          nome: 'Equipamento',
          modelo: 'Modelo',
          numero_serie: 'SN123'
        })
      ).rejects.toThrow('ID do usuário é obrigatório');
    });
  });

  describe('listarAtivos', () => {
    it('deve listar equipamentos excluindo DESCARTADO', async () => {
      // Arrange
      await createTestEquipamento(usuario.id, { status: 'NO_DEPOSITO' });
      await createTestEquipamento(usuario.id, { status: 'FORA_DEPOSITO' });
      await createTestEquipamento(usuario.id, { status: 'DESCARTADO' });

      // Act
      const resultado = await equipamentoService.listarAtivos({}, 1, 10);

      // Assert
      expect(resultado.data).toHaveLength(2);
      expect(resultado.data.every(e => e.status !== 'DESCARTADO')).toBe(true);
    });

    it('deve filtrar por status NO_DEPOSITO', async () => {
      // Arrange
      await createTestEquipamento(usuario.id, { status: 'NO_DEPOSITO' });
      await createTestEquipamento(usuario.id, { status: 'NO_DEPOSITO' });
      await createTestEquipamento(usuario.id, { status: 'FORA_DEPOSITO' });

      // Act
      const resultado = await equipamentoService.listarAtivos({ status: 'NO_DEPOSITO' }, 1, 10);

      // Assert
      expect(resultado.data).toHaveLength(2);
      expect(resultado.data.every(e => e.status === 'NO_DEPOSITO')).toBe(true);
    });

    it('deve filtrar por usuario_id', async () => {
      // Arrange
      const outroUsuario = await createTestUser({ usuario_rede: 'outro_user' });
      await createTestEquipamento(usuario.id);
      await createTestEquipamento(usuario.id);
      await createTestEquipamento(outroUsuario.id);

      // Act
      const resultado = await equipamentoService.listarAtivos({ usuario_id: usuario.id }, 1, 10);

      // Assert
      expect(resultado.data).toHaveLength(2);
      expect(resultado.data.every(e => e.usuario_id === usuario.id)).toBe(true);
    });

    it('deve retornar paginação correta', async () => {
      // Arrange
      for (let i = 0; i < 15; i++) {
        await createTestEquipamento(usuario.id);
      }

      // Act
      const pagina1 = await equipamentoService.listarAtivos({}, 1, 10);
      const pagina2 = await equipamentoService.listarAtivos({}, 2, 10);

      // Assert
      expect(pagina1.data).toHaveLength(10);
      expect(pagina1.meta.isFirstPage).toBe(true);
      expect(pagina2.data).toHaveLength(5);
      expect(pagina2.meta.isLastPage).toBe(true);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar equipamento com relacionamentos (usuario, movimentacoes)', async () => {
      // Arrange
      const equipamento = await createTestEquipamento(usuario.id);

      // Act
      const encontrado = await equipamentoService.buscarPorId(equipamento.id);

      // Assert
      expect(encontrado.id).toBe(equipamento.id);
      expect(encontrado.usuario).toBeDefined();
      expect(encontrado.usuario.id).toBe(usuario.id);
      expect(encontrado.movimentacoes).toBeDefined();
    });

    it('deve lançar erro para ID inexistente', async () => {
      // Act & Assert
      await expect(
        equipamentoService.buscarPorId(99999)
      ).rejects.toThrow('Equipamento não encontrado');
    });
  });

  describe('atualizar', () => {
    it('deve atualizar campos do equipamento', async () => {
      // Arrange
      const equipamento = await createTestEquipamento(usuario.id, {
        nome: 'Nome Original',
        modelo: 'Modelo Original'
      });

      // Act
      const atualizado = await equipamentoService.atualizar(equipamento.id, {
        nome: 'Nome Atualizado',
        local: 'Novo Local'
      });

      // Assert
      expect(atualizado.nome).toBe('Nome Atualizado');
      expect(atualizado.local).toBe('Novo Local');
      expect(atualizado.modelo).toBe('Modelo Original');
    });

    it('deve rejeitar numero_serie duplicado', async () => {
      // Arrange
      const random = generateRandomData();
      const equip1 = await createTestEquipamento(usuario.id, { numero_serie: random.numero_serie });
      const equip2 = await createTestEquipamento(usuario.id);

      // Act & Assert
      await expect(
        equipamentoService.atualizar(equip2.id, {
          numero_serie: random.numero_serie
        })
      ).rejects.toThrow('Número de série já cadastrado em outro equipamento');
    });

    it('deve lançar erro para ID inexistente', async () => {
      // Act & Assert
      await expect(
        equipamentoService.atualizar(99999, { nome: 'Teste' })
      ).rejects.toThrow('Equipamento não encontrado');
    });
  });

  describe('descartar', () => {
    it('deve mudar status para DESCARTADO', async () => {
      // Arrange
      const equipamento = await createTestEquipamento(usuario.id, {
        status: 'NO_DEPOSITO'
      });

      // Act
      const resultado = await equipamentoService.descartar(equipamento.id);

      // Assert
      expect(resultado.message).toBe('Equipamento descartado com sucesso');

      const equipamentoDescartado = await prisma.equipamento.findUnique({
        where: { id: equipamento.id }
      });
      expect(equipamentoDescartado.status).toBe('DESCARTADO');
    });

    it('deve lançar erro para ID inexistente', async () => {
      // Act & Assert
      await expect(
        equipamentoService.descartar(99999)
      ).rejects.toThrow('Equipamento não encontrado');
    });
  });
});
