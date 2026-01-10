const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// GET /api/analytics/movimentacoes?periodo=30
// GET /api/analytics/movimentacoes?data_inicio=2026-01-01&data_fim=2026-01-10
router.get('/movimentacoes', analyticsController.getMovimentacoesAnalytics);

// GET /api/analytics/equipamentos
router.get('/equipamentos', analyticsController.getEquipamentosAnalytics);

module.exports = router;
