const { PrismaClient } = require('@prisma/client');

/**
 * Inicialização do Prisma Client v7
 * A URL é configurada via prisma.config.ts
 */
const prisma = new PrismaClient();

module.exports = prisma;
