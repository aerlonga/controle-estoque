-- CreateEnum
CREATE TYPE "PerfilUsuario" AS ENUM ('USUARIO', 'ADMIN');

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "perfil" "PerfilUsuario" NOT NULL DEFAULT 'USUARIO';
