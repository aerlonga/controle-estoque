const express = require('express');
const router = express.Router();

const usuarioRoutes = require('./usuarioRoutes');

/**
 * Arquivo central de rotas
 * Registra todas as rotas da aplicação com seus prefixos
 */

// Registra rotas de usuários
router.use('/usuarios', usuarioRoutes);

// Futuras rotas:
// router.use('/equipamentos', equipamentoRoutes);
// router.use('/movimentacoes', movimentacaoRoutes);

module.exports = router;
