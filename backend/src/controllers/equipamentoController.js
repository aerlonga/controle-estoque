const equipamentoService = require('../services/equipamentoService');
const { getPaginationParams, createPaginatedResponse } = require('../utils/pagination');

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
            const { page, limit, skip } = getPaginationParams(req.query);
            const { data, total } = await equipamentoService.listarAtivos({ skip, limit });
            return res.status(200).json(createPaginatedResponse(data, total, page, limit));
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
