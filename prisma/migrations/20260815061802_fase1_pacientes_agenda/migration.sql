-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('AGENDADA', 'CONFIRMADA', 'REPROGRAMADA', 'CANCELADA', 'COMPLETADA', 'NO_ASISTIO');

-- CreateTable
CREATE TABLE "pacientes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3),
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_consulta" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "duracionMin" INTEGER NOT NULL,
    "requiereAgenda" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tipos_consulta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horarios_medico" (
    "id" TEXT NOT NULL,
    "medicoId" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,

    CONSTRAINT "horarios_medico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "citas" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "medicoId" TEXT NOT NULL,
    "tipoConsultaId" TEXT NOT NULL,
    "fechaHoraInicio" TIMESTAMP(3) NOT NULL,
    "fechaHoraFin" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoCita" NOT NULL DEFAULT 'AGENDADA',
    "notas" TEXT,
    "creadoPorId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "citas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pacientes_nombre_apellidos_idx" ON "pacientes"("nombre", "apellidos");

-- CreateIndex
CREATE INDEX "horarios_medico_medicoId_idx" ON "horarios_medico"("medicoId");

-- CreateIndex
CREATE INDEX "citas_medicoId_fechaHoraInicio_idx" ON "citas"("medicoId", "fechaHoraInicio");

-- CreateIndex
CREATE INDEX "citas_pacienteId_idx" ON "citas"("pacienteId");

-- AddForeignKey
ALTER TABLE "horarios_medico" ADD CONSTRAINT "horarios_medico_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_tipoConsultaId_fkey" FOREIGN KEY ("tipoConsultaId") REFERENCES "tipos_consulta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
