const equipamentoService = require('../services/equipamentoService');

const equipamentoController = {
    async criar(req, res) {
        try {
            const equipamento = await equipamentoService.criar(req.body);
            return res.status(201).json({ data: equipamento });
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
                usuario_id: req.query.usuario_id,
                search: req.query.search
            };

            const result = await equipamentoService.listarAtivos(filtros, page, limit);

            // Garantir que a resposta sempre tenha data e meta
            return res.status(200).json({
                data: result.data || [],
                meta: result.meta || {
                    total: 0,
                    page: page,
                    limit: limit,
                    totalPages: 0
                }
            });
        } catch (error) {
            console.error('Erro ao listar equipamentos:', error);
            return res.status(500).json({
                error: error.message,
                data: [],
                meta: { total: 0, page: 1, limit: 10, totalPages: 0 }
            });
        }
    },
    async listarTodos(req, res) {
        try {
            const filtros = {
                status: req.query.status,
                usuario_id: req.query.usuario_id,
                search: req.query.search
            };

            const result = await equipamentoService.listarTodos(filtros);

            return res.status(200).json({
                data: result.data || [],
                total: result.total || 0
            });
        } catch (error) {
            console.error('Erro ao listar todos os equipamentos:', error);
            return res.status(500).json({
                error: error.message,
                data: [],
                total: 0
            });
        }
    },
    async buscarPorId(req, res) {
        try {
            const equipamento = await equipamentoService.buscarPorId(req.params.id);
            return res.status(200).json({ data: equipamento });
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }
    },
    async atualizar(req, res) {
        try {
            const usuario_id_logado = req.user.id; // Extrai ID do usuário autenticado
            const equipamento = await equipamentoService.atualizar(req.params.id, req.body, usuario_id_logado);
            return res.status(200).json({ data: equipamento });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },
    async descartar(req, res) {
        try {
            const usuario_id_logado = req.user.id; // Extrai ID do usuário autenticado
            const resultado = await equipamentoService.descartar(req.params.id, usuario_id_logado);
            return res.status(200).json({ data: resultado });
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }
    }


};

module.exports = equipamentoController;
