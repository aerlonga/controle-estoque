const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

const validate = require('../middlewares/validateSchema');
const { createUsuarioSchema, updateUsuarioSchema } = require('../validators/schemas');

/**
 * Rotas de Usuários
 * Base: /api/usuarios
 */

router.post('/', validate(createUsuarioSchema), usuarioController.criar);
router.get('/', usuarioController.listar);
router.get('/:id', usuarioController.buscarPorId);
router.put('/:id', validate(updateUsuarioSchema), usuarioController.atualizar);
router.delete('/:id', usuarioController.desativar);

module.exports = router;
