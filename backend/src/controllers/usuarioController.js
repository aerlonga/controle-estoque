const usuarioService = require('../services/usuarioService');

/**
 * Controller de Usuário
 * Responsável por receber requisições, validar entrada e retornar respostas HTTP
 */
class UsuarioController {
    /**
     * POST /usuarios
     * Criar novo usuário
     */
    async criar(req, res) {
        try {
            const usuario = await usuarioService.criar(req.body);
            return res.status(201).json(usuario);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    /**
     * GET /usuarios
     * Listar todos os usuários
     */
    async listar(req, res) {
        try {
            const usuarios = await usuarioService.listar();
            return res.status(200).json(usuarios);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    /**
     * GET /usuarios/:id
     * Buscar usuário por ID
     */
    async buscarPorId(req, res) {
        try {
            const usuario = await usuarioService.buscarPorId(req.params.id);
            return res.status(200).json(usuario);
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }
    }

    /**
     * PUT /usuarios/:id
     * Atualizar usuário
     */
    async atualizar(req, res) {
        try {
            const usuario = await usuarioService.atualizar(req.params.id, req.body);
            return res.status(200).json(usuario);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    /**
     * DELETE /usuarios/:id
     * Excluir usuário
     */
    async excluir(req, res) {
        try {
            const resultado = await usuarioService.excluir(req.params.id);
            return res.status(200).json(resultado);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new UsuarioController();
