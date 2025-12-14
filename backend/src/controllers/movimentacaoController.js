const movimentacaoService = require('../services/movimentacaoService');

const movimentacaoController = {
    async criar(req, res) {
        try {
            const dados = {
                ...req.body,
                usuario_id: req.user.id
            };

            const movimentacao = await movimentacaoService.criar(dados);
            return res.status(201).json(movimentacao);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },

    // GET /api/movimentacoes
    async listar(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const filtros = {
                equipamento_id: req.query.equipamento_id,
                tipo: req.query.tipo,
                usuario_id: req.query.usuario_id,
                data_inicio: req.query.data_inicio,
                data_fim: req.query.data_fim
            };

            const result = await movimentacaoService.listar(filtros, page, limit);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    // GET /api/movimentacoes/:id
    async buscarPorId(req, res) {
        try {
            const movimentacao = await movimentacaoService.buscarPorId(req.params.id);
            return res.status(200).json(movimentacao);
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }
    },

    // GET /api/movimentacoes/equipamento/:equipamento_id
    async listarPorEquipamento(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await movimentacaoService.listarPorEquipamento(req.params.equipamento_id, page, limit);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    // GET /api/movimentacoes/usuario/:usuario_id
    async listarPorUsuario(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await movimentacaoService.listarPorUsuario(req.params.usuario_id, page, limit);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
};

module.exports = movimentacaoController;
