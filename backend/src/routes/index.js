const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const equipamentoRoutes = require('./equipamentoRoutes');
const movimentacaoRoutes = require('./movimentacaoRoutes');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * Arquivo central de rotas
 * Registra todas as rotas da aplicação com seus prefixos
 */

// Rotas públicas (sem autenticação)
router.use('/auth', authRoutes);

// Rotas protegidas (exigem autenticação JWT)
router.use('/usuarios', authMiddleware, usuarioRoutes);
router.use('/equipamentos', authMiddleware, equipamentoRoutes);
router.use('/movimentacoes', authMiddleware, movimentacaoRoutes);

module.exports = router;

