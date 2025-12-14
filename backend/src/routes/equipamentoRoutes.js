const express = require('express');
const router = express.Router();
const equipamentoController = require('../controllers/equipamentoController');

router.post('/', equipamentoController.criar);
router.get('/', equipamentoController.listarAtivos);
router.get('/:id', equipamentoController.buscarPorId);
router.put('/:id', equipamentoController.atualizar);
router.delete('/:id', equipamentoController.descartar);

module.exports = router;