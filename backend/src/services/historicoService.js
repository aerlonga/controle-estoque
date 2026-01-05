const prisma = require('../models/prisma');

const historicoService = {
    async registrar(equipamento_id, usuario_id, acao, campo_alterado = null, valor_anterior = null, valor_novo = null) {
        return await prisma.historicoEquipamento.create({
            data: {
                equipamento_id: parseInt(equipamento_id),
                usuario_id: parseInt(usuario_id),
                acao,
                campo_alterado,
                valor_anterior: valor_anterior !== null ? String(valor_anterior) : null,
                valor_novo: valor_novo !== null ? String(valor_novo) : null,
            }
        });
    },

    async registrarMultiplos(registros) {
        return await prisma.historicoEquipamento.createMany({
            data: registros
        });
    },

    async listarPorEquipamento(equipamento_id, page = 1, limit = 50) {
        const [data, meta] = await prisma.historicoEquipamento
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
                    created_at: 'desc'
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

module.exports = historicoService;
