const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * Rotas de autenticação (públicas, sem middleware)
 */

// POST /api/auth/login - Login do usuário
router.post('/login', authController.login);

module.exports = router;
