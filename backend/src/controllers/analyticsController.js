const analyticsService = require('../services/analyticsService');

const analyticsController = {
    async getMovimentacoesAnalytics(req, res) {
        try {
            const { periodo, data_inicio, data_fim } = req.query;

            // Validar período se fornecido
            if (periodo && !['7', '15', '30'].includes(periodo)) {
                return res.status(400).json({
                    success: false,
                    message: 'Período inválido. Use 7, 15 ou 30 dias.'
                });
            }

            // Validar datas customizadas
            if ((data_inicio && !data_fim) || (!data_inicio && data_fim)) {
                return res.status(400).json({
                    success: false,
                    message: 'Informe data_inicio e data_fim para período personalizado.'
                });
            }

            const analytics = await analyticsService.getMovimentacoesAnalytics({
                periodo,
                data_inicio,
                data_fim
            });

            res.json({
                success: true,
                data: analytics
            });
        } catch (error) {
            console.error('Erro ao buscar analytics de movimentações:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao processar analytics de movimentações',
                error: error.message
            });
        }
    },

    async getEquipamentosAnalytics(req, res) {
        try {
            const analytics = await analyticsService.getEquipamentosAnalytics();

            res.json({
                success: true,
                data: analytics
            });
        } catch (error) {
            console.error('Erro ao buscar analytics de equipamentos:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao processar analytics de equipamentos',
                error: error.message
            });
        }
    }
};

module.exports = analyticsController;
