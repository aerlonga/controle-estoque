CREATE TYPE "StatusEquipamento" AS ENUM ('NO_DEPOSITO', 'FORA_DEPOSITO', 'DESCARTADO');

CREATE TYPE "TipoMovimentacao" AS ENUM ('ENTRADA', 'SAIDA');

CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "usuario_rede" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "equipamentos" (
    "id" SERIAL NOT NULL,
    "patrimonio" TEXT,
    "nome" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "numero_serie" TEXT NOT NULL,
    "status" "StatusEquipamento" NOT NULL DEFAULT 'NO_DEPOSITO',
    "local" TEXT,
    "usuario_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipamentos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "movimentacoes" (
    "id" SERIAL NOT NULL,
    "equipamento_id" INTEGER NOT NULL,
    "tipo" "TipoMovimentacao" NOT NULL,
    "data_movimentacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" INTEGER NOT NULL,
    "observacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacoes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "usuarios_usuario_rede_key" ON "usuarios"("usuario_rede");

CREATE UNIQUE INDEX "equipamentos_numero_serie_key" ON "equipamentos"("numero_serie");

ALTER TABLE "equipamentos" ADD CONSTRAINT "equipamentos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "movimentacoes" ADD CONSTRAINT "movimentacoes_equipamento_id_fkey" FOREIGN KEY ("equipamento_id") REFERENCES "equipamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "movimentacoes" ADD CONSTRAINT "movimentacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
