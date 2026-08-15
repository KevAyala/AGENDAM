-- CreateEnum
CREATE TYPE "TipoTurno" AS ENUM ('CITA_AGENDADA', 'APLICACION', 'SIN_CITA');

-- CreateEnum
CREATE TYPE "EstadoTurno" AS ENUM ('EN_ESPERA', 'EN_ATENCION', 'COMPLETADO', 'CANCELADO', 'NO_ASISTIO');

-- CreateEnum
CREATE TYPE "EstatusListaEspera" AS ENUM ('EN_ESPERA', 'ASIGNADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "turnos" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "medicoId" TEXT NOT NULL,
    "citaId" TEXT,
    "tipo" "TipoTurno" NOT NULL,
    "estado" "EstadoTurno" NOT NULL DEFAULT 'EN_ESPERA',
    "horaLlegada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "horaInicioEspera" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "horaInicioAtencion" TIMESTAMP(3),
    "horaFinAtencion" TIMESTAMP(3),
    "montoACobrar" DECIMAL(10,2),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lista_espera" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estatus" "EstatusListaEspera" NOT NULL DEFAULT 'EN_ESPERA',

    CONSTRAINT "lista_espera_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "turnos_citaId_key" ON "turnos"("citaId");

-- CreateIndex
CREATE INDEX "turnos_medicoId_estado_idx" ON "turnos"("medicoId", "estado");

-- CreateIndex
CREATE INDEX "turnos_pacienteId_idx" ON "turnos"("pacienteId");

-- CreateIndex
CREATE INDEX "lista_espera_estatus_idx" ON "lista_espera"("estatus");

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "citas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lista_espera" ADD CONSTRAINT "lista_espera_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
