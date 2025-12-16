const authService = require('../services/authService');

/**
 * Middleware para verificar JWT em requisições
 */
const authMiddleware = async (req, res, next) => {
    try {
        let token = req.cookies.token;

        if (!token) {
            const authHeader = req.headers.authorization;

            if (authHeader) {
                const parts = authHeader.split(' ');

                if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
                    token = parts[1];
                }
            }
        }

        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        const decoded = await authService.verificarToken(token);

        req.user = {
            id: decoded.id,
            usuario_rede: decoded.usuario_rede,
            nome: decoded.nome
        };

        return next();
    } catch (error) {
        return res.status(401).json({ error: error.message });
    }
};

module.exports = authMiddleware;
