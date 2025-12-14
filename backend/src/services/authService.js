const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const prisma = require('../models/prisma');

const authService = {
    /**
     * Fazer login e gerar token JWT
     */
    async login(usuario_rede, senha) {
        // Validações
        if (!usuario_rede || !senha) {
            throw new Error('Usuário de rede e senha são obrigatórios');
        }

        // Buscar usuário
        const usuario = await prisma.usuario.findUnique({
            where: { usuario_rede: usuario_rede.trim() }
        });

        if (!usuario) {
            throw new Error('Credenciais inválidas');
        }

        // Verificar se usuário está ativo
        if (usuario.status_usuario !== 1) {
            throw new Error('Usuário desativado');
        }

        // Verificar senha
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaValida) {
            throw new Error('Credenciais inválidas');
        }

        // Gerar token JWT
        const token = jwt.sign(
            {
                id: usuario.id,
                usuario_rede: usuario.usuario_rede,
                nome: usuario.nome
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '8h'
            }
        );

        // Retornar token e dados do usuário (sem senha)
        return {
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                usuario_rede: usuario.usuario_rede,
                created_at: usuario.created_at
            }
        };
    },

    /**
     * Verificar e decodificar token JWT
     */
    verificarToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return decoded;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token expirado');
            }
            if (error.name === 'JsonWebTokenError') {
                throw new Error('Token inválido');
            }
            throw new Error('Erro ao verificar token');
        }
    }
};

module.exports = authService;
