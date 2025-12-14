require('dotenv').config({ path: '.env.test' });
const { PrismaClient } = require('@prisma/client');
const prismaExtension = require('prisma-extension-pagination');

// Cliente Prisma para testes
const prisma = new PrismaClient().$extends(
  prismaExtension.paginate({
    pages: {
      limit: 10,
      includePageCount: true
    }
  })
);

module.exports = prisma;
