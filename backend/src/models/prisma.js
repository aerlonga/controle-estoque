const { PrismaClient } = require('@prisma/client');
const { pagination } = require('prisma-extension-pagination');

/**
 * Inicialização do Prisma Client com pagination extension
 */
const prisma = new PrismaClient().$extends(
    pagination({
        pages: {
            limit: 10,
            includePageCount: true
        }
    })
);

module.exports = prisma;
