const prisma = require('../models/prisma');
const bcrypt = require('bcrypt');

class UsuarioService {
    /**
     * Criar novo usuário
     */
    async criar(dados) {
        // Validações de negócio
        if (!dados.nome || !dados.usuario_rede || !dados.senha_hash) {
            throw new Error('Nome, usuário de rede e senha são obrigatórios');
        }

        // Verifica se usuário já existe
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { usuario_rede: dados.usuario_rede }
        });

        if (usuarioExistente) {
            throw new Error('Usuário de rede já cadastrado');
        }

        // Criptografa senha
        const senhaHash = await bcrypt.hash(dados.senha_hash, 10);

        // Cria usuário
        const usuario = await prisma.usuario.create({
            data: {
                nome: dados.nome,
                usuario_rede: dados.usuario_rede,
                senha_hash: senhaHash
            }
        });

        // Remove senha do retorno
        delete usuario.senha_hash;
        return usuario;
    }

    /**
     * Listar todos os usuários
     */
    async listar() {
        const usuarios = await prisma.usuario.findMany({
            where: { status_usuario: 1 },
            select: {
                id: true,
                nome: true,
                usuario_rede: true,
                created_at: true
            },
            orderBy: { nome: 'asc' }
        });

        return usuarios;
    }

    /**
     * Buscar usuário por ID
     */
    async buscarPorId(id) {
        const usuario = await prisma.usuario.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                nome: true,
                usuario_rede: true,
                created_at: true
            }
        });

        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

        return usuario;
    }

    /**
     * Atualizar usuário
     */
    async atualizar(id, dados) {
        // Verifica se usuário existe
        await this.buscarPorId(id);

        // Se está mudando o usuario_rede, verifica se já existe
        if (dados.usuario_rede) {
            const usuarioExistente = await prisma.usuario.findFirst({
                where: {
                    usuario_rede: dados.usuario_rede,
                    NOT: { id: parseInt(id) }
                }
            });

            if (usuarioExistente) {
                throw new Error('Usuário de rede já cadastrado');
            }
        }

        // Se está atualizando senha, criptografa
        if (dados.senha_hash) {
            dados.senha_hash = await bcrypt.hash(dados.senha_hash, 10);
        }

        const usuario = await prisma.usuario.update({
            where: { id: parseInt(id) },
            data: dados,
            select: {
                id: true,
                nome: true,
                usuario_rede: true,
                created_at: true
            }
        });

        return usuario;
    }

    /**
     * Desativar usuário (soft delete)
     */
    async desativar(id) {
        // Verifica se usuário existe
        await this.buscarPorId(id);

        // Desativa o usuário
        await prisma.usuario.update({
            where: { id: parseInt(id) },
            data: { status_usuario: 0 }
        });

        return { message: 'Usuário desativado com sucesso' };
    }
}

module.exports = new UsuarioService();
