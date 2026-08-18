-- CreateEnum
CREATE TYPE "EstadoConfirmacionWsp" AS ENUM ('PENDIENTE', 'ENVIADA', 'CONFIRMADA', 'CANCELADA', 'REAGENDAR_SOLICITADO', 'NO_ENTENDIDO');

-- CreateEnum
CREATE TYPE "DireccionMensajeWsp" AS ENUM ('SALIENTE', 'ENTRANTE');

-- DropForeignKey
ALTER TABLE "bitacora_auditoria" DROP CONSTRAINT "bitacora_auditoria_usuarioId_fkey";

-- AlterTable
ALTER TABLE "bitacora_auditoria" ALTER COLUMN "usuarioId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "citas" ADD COLUMN     "confirmacionEnviadaEn" TIMESTAMP(3),
ADD COLUMN     "estadoConfirmacionWsp" "EstadoConfirmacionWsp" NOT NULL DEFAULT 'PENDIENTE';

-- CreateTable
CREATE TABLE "mensajes_whatsapp" (
    "id" TEXT NOT NULL,
    "citaId" TEXT NOT NULL,
    "direccion" "DireccionMensajeWsp" NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "twilioSid" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensajes_whatsapp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mensajes_whatsapp_citaId_idx" ON "mensajes_whatsapp"("citaId");

-- AddForeignKey
ALTER TABLE "bitacora_auditoria" ADD CONSTRAINT "bitacora_auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes_whatsapp" ADD CONSTRAINT "mensajes_whatsapp_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "citas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
