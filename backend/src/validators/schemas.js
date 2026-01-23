const { z } = require('zod');

// --- Auth Schemas ---
const loginSchema = z.object({
    usuario_rede: z.string().min(1, 'Usuário de rede é obrigatório').trim(),
    senha: z.string().min(1, 'Senha é obrigatória')
});

// --- Usuario Schemas ---
const createUsuarioSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').trim(),
    usuario_rede: z.string().min(3, 'Usuário de rede deve ter no mínimo 3 caracteres').trim(),
    senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    perfil: z.enum(['USUARIO', 'ADMIN']).optional()
});

const updateUsuarioSchema = z.object({
    nome: z.string().min(3).optional(),
    usuario_rede: z.string().min(3).optional(),
    senha: z.string().min(6).optional(),
    perfil: z.enum(['USUARIO', 'ADMIN']).optional(),
    status_usuario: z.number().int().optional()
});

// --- Equipamento Schemas ---
const createEquipamentoSchema = z.object({
    nome: z.string().min(2, 'Nome do equipamento é obrigatório').trim(),
    modelo: z.string().min(2, 'Modelo é obrigatório').trim(),
    patrimonio: z.string().regex(/^\d+$/, 'Patrimônio deve conter apenas números').optional().or(z.literal('')).nullable(),
    numero_serie: z.string().min(1, 'Número de série é obrigatório').trim(),
    // Status opcional na criação, assume default do banco se omitido
    status: z.enum(['NO_DEPOSITO', 'FORA_DEPOSITO', 'DESCARTADO']).optional(),
    local: z.string().optional().nullable(),
    usuario_id: z.number({ required_error: 'ID do usuário responsável é obrigatório' }).int()
});

const updateEquipamentoSchema = z.object({
    nome: z.string().min(2).optional(),
    modelo: z.string().min(2).optional(),
    patrimonio: z.string().regex(/^\d+$/, 'Patrimônio deve conter apenas números').optional().or(z.literal('')).nullable(),
    numero_serie: z.string().min(1).optional(),
    status: z.enum(['NO_DEPOSITO', 'FORA_DEPOSITO', 'DESCARTADO']).optional(),
    local: z.string().optional().nullable(),
    usuario_id: z.number().int().optional()
});

// --- Movimentacao Schemas ---
const createMovimentacaoSchema = z.object({
    equipamento_id: z.number({ required_error: 'ID do equipamento é obrigatório' }).int(),
    tipo: z.enum(['ENTRADA', 'SAIDA'], { required_error: 'Tipo de movimentação (ENTRADA/SAIDA) é obrigatório' }),
    usuario_id: z.number().int().optional(),
    observacao: z.string().optional().nullable(),
    data_movimentacao: z.string().datetime().optional()
});

module.exports = {
    loginSchema,
    createUsuarioSchema,
    updateUsuarioSchema,
    createEquipamentoSchema,
    updateEquipamentoSchema,
    createMovimentacaoSchema
};
