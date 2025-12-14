const authService = require('../services/authService');

const authController = {
    /**
     * POST /api/auth/login
     * Login e geração de token JWT
     */
    async login(req, res) {
        try {
            const { usuario_rede, senha } = req.body;

            const resultado = await authService.login(usuario_rede, senha);

            return res.status(200).json(resultado);
        } catch (error) {
            return res.status(401).json({ error: error.message });
        }
    }
};

module.exports = authController;
