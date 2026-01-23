const usuarioService = require('../services/usuarioService');

class UsuarioController {
    async criar(req, res) {
        try {
            const usuario = await usuarioService.criar(req.body);
            return res.status(201).json({ data: usuario });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async listar(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filtros = {};
            if (req.query.nome) filtros.nome = req.query.nome;
            if (req.query.usuario_rede) filtros.usuario_rede = req.query.usuario_rede;
            if (req.query.perfil) filtros.perfil = req.query.perfil;

            const result = await usuarioService.listar(page, limit, filtros);

            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const usuario = await usuarioService.buscarPorId(req.params.id);
            return res.status(200).json({ data: usuario });
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }
    }

    async atualizar(req, res) {
        try {
            const usuario = await usuarioService.atualizar(req.params.id, req.body);
            return res.status(200).json({ data: usuario });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async desativar(req, res) {
        try {
            const resultado = await usuarioService.desativar(req.params.id);
            return res.status(200).json(resultado);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new UsuarioController();
