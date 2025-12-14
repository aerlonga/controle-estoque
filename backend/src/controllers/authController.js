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

            res.cookie('token', resultado.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 8 * 60 * 60 * 1000 // 8 horas
            });

            return res.status(200).json(resultado);
        } catch (error) {
            return res.status(401).json({ error: error.message });
        }
    },

    /**
     * POST /api/auth/logout
     */
    async logout(req, res) {
        try {
            let token = req.cookies.token;

            if (!token && req.headers.authorization) {
                const parts = req.headers.authorization.split(' ');
                if (parts.length === 2) token = parts[1];
            }

            if (token) {
                await authService.blacklistToken(token);
            }

            res.clearCookie('token');
            return res.status(200).json({ message: 'Logout realizado com sucesso' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
};

module.exports = authController;
