const equipamentoService = require('../services/equipamentoService');

const equipamentoController = {
    async criar(req, res) {
        try {
            const equipamento = await equipamentoService.criar(req.body);
            return res.status(201).json(equipamento);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },
    async listarAtivos(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const filtros = {
                status: req.query.status,
                usuario_id: req.query.usuario_id
            };

            const result = await equipamentoService.listarAtivos(filtros, page, limit);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },
    async buscarPorId(req, res) {
        try {
            const equipamento = await equipamentoService.buscarPorId(req.params.id);
            return res.status(200).json(equipamento);
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }
    },
    async atualizar(req, res) {
        try {
            const equipamento = await equipamentoService.atualizar(req.params.id, req.body);
            return res.status(200).json(equipamento);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },
    async descartar(req, res) {
        try {
            const resultado = await equipamentoService.descartar(req.params.id);
            return res.status(200).json(resultado);
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }
    }


};

module.exports = equipamentoController;
