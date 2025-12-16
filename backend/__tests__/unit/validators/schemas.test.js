const {
  loginSchema,
  createUsuarioSchema,
  updateUsuarioSchema,
  createEquipamentoSchema,
  updateEquipamentoSchema,
  createMovimentacaoSchema
} = require('../../../src/validators/schemas');

describe('Schemas de Validação', () => {
  describe('loginSchema', () => {
    it('deve validar dados corretos de login', () => {
      const dados = {
        usuario_rede: 'joao.silva',
        senha: 'senha123'
      };

      const result = loginSchema.safeParse(dados);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar usuario_rede vazio', () => {
      const dados = {
        usuario_rede: '',
        senha: 'senha123'
      };

      const result = loginSchema.safeParse(dados);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar senha vazia', () => {
      const dados = {
        usuario_rede: 'joao.silva',
        senha: ''
      };

      const result = loginSchema.safeParse(dados);
      expect(result.success).toBe(false);
    });

    it('deve fazer trim do usuario_rede', () => {
      const dados = {
        usuario_rede: '  joao.silva  ',
        senha: 'senha123'
      };

      const result = loginSchema.safeParse(dados);
      expect(result.success).toBe(true);
      expect(result.data.usuario_rede).toBe('joao.silva');
    });
  });

  describe('createUsuarioSchema', () => {
    it('deve validar dados corretos de criação', () => {
      const dados = {
        nome: 'João Silva',
        usuario_rede: 'joao.silva',
        senha: 'senha123'
      };

      const result = createUsuarioSchema.safeParse(dados);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar nome com menos de 3 caracteres', () => {
      const dados = {
        nome: 'Jo',
        usuario_rede: 'joao',
        senha: 'senha123'
      };

      const result = createUsuarioSchema.safeParse(dados);
      expect(result.success).toBe(false);
      expect((result.error.errors || result.error.issues)[0].message).toContain('mínimo 3 caracteres');
    });

    it('deve rejeitar usuario_rede com menos de 3 caracteres', () => {
      const dados = {
        nome: 'João',
        usuario_rede: 'jo',
        senha: 'senha123'
      };

      const result = createUsuarioSchema.safeParse(dados);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar senha com menos de 6 caracteres', () => {
      const dados = {
        nome: 'João',
        usuario_rede: 'joao',
        senha: '12345'
      };

      const result = createUsuarioSchema.safeParse(dados);
      expect(result.success).toBe(false);
      expect((result.error.errors || result.error.issues)[0].message).toContain('mínimo 6 caracteres');
    });
  });

  describe('updateUsuarioSchema', () => {
    it('deve validar atualização com todos os campos opcionais', () => {
      const result = updateUsuarioSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('deve validar atualização parcial', () => {
      const dados = {
        nome: 'Novo Nome'
      };

      const result = updateUsuarioSchema.safeParse(dados);
      expect(result.success).toBe(true);
    });

    it('deve validar status_usuario como número inteiro', () => {
      const dados = {
        status_usuario: 0
      };

      const result = updateUsuarioSchema.safeParse(dados);
      expect(result.success).toBe(true);
    });
  });

  describe('createEquipamentoSchema', () => {
    it('deve validar dados corretos de equipamento', () => {
      const dados = {
        nome: 'Notebook',
        modelo: 'Dell Latitude',
        numero_serie: 'SN123456',
        patrimonio: 'PAT001',
        usuario_id: 1
      };

      const result = createEquipamentoSchema.safeParse(dados);
      expect(result.success).toBe(true);
    });

    it('deve aceitar patrimonio como null', () => {
      const dados = {
        nome: 'Notebook',
        modelo: 'Dell',
        numero_serie: 'SN123',
        patrimonio: null,
        usuario_id: 1
      };

      const result = createEquipamentoSchema.safeParse(dados);
      expect(result.success).toBe(true);
    });

    it('deve aceitar local como opcional', () => {
      const dados = {
        nome: 'Notebook',
        modelo: 'Dell',
        numero_serie: 'SN123',
        usuario_id: 1
      };

      const result = createEquipamentoSchema.safeParse(dados);
      expect(result.success).toBe(true);
    });

    it('deve validar enum de status', () => {
      const dados = {
        nome: 'Notebook',
        modelo: 'Dell',
        numero_serie: 'SN123',
        status: 'NO_DEPOSITO',
        usuario_id: 1
      };

      const result = createEquipamentoSchema.safeParse(dados);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar status inválido', () => {
      const dados = {
        nome: 'Notebook',
        modelo: 'Dell',
        numero_serie: 'SN123',
        status: 'STATUS_INVALIDO',
        usuario_id: 1
      };

      const result = createEquipamentoSchema.safeParse(dados);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar sem usuario_id', () => {
      const dados = {
        nome: 'Notebook',
        modelo: 'Dell',
        numero_serie: 'SN123'
      };

      const result = createEquipamentoSchema.safeParse(dados);
      expect(result.success).toBe(false);
      expect((result.error.errors || result.error.issues)[0].message).toContain('ID do usuário responsável é obrigatório');
    });
  });

  describe('updateEquipamentoSchema', () => {
    it('deve aceitar todos os campos como opcionais', () => {
      const result = updateEquipamentoSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('deve validar atualização de status', () => {
      const dados = {
        status: 'DESCARTADO'
      };

      const result = updateEquipamentoSchema.safeParse(dados);
      expect(result.success).toBe(true);
    });
  });

  describe('createMovimentacaoSchema', () => {
    it('deve validar dados corretos de movimentação', () => {
      const dados = {
        equipamento_id: 1,
        tipo: 'SAIDA',
        usuario_id: 1,
        observacao: 'Teste'
      };

      const result = createMovimentacaoSchema.safeParse(dados);
      expect(result.success).toBe(true);
    });

    it('deve validar tipo ENTRADA', () => {
      const dados = {
        equipamento_id: 1,
        tipo: 'ENTRADA',
        usuario_id: 1
      };

      const result = createMovimentacaoSchema.safeParse(dados);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar tipo inválido', () => {
      const dados = {
        equipamento_id: 1,
        tipo: 'TIPO_INVALIDO',
        usuario_id: 1
      };

      const result = createMovimentacaoSchema.safeParse(dados);
      expect(result.success).toBe(false);
    });

    it('deve aceitar observacao como opcional', () => {
      const dados = {
        equipamento_id: 1,
        tipo: 'SAIDA',
        usuario_id: 1
      };

      const result = createMovimentacaoSchema.safeParse(dados);
      expect(result.success).toBe(true);
    });

    it('deve validar data_movimentacao como datetime ISO', () => {
      const dados = {
        equipamento_id: 1,
        tipo: 'SAIDA',
        usuario_id: 1,
        data_movimentacao: new Date().toISOString()
      };

      const result = createMovimentacaoSchema.safeParse(dados);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar sem equipamento_id', () => {
      const dados = {
        tipo: 'SAIDA',
        usuario_id: 1
      };

      const result = createMovimentacaoSchema.safeParse(dados);
      expect(result.success).toBe(false);
      expect((result.error.errors || result.error.issues)[0].message).toContain('ID do equipamento é obrigatório');
    });

    it('deve rejeitar sem tipo', () => {
      const dados = {
        equipamento_id: 1,
        usuario_id: 1
      };

      const result = createMovimentacaoSchema.safeParse(dados);
      expect(result.success).toBe(false);
      expect((result.error.errors || result.error.issues)[0].message).toContain('Tipo de movimentação');
    });

    it('deve rejeitar sem usuario_id', () => {
      const dados = {
        equipamento_id: 1,
        tipo: 'SAIDA'
      };

      const result = createMovimentacaoSchema.safeParse(dados);
      expect(result.success).toBe(false);
      expect((result.error.errors || result.error.issues)[0].message).toContain('ID do usuário é obrigatório');
    });
  });
});
