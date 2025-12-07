const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

/**
 * Rotas de Usuários
 * Base: /api/usuarios
 */

// Criar novo usuário
router.post('/', usuarioController.criar);

// Listar todos os usuários
router.get('/', usuarioController.listar);

// Buscar usuário por ID
router.get('/:id', usuarioController.buscarPorId);

// Atualizar usuário
router.put('/:id', usuarioController.atualizar);

// Excluir usuário
router.delete('/:id', usuarioController.excluir);

module.exports = router;
