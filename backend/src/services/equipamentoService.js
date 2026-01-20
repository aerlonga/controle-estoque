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

        const usuarioExiste = await prisma.usuario.findUnique({
            where: { id: parseInt(usuario_id) }
        });

        if (!usuarioExiste) {
            throw new Error('Usuário não encontrado. Por favor, faça login novamente.');
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
        try {
            const { status, usuario_id, search, nome, modelo, numero_serie, patrimonio, local, created_at } = filtros;

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

            // Filtros individuais por campo
            if (nome && nome.trim()) {
                where.nome = { contains: nome.trim(), mode: 'insensitive' };
            }

            if (modelo && modelo.trim()) {
                where.modelo = { contains: modelo.trim(), mode: 'insensitive' };
            }

            if (numero_serie && numero_serie.trim()) {
                where.numero_serie = { contains: numero_serie.trim(), mode: 'insensitive' };
            }

            if (patrimonio && patrimonio.trim()) {
                where.patrimonio = { contains: patrimonio.trim(), mode: 'insensitive' };
            }

            if (local && local.trim()) {
                where.local = { contains: local.trim(), mode: 'insensitive' };
            }

            // Filtro por data de cadastro
            if (created_at) {
                const date = new Date(created_at);
                const nextDay = new Date(date);
                nextDay.setDate(nextDay.getDate() + 1);
                where.created_at = {
                    gte: date,
                    lt: nextDay
                };
            }

            // Busca genérica por texto em múltiplos campos (mantida para compatibilidade)
            if (search && search.trim()) {
                where.OR = [
                    { nome: { contains: search.trim(), mode: 'insensitive' } },
                    { modelo: { contains: search.trim(), mode: 'insensitive' } },
                    { numero_serie: { contains: search.trim(), mode: 'insensitive' } },
                    { patrimonio: { contains: search.trim(), mode: 'insensitive' } },
                    { local: { contains: search.trim(), mode: 'insensitive' } }
                ];
            }

            // Calcular total de registros correspondentes para preencher corretamente meta.total
            const totalCount = await prisma.equipamento.count({ where });

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
                        },
                        movimentacoes: {
                            take: 1,
                            orderBy: {
                                data_movimentacao: 'desc'
                            },
                            select: {
                                observacao: true
                            }
                        }
                    },
                    orderBy: {
                        created_at: 'desc'
                    }
                })
                .withPages({
                    limit: parseInt(limit),
                    page: parseInt(page),
                    includePageCount: true
                });

            // Normalizar e garantir formato consistente com total e totalPages corretos
            const normalizedMeta = meta || {};
            normalizedMeta.total = Number.isInteger(normalizedMeta.total) && normalizedMeta.total > 0
                ? normalizedMeta.total
                : totalCount;
            normalizedMeta.page = parseInt(page);
            normalizedMeta.limit = parseInt(limit);
            normalizedMeta.totalPages = normalizedMeta.totalPages || Math.max(1, Math.ceil(totalCount / parseInt(limit)));
            normalizedMeta.isFirstPage = normalizedMeta.page <= 1;
            normalizedMeta.isLastPage = normalizedMeta.page >= normalizedMeta.totalPages;

            return {
                data: Array.isArray(data) ? data : [],
                meta: normalizedMeta,
            };
        } catch (error) {
            console.error('Erro no equipamentoService.listarAtivos:', error);
            throw error;
        }
    },

    async listarTodos(filtros = {}) {
        try {
            const { status, usuario_id, search, nome, modelo, numero_serie, patrimonio, local, created_at } = filtros;

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

            // Filtros individuais por campo
            if (nome && nome.trim()) {
                where.nome = { contains: nome.trim(), mode: 'insensitive' };
            }

            if (modelo && modelo.trim()) {
                where.modelo = { contains: modelo.trim(), mode: 'insensitive' };
            }

            if (numero_serie && numero_serie.trim()) {
                where.numero_serie = { contains: numero_serie.trim(), mode: 'insensitive' };
            }

            if (patrimonio && patrimonio.trim()) {
                where.patrimonio = { contains: patrimonio.trim(), mode: 'insensitive' };
            }

            if (local && local.trim()) {
                where.local = { contains: local.trim(), mode: 'insensitive' };
            }

            // Filtro por data de cadastro
            if (created_at) {
                const date = new Date(created_at);
                const nextDay = new Date(date);
                nextDay.setDate(nextDay.getDate() + 1);
                where.created_at = {
                    gte: date,
                    lt: nextDay
                };
            }

            // Busca genérica por texto em múltiplos campos (mantida para compatibilidade)
            if (search && search.trim()) {
                where.OR = [
                    { nome: { contains: search.trim(), mode: 'insensitive' } },
                    { modelo: { contains: search.trim(), mode: 'insensitive' } },
                    { numero_serie: { contains: search.trim(), mode: 'insensitive' } },
                    { patrimonio: { contains: search.trim(), mode: 'insensitive' } },
                    { local: { contains: search.trim(), mode: 'insensitive' } }
                ];
            }

            const data = await prisma.equipamento.findMany({
                where,
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nome: true,
                            usuario_rede: true
                        }
                    },
                    movimentacoes: {
                        take: 1,
                        orderBy: {
                            data_movimentacao: 'desc'
                        },
                        select: {
                            observacao: true
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                }
            });

            return {
                data: Array.isArray(data) ? data : [],
                total: data.length
            };
        } catch (error) {
            console.error('Erro no equipamentoService.listarTodos:', error);
            throw error;
        }
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