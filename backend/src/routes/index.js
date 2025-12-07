const express = require('express');
const router = express.Router();

// Importa rotas de cada módulo
const usuarioRoutes = require('./usuarioRoutes');

/**
 * Arquivo central de rotas
 * Registra todas as rotas da aplicação com seus prefixos
 */

// Rota de teste
router.get('/', (req, res) => {
    res.json({
        message: 'API Controle de Estoque',
        version: '1.0.0',
        endpoints: {
            usuarios: '/api/usuarios'
        }
    });
});

// Registra rotas de usuários
router.use('/usuarios', usuarioRoutes);

// Futuras rotas:
// router.use('/equipamentos', equipamentoRoutes);
// router.use('/movimentacoes', movimentacaoRoutes);

module.exports = router;
