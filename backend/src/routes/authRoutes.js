const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middlewares/validateSchema');
const { loginSchema } = require('../validators/schemas');

/**
 * Rotas de autenticação (públicas)
 */

// POST /api/auth/login - Login do usuário
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);

module.exports = router;
