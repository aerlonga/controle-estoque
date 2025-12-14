const express = require('express');
const router = express.Router();
const movimentacaoController = require('../controllers/movimentacaoController');

// POST /api/movimentacoes - Criar movimentação
router.post('/', movimentacaoController.criar);

// GET /api/movimentacoes - Listar movimentações (com filtros opcionais)
router.get('/', movimentacaoController.listar);

// GET /api/movimentacoes/:id - Buscar movimentação por ID
router.get('/:id', movimentacaoController.buscarPorId);

// GET /api/movimentacoes/equipamento/:equipamento_id - Listar por equipamento
router.get('/equipamento/:equipamento_id', movimentacaoController.listarPorEquipamento);

// GET /api/movimentacoes/usuario/:usuario_id - Listar por usuário
router.get('/usuario/:usuario_id', movimentacaoController.listarPorUsuario);

module.exports = router;
