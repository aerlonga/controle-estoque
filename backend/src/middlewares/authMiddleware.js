const authService = require('../services/authService');

/**
 * Middleware para verificar JWT em requisições
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Pegar token do header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        // O formato esperado é: "Bearer TOKEN"
        const parts = authHeader.split(' ');

        if (parts.length !== 2) {
            return res.status(401).json({ error: 'Token mal formatado' });
        }

        const [scheme, token] = parts;

        if (!/^Bearer$/i.test(scheme)) {
            return res.status(401).json({ error: 'Token mal formatado' });
        }

        // Verificar token
        const decoded = authService.verificarToken(token);

        // Anexar usuário decodificado ao request
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
