const movimentacaoService = require('../services/movimentacaoService');

const movimentacaoController = {
    // POST /api/movimentacoes
    async criar(req, res) {
        try {
            // Pegar usuario_id do usuário autenticado (JWT)
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
            const filtros = {
                equipamento_id: req.query.equipamento_id,
                tipo: req.query.tipo,
                usuario_id: req.query.usuario_id,
                data_inicio: req.query.data_inicio,
                data_fim: req.query.data_fim
            };

            const movimentacoes = await movimentacaoService.listar(filtros);
            return res.status(200).json(movimentacoes);
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
            const movimentacoes = await movimentacaoService.listarPorEquipamento(req.params.equipamento_id);
            return res.status(200).json(movimentacoes);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    // GET /api/movimentacoes/usuario/:usuario_id
    async listarPorUsuario(req, res) {
        try {
            const movimentacoes = await movimentacaoService.listarPorUsuario(req.params.usuario_id);
            return res.status(200).json(movimentacoes);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
};

module.exports = movimentacaoController;
