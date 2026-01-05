const prisma = require('../models/prisma');

const movimentacaoService = {
    async criar(dados) {
        const { equipamento_id, tipo, usuario_id, observacao, data_movimentacao } = dados;

        if (!equipamento_id || isNaN(equipamento_id)) {
            throw new Error('ID do equipamento é obrigatório');
        }

        if (!tipo || !['ENTRADA', 'SAIDA'].includes(tipo)) {
            throw new Error('Tipo deve ser ENTRADA ou SAIDA');
        }

        if (!usuario_id || isNaN(usuario_id)) {
            throw new Error('ID do usuário é obrigatório');
        }

        const equipamento = await prisma.equipamento.findUnique({
            where: { id: parseInt(equipamento_id) }
        });

        if (!equipamento) {
            throw new Error('Equipamento não encontrado');
        }

        const currentStatus = equipamento.status;

        if (currentStatus === 'DESCARTADO') {
            throw new Error('Não é possível movimentar equipamento descartado');
        }

        if (tipo === 'SAIDA' && currentStatus !== 'NO_DEPOSITO') {
            throw new Error('Equipamento deve estar NO_DEPOSITO para realizar SAIDA');
        }

        if (tipo === 'ENTRADA' && currentStatus !== 'FORA_DEPOSITO') {
            throw new Error('Equipamento deve estar FORA_DEPOSITO para realizar ENTRADA');
        }

        const usuario = await prisma.usuario.findUnique({
            where: { id: parseInt(usuario_id) }
        });

        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

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

        const novoStatus = tipo === 'ENTRADA' ? 'NO_DEPOSITO' : 'FORA_DEPOSITO';

        await prisma.equipamento.update({
            where: { id: parseInt(equipamento_id) },
            data: { status: novoStatus }
        });

        return movimentacao;
    },

    async listar(filtros = {}, page = 1, limit = 10) {
        const { equipamento_id, tipo, usuario_id, data_inicio, data_fim } = filtros;

        const where = {};

        if (equipamento_id) {
            where.equipamento_id = parseInt(equipamento_id);
        }
        if (tipo && ['ENTRADA', 'SAIDA'].includes(tipo)) {
            where.tipo = tipo;
        }
        if (usuario_id) {
            where.usuario_id = parseInt(usuario_id);
        }
        if (data_inicio || data_fim) {
            where.data_movimentacao = {};

            if (data_inicio) {
                where.data_movimentacao.gte = new Date(data_inicio);
            }

            if (data_fim) {
                where.data_movimentacao.lte = new Date(data_fim);
            }
        }

        const [data, meta] = await prisma.movimentacao
            .paginate({
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
            })
            .withPages({
                limit,
                page,
                includePageCount: true
            });
        
        return { data, meta };
    },

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

    async listarPorEquipamento(equipamento_id, page = 1, limit = 10) {
        const [data, meta] = await prisma.movimentacao
            .paginate({
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
            })
            .withPages({
                limit,
                page,
                includePageCount: true
            });
        
        return { data, meta };
    },

    async listarPorUsuario(usuario_id, page = 1, limit = 10) {
        const [data, meta] = await prisma.movimentacao
            .paginate({
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
            })
            .withPages({
                limit,
                page,
                includePageCount: true
            });
        
        return { data, meta };
    }
};

module.exports = movimentacaoService;
