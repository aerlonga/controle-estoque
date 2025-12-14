const prisma = require('../models/prisma');

const movimentacaoService = {
    // Criar movimentação
    async criar(dados) {
        const { equipamento_id, tipo, usuario_id, observacao, data_movimentacao } = dados;

        // Validações
        if (!equipamento_id || isNaN(equipamento_id)) {
            throw new Error('ID do equipamento é obrigatório');
        }

        if (!tipo || !['ENTRADA', 'SAIDA'].includes(tipo)) {
            throw new Error('Tipo deve ser ENTRADA ou SAIDA');
        }

        if (!usuario_id || isNaN(usuario_id)) {
            throw new Error('ID do usuário é obrigatório');
        }

        // Verificar se equipamento existe
        const equipamento = await prisma.equipamento.findUnique({
            where: { id: parseInt(equipamento_id) }
        });

        if (!equipamento) {
            throw new Error('Equipamento não encontrado');
        }

        // Verificar se usuário existe
        const usuario = await prisma.usuario.findUnique({
            where: { id: parseInt(usuario_id) }
        });

        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

        // Criar movimentação
        const movimentacao = await prisma.movimentacao.create({
            data: {
                equipamento_id: parseInt(equipamento_id),
                tipo: tipo,
                usuario_id: parseInt(usuario_id),
                observacao: observacao ? observacao.trim() : null,
                data_movimentacao: data_movimentacao ? new Date(data_movimentacao) : new Date()
            },
            include: {
                equipamento: {
                    select: {
                        id: true,
                        patrimonio: true,
                        nome: true,
                        modelo: true,
                        numero_serie: true
                    }
                },
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        usuario_rede: true
                    }
                }
            }
        });

        // Atualizar status do equipamento baseado no tipo de movimentação
        const novoStatus = tipo === 'ENTRADA' ? 'NO_DEPOSITO' : 'FORA_DEPOSITO';

        await prisma.equipamento.update({
            where: { id: parseInt(equipamento_id) },
            data: { status: novoStatus }
        });

        return movimentacao;
    },

    // Listar todas as movimentações
    async listar(filtros = {}) {
        const { equipamento_id, tipo, usuario_id, data_inicio, data_fim } = filtros;

        const where = {};

        // Filtro por equipamento
        if (equipamento_id) {
            where.equipamento_id = parseInt(equipamento_id);
        }

        // Filtro por tipo
        if (tipo && ['ENTRADA', 'SAIDA'].includes(tipo)) {
            where.tipo = tipo;
        }

        // Filtro por usuário
        if (usuario_id) {
            where.usuario_id = parseInt(usuario_id);
        }

        // Filtro por data
        if (data_inicio || data_fim) {
            where.data_movimentacao = {};

            if (data_inicio) {
                where.data_movimentacao.gte = new Date(data_inicio);
            }

            if (data_fim) {
                where.data_movimentacao.lte = new Date(data_fim);
            }
        }

        const movimentacoes = await prisma.movimentacao.findMany({
            where,
            include: {
                equipamento: {
                    select: {
                        id: true,
                        patrimonio: true,
                        nome: true,
                        modelo: true,
                        numero_serie: true
                    }
                },
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        usuario_rede: true
                    }
                }
            },
            orderBy: {
                data_movimentacao: 'desc'
            }
        });

        return movimentacoes;
    },

    // Buscar movimentação por ID
    async buscarPorId(id) {
        const movimentacao = await prisma.movimentacao.findUnique({
            where: { id: parseInt(id) },
            include: {
                equipamento: {
                    select: {
                        id: true,
                        patrimonio: true,
                        nome: true,
                        modelo: true,
                        numero_serie: true,
                        status: true
                    }
                },
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        usuario_rede: true
                    }
                }
            }
        });

        if (!movimentacao) {
            throw new Error('Movimentação não encontrada');
        }

        return movimentacao;
    },

    // Listar movimentações por equipamento
    async listarPorEquipamento(equipamento_id) {
        const movimentacoes = await prisma.movimentacao.findMany({
            where: { equipamento_id: parseInt(equipamento_id) },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        usuario_rede: true
                    }
                }
            },
            orderBy: {
                data_movimentacao: 'desc'
            }
        });

        return movimentacoes;
    },

    // Listar movimentações por usuário
    async listarPorUsuario(usuario_id) {
        const movimentacoes = await prisma.movimentacao.findMany({
            where: { usuario_id: parseInt(usuario_id) },
            include: {
                equipamento: {
                    select: {
                        id: true,
                        patrimonio: true,
                        nome: true,
                        modelo: true,
                        numero_serie: true
                    }
                }
            },
            orderBy: {
                data_movimentacao: 'desc'
            }
        });

        return movimentacoes;
    }
};

module.exports = movimentacaoService;
