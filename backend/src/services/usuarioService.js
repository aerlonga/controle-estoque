const prisma = require('../models/prisma');
const bcrypt = require('bcrypt');

class UsuarioService {
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
                senha_hash: senhaHash,
                perfil: dados.perfil
            }
        });

        delete usuario.senha_hash;
        return usuario;
    }

    async listar(page = 1, limit = 10, filtros = {}) {
        const where = { status_usuario: 1 };

        if (filtros.nome) {
            where.nome = { contains: filtros.nome, mode: 'insensitive' };
        }
        if (filtros.usuario_rede) {
            where.usuario_rede = { contains: filtros.usuario_rede, mode: 'insensitive' };
        }
        if (filtros.perfil) {
            where.perfil = filtros.perfil;
        }

        const [data, meta] = await prisma.usuario
            .paginate({
                where,
                select: {
                    id: true,
                    nome: true,
                    usuario_rede: true,
                    perfil: true,
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

    async buscarPorId(id) {
        const usuario = await prisma.usuario.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                nome: true,
                usuario_rede: true,
                perfil: true,
                created_at: true
            }
        });

        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

        return usuario;
    }

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
                perfil: true,
                created_at: true
            }
        });

        return usuario;
    }

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
