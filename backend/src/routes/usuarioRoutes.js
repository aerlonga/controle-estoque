const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

/**
 * Rotas de Usuários
 * Base: /api/usuarios
 */

router.post('/', usuarioController.criar);
router.get('/', usuarioController.listar);
router.get('/:id', usuarioController.buscarPorId);
router.put('/:id', usuarioController.atualizar);
router.delete('/:id', usuarioController.desativar);

module.exports = router;
