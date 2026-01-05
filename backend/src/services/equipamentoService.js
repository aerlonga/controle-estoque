const prisma = require('../models/prisma');

const equipamentoService = {
    async criar(dados) {
        const { patrimonio, nome, modelo, numero_serie, local, usuario_id } = dados;

        if (!nome || nome.trim().length < 3) {
            throw new Error('Nome deve ter pelo menos 3 caracteres');
        }

        if (!modelo || modelo.trim().length < 2) {
            throw new Error('Modelo deve ter pelo menos 2 caracteres');
        }

        if (!numero_serie || numero_serie.trim().length < 3) {
            throw new Error('Número de série deve ter pelo menos 3 caracteres');
        }

        if (!usuario_id || isNaN(usuario_id)) {
            throw new Error('ID do usuário é obrigatório');
        }

        const existente = await prisma.equipamento.findUnique({
            where: { numero_serie: numero_serie }
        })

        if (existente) {
            throw new Error('Número de série já cadastrado');
        }

        const equipamento = await prisma.equipamento.create({
            data: {
                patrimonio: patrimonio ? patrimonio.trim() : null,
                nome: nome.trim(),
                modelo: modelo.trim(),
                numero_serie: numero_serie.trim(),
                local: local ? local.trim() : null,
                usuario_id: parseInt(usuario_id),
                status: 'NO_DEPOSITO',
            },

            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        usuario_rede: true
                    }
                }
            }
        });

        return equipamento;
    },

    async listarAtivos(filtros = {}, page = 1, limit = 10) {
        const { status, usuario_id } = filtros;

        const where = {
            status: {
                not: 'DESCARTADO'
            }
        };

        if (status && ['NO_DEPOSITO', 'FORA_DEPOSITO'].includes(status)) {
            where.status = status;
        }

        if (usuario_id) {
            where.usuario_id = parseInt(usuario_id);
        }

        const [data, meta] = await prisma.equipamento
            .paginate({
                where,
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
                    created_at: 'desc'
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
        const equipamento = await prisma.equipamento.findUnique({
            where: { id: parseInt(id) },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        usuario_rede: true
                    }
                },

                movimentacoes: {
                    orderBy: {
                        data_movimentacao: 'desc'
                    },
                    take: 5
                }
            }
        });

        if (!equipamento) {
            throw new Error('Equipamento não encontrado');
        }

        return equipamento;
    },

    async atualizar(id, dados) {
        const { patrimonio, nome, modelo, numero_serie, status, local, usuario_id } = dados;

        await this.buscarPorId(id);

        if (numero_serie) {
            const existente = await prisma.equipamento.findFirst({
                where: {
                    numero_serie: numero_serie.trim(),
                    NOT: { id: parseInt(id) }
                }
            });

            if (existente) {
                throw new Error('Número de série já cadastrado em outro equipamento');
            }
        }

        const dadosAtualizacao = {};

        if (patrimonio !== undefined) dadosAtualizacao.patrimonio = patrimonio ? patrimonio.trim() : null;
        if (nome) dadosAtualizacao.nome = nome.trim();
        if (modelo) dadosAtualizacao.modelo = modelo.trim();
        if (numero_serie) dadosAtualizacao.numero_serie = numero_serie.trim();
        if (status) dadosAtualizacao.status = status;
        if (local !== undefined) dadosAtualizacao.local = local ? local.trim() : null;

        const equipamentoAtualizado = await prisma.equipamento.update({
            where: { id: parseInt(id) },
            data: dadosAtualizacao,
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        usuario_rede: true
                    }
                }
            }
        });

        return equipamentoAtualizado;
    },

    async descartar(id) {
        await this.buscarPorId(id);

        await prisma.equipamento.update({
            where: { id: parseInt(id) },
            data: { status: 'DESCARTADO' }
        });

        return { message: 'Equipamento descartado com sucesso' };
    }
};
module.exports = equipamentoService;