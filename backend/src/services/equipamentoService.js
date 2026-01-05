const prisma = require('../models/prisma');
const historicoService = require('./historicoService');

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

        // Registrar histórico de cadastro
        await historicoService.registrar(equipamento.id, usuario_id, 'CADASTRO');

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

    async atualizar(id, dados, usuario_id_logado) {
        const { patrimonio, nome, modelo, numero_serie, local } = dados;

        const equipamentoAnterior = await this.buscarPorId(id);

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

        const dadosAtualizacao = {
            usuario_id: parseInt(usuario_id_logado) // Atualiza responsável para quem editou
        };
        const historicoRegistros = [];

        // Comparar e registrar mudanças
        if (patrimonio !== undefined && patrimonio !== equipamentoAnterior.patrimonio) {
            dadosAtualizacao.patrimonio = patrimonio ? patrimonio.trim() : null;
            historicoRegistros.push({
                equipamento_id: parseInt(id),
                usuario_id: parseInt(usuario_id_logado),
                acao: 'EDICAO',
                campo_alterado: 'patrimonio',
                valor_anterior: equipamentoAnterior.patrimonio,
                valor_novo: dadosAtualizacao.patrimonio
            });
        }

        if (nome && nome !== equipamentoAnterior.nome) {
            dadosAtualizacao.nome = nome.trim();
            historicoRegistros.push({
                equipamento_id: parseInt(id),
                usuario_id: parseInt(usuario_id_logado),
                acao: 'EDICAO',
                campo_alterado: 'nome',
                valor_anterior: equipamentoAnterior.nome,
                valor_novo: dadosAtualizacao.nome
            });
        }

        if (modelo && modelo !== equipamentoAnterior.modelo) {
            dadosAtualizacao.modelo = modelo.trim();
            historicoRegistros.push({
                equipamento_id: parseInt(id),
                usuario_id: parseInt(usuario_id_logado),
                acao: 'EDICAO',
                campo_alterado: 'modelo',
                valor_anterior: equipamentoAnterior.modelo,
                valor_novo: dadosAtualizacao.modelo
            });
        }

        if (numero_serie && numero_serie !== equipamentoAnterior.numero_serie) {
            dadosAtualizacao.numero_serie = numero_serie.trim();
            historicoRegistros.push({
                equipamento_id: parseInt(id),
                usuario_id: parseInt(usuario_id_logado),
                acao: 'EDICAO',
                campo_alterado: 'numero_serie',
                valor_anterior: equipamentoAnterior.numero_serie,
                valor_novo: dadosAtualizacao.numero_serie
            });
        }

        if (local !== undefined && local !== equipamentoAnterior.local) {
            dadosAtualizacao.local = local ? local.trim() : null;
            historicoRegistros.push({
                equipamento_id: parseInt(id),
                usuario_id: parseInt(usuario_id_logado),
                acao: 'EDICAO',
                campo_alterado: 'local',
                valor_anterior: equipamentoAnterior.local,
                valor_novo: dadosAtualizacao.local
            });
        }

        // Registrar mudança de responsável
        if (parseInt(usuario_id_logado) !== equipamentoAnterior.usuario_id) {
            historicoRegistros.push({
                equipamento_id: parseInt(id),
                usuario_id: parseInt(usuario_id_logado),
                acao: 'EDICAO',
                campo_alterado: 'usuario_id',
                valor_anterior: String(equipamentoAnterior.usuario_id),
                valor_novo: String(usuario_id_logado)
            });
        }

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

        // Registrar histórico de todas as mudanças
        if (historicoRegistros.length > 0) {
            await historicoService.registrarMultiplos(historicoRegistros);
        }

        return equipamentoAtualizado;
    },

    async descartar(id, usuario_id_logado) {
        const equipamentoAnterior = await this.buscarPorId(id);

        await prisma.equipamento.update({
            where: { id: parseInt(id) },
            data: { status: 'DESCARTADO' }
        });

        // Registrar histórico de descarte
        await historicoService.registrar(
            id,
            usuario_id_logado,
            'DESCARTE',
            'status',
            equipamentoAnterior.status,
            'DESCARTADO'
        );

        return { message: 'Equipamento descartado com sucesso' };
    }
};
module.exports = equipamentoService;