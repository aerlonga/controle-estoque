const movimentacaoService = require('../../../src/services/movimentacaoService');
const { clearDatabase, createTestUser, createTestEquipamento, createTestMovimentacao, prisma } = require('../../helpers/testHelper');

describe('MovimentacaoService', () => {
  let usuario;
  let equipamento;

  beforeEach(async () => {
    await clearDatabase();
    usuario = await createTestUser();
    equipamento = await createTestEquipamento(usuario.id, { status: 'NO_DEPOSITO' });
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  describe('criar', () => {
    it('deve criar SAIDA e mudar equipamento para FORA_DEPOSITO', async () => {
      // Arrange
      const dados = {
        equipamento_id: equipamento.id,
        tipo: 'SAIDA',
        usuario_id: usuario.id,
        observacao: 'Saída para manutenção'
      };

      // Act
      const movimentacao = await movimentacaoService.criar(dados);

      // Assert
      expect(movimentacao).toHaveProperty('id');
      expect(movimentacao.tipo).toBe('SAIDA');
      expect(movimentacao.equipamento_id).toBe(equipamento.id);
      expect(movimentacao.usuario_id).toBe(usuario.id);

      // Verificar que o equipamento mudou de status
      const equipamentoAtualizado = await prisma.equipamento.findUnique({
        where: { id: equipamento.id }
      });
      expect(equipamentoAtualizado.status).toBe('FORA_DEPOSITO');
    });

    it('deve criar ENTRADA e mudar equipamento para NO_DEPOSITO', async () => {
      // Arrange - primeiro fazer uma SAIDA
      await prisma.equipamento.update({
        where: { id: equipamento.id },
        data: { status: 'FORA_DEPOSITO' }
      });

      const dados = {
        equipamento_id: equipamento.id,
        tipo: 'ENTRADA',
        usuario_id: usuario.id,
        observacao: 'Retorno de manutenção'
      };

      // Act
      const movimentacao = await movimentacaoService.criar(dados);

      // Assert
      expect(movimentacao.tipo).toBe('ENTRADA');

      const equipamentoAtualizado = await prisma.equipamento.findUnique({
        where: { id: equipamento.id }
      });
      expect(equipamentoAtualizado.status).toBe('NO_DEPOSITO');
    });

    it('deve rejeitar SAIDA se equipamento não está NO_DEPOSITO', async () => {
      // Arrange
      await prisma.equipamento.update({
        where: { id: equipamento.id },
        data: { status: 'FORA_DEPOSITO' }
      });

      // Act & Assert
      await expect(
        movimentacaoService.criar({
          equipamento_id: equipamento.id,
          tipo: 'SAIDA',
          usuario_id: usuario.id
        })
      ).rejects.toThrow('Equipamento deve estar NO_DEPOSITO para realizar SAIDA');
    });

    it('deve rejeitar ENTRADA se equipamento não está FORA_DEPOSITO', async () => {
      // Equipamento já está NO_DEPOSITO

      // Act & Assert
      await expect(
        movimentacaoService.criar({
          equipamento_id: equipamento.id,
          tipo: 'ENTRADA',
          usuario_id: usuario.id
        })
      ).rejects.toThrow('Equipamento deve estar FORA_DEPOSITO para realizar ENTRADA');
    });

    it('deve rejeitar movimentação de equipamento DESCARTADO', async () => {
      // Arrange
      await prisma.equipamento.update({
        where: { id: equipamento.id },
        data: { status: 'DESCARTADO' }
      });

      // Act & Assert
      await expect(
        movimentacaoService.criar({
          equipamento_id: equipamento.id,
          tipo: 'SAIDA',
          usuario_id: usuario.id
        })
      ).rejects.toThrow('Não é possível movimentar equipamento descartado');
    });

    it('deve validar equipamento_id obrigatório', async () => {
      // Act & Assert
      await expect(
        movimentacaoService.criar({
          tipo: 'SAIDA',
          usuario_id: usuario.id
        })
      ).rejects.toThrow('ID do equipamento é obrigatório');
    });

    it('deve validar tipo obrigatório', async () => {
      // Act & Assert
      await expect(
        movimentacaoService.criar({
          equipamento_id: equipamento.id,
          usuario_id: usuario.id
        })
      ).rejects.toThrow('Tipo deve ser ENTRADA ou SAIDA');
    });

    it('deve validar tipo válido (ENTRADA ou SAIDA)', async () => {
      // Act & Assert
      await expect(
        movimentacaoService.criar({
          equipamento_id: equipamento.id,
          tipo: 'INVALIDO',
          usuario_id: usuario.id
        })
      ).rejects.toThrow('Tipo deve ser ENTRADA ou SAIDA');
    });

    it('deve validar usuario_id obrigatório', async () => {
      // Act & Assert
      await expect(
        movimentacaoService.criar({
          equipamento_id: equipamento.id,
          tipo: 'SAIDA'
        })
      ).rejects.toThrow('ID do usuário é obrigatório');
    });

    it('deve lançar erro se equipamento não existe', async () => {
      // Act & Assert
      await expect(
        movimentacaoService.criar({
          equipamento_id: 99999,
          tipo: 'SAIDA',
          usuario_id: usuario.id
        })
      ).rejects.toThrow('Equipamento não encontrado');
    });

    it('deve lançar erro se usuário não existe', async () => {
      // Act & Assert
      await expect(
        movimentacaoService.criar({
          equipamento_id: equipamento.id,
          tipo: 'SAIDA',
          usuario_id: 99999
        })
      ).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('listar', () => {
    beforeEach(async () => {
      // Criar algumas movimentações para teste
      await createTestMovimentacao(equipamento.id, usuario.id, { tipo: 'SAIDA' });
      
      const outroEquipamento = await createTestEquipamento(usuario.id, { status: 'NO_DEPOSITO' });
      await createTestMovimentacao(outroEquipamento.id, usuario.id, { tipo: 'SAIDA' });
    });

    it('deve listar movimentações com paginação', async () => {
      // Act
      const resultado = await movimentacaoService.listar({}, 1, 10);

      // Assert
      expect(resultado.data).toHaveLength(2);
      expect(resultado.meta).toBeDefined();
      expect(resultado.data[0]).toHaveProperty('equipamento');
      expect(resultado.data[0]).toHaveProperty('usuario');
    });

    it('deve filtrar por equipamento_id', async () => {
      // Act
      const resultado = await movimentacaoService.listar(
        { equipamento_id: equipamento.id },
        1,
        10
      );

      // Assert
      expect(resultado.data).toHaveLength(1);
      expect(resultado.data[0].equipamento_id).toBe(equipamento.id);
    });

    it('deve filtrar por tipo', async () => {
      // Arrange - criar uma ENTRADA
      await prisma.equipamento.update({
        where: { id: equipamento.id },
        data: { status: 'FORA_DEPOSITO' }
      });
      await createTestMovimentacao(equipamento.id, usuario.id, { tipo: 'ENTRADA' });

      // Act
      const resultado = await movimentacaoService.listar({ tipo: 'ENTRADA' }, 1, 10);

      // Assert
      expect(resultado.data.every(m => m.tipo === 'ENTRADA')).toBe(true);
    });

    it('deve filtrar por usuario_id', async () => {
      // Arrange
      const outroUsuario = await createTestUser({ usuario_rede: 'outro_user' });
      const equipOutro = await createTestEquipamento(outroUsuario.id, { status: 'NO_DEPOSITO' });
      await createTestMovimentacao(equipOutro.id, outroUsuario.id, { tipo: 'SAIDA' });

      // Act
      const resultado = await movimentacaoService.listar({ usuario_id: usuario.id }, 1, 10);

      // Assert
      expect(resultado.data.every(m => m.usuario_id === usuario.id)).toBe(true);
    });

    it('deve filtrar por período (data_inicio e data_fim)', async () => {
      // Arrange
      const hoje = new Date();
      const ontem = new Date(hoje);
      ontem.setDate(ontem.getDate() - 1);
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);

      // Act
      const resultado = await movimentacaoService.listar(
        {
          data_inicio: ontem.toISOString(),
          data_fim: amanha.toISOString()
        },
        1,
        10
      );

      // Assert
      expect(resultado.data.length).toBeGreaterThan(0);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar movimentação com relacionamentos', async () => {
      // Arrange
      const movimentacao = await createTestMovimentacao(equipamento.id, usuario.id);

      // Act
      const encontrada = await movimentacaoService.buscarPorId(movimentacao.id);

      // Assert
      expect(encontrada.id).toBe(movimentacao.id);
      expect(encontrada.equipamento).toBeDefined();
      expect(encontrada.usuario).toBeDefined();
      expect(encontrada.equipamento.status).toBeDefined();
    });

    it('deve lançar erro para ID inexistente', async () => {
      // Act & Assert
      await expect(
        movimentacaoService.buscarPorId(99999)
      ).rejects.toThrow('Movimentação não encontrada');
    });
  });

  describe('listarPorEquipamento', () => {
    it('deve filtrar corretamente e retornar paginação', async () => {
      // Arrange
      await createTestMovimentacao(equipamento.id, usuario.id);
      const outroEquipamento = await createTestEquipamento(usuario.id, { status: 'NO_DEPOSITO' });
      await createTestMovimentacao(outroEquipamento.id, usuario.id);

      // Act
      const resultado = await movimentacaoService.listarPorEquipamento(equipamento.id, 1, 10);

      // Assert
      expect(resultado.data.every(m => m.equipamento_id === equipamento.id)).toBe(true);
      expect(resultado.meta).toBeDefined();
    });
  });

  describe('listarPorUsuario', () => {
    it('deve filtrar corretamente e retornar paginação', async () => {
      // Arrange
      await createTestMovimentacao(equipamento.id, usuario.id);
      const outroUsuario = await createTestUser({ usuario_rede: 'outro' });
      const equipOutro = await createTestEquipamento(outroUsuario.id, { status: 'NO_DEPOSITO' });
      await createTestMovimentacao(equipOutro.id, outroUsuario.id);

      // Act
      const resultado = await movimentacaoService.listarPorUsuario(usuario.id, 1, 10);

      // Assert
      expect(resultado.data.every(m => m.usuario_id === usuario.id)).toBe(true);
      expect(resultado.meta).toBeDefined();
    });
  });
});
