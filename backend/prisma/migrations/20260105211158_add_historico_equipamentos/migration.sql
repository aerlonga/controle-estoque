-- CreateTable
CREATE TABLE "historico_equipamentos" (
    "id" SERIAL NOT NULL,
    "equipamento_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "acao" TEXT NOT NULL,
    "campo_alterado" TEXT,
    "valor_anterior" TEXT,
    "valor_novo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_equipamentos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "historico_equipamentos" ADD CONSTRAINT "historico_equipamentos_equipamento_id_fkey" FOREIGN KEY ("equipamento_id") REFERENCES "equipamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_equipamentos" ADD CONSTRAINT "historico_equipamentos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
