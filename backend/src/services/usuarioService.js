const prisma = require('../models/prisma');
const bcrypt = require('bcrypt');

class UsuarioService {
    /**
     * Criar novo usuário
     */
    async criar(dados) {
        if (!dados.nome || !dados.usuario_rede || !dados.senha) {
            throw new Error('Nome, usuário de rede e senha são obrigatórios');
        }
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { usuario_rede: dados.usuario_rede }
        });

        if (usuarioExistente) {
            throw new Error('Usuário de rede já cadastrado');
        }

        const senhaHash = await bcrypt.hash(dados.senha, 10);

        const usuario = await prisma.usuario.create({
            data: {
                nome: dados.nome,
                usuario_rede: dados.usuario_rede,
                senha_hash: senhaHash
            }
        });

        delete usuario.senha_hash;
        return usuario;
    }

    /**
     * Listar todos os usuários (com paginação)
     */
    async listar(page = 1, limit = 10) {
        const [data, meta] = await prisma.usuario
            .paginate({
                where: { status_usuario: 1 },
                select: {
                    id: true,
                    nome: true,
                    usuario_rede: true,
                    created_at: true
                },
                orderBy: { nome: 'asc' }
            })
            .withPages({
                limit,
                page,
                includePageCount: true
            });
        
        return { data, meta };
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
        await this.buscarPorId(id);

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

        if (dados.senha) {
            dados.senha_hash = await bcrypt.hash(dados.senha, 10);
            delete dados.senha;
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
        await this.buscarPorId(id);

        await prisma.usuario.update({
            where: { id: parseInt(id) },
            data: { status_usuario: 0 }
        });

        return { message: 'Usuário desativado com sucesso' };
    }
}

module.exports = new UsuarioService();
