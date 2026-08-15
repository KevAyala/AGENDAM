"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { registrarBitacora } from "@/lib/audit";
import { obtenerUsuarioActual } from "@/lib/current-user";
import { guardarUltimoMedicoId } from "@/lib/ultimo-medico";

export async function filtrarTurnos(formData: FormData) {
  const medicoId = String(formData.get("medicoId") ?? "");
  if (medicoId) await guardarUltimoMedicoId(medicoId);
  redirect(`/turnos?medicoId=${medicoId}`);
}

async function bitacora(accion: string, entidadAfectada: string) {
  const { usuario } = await obtenerUsuarioActual();
  if (usuario) await registrarBitacora({ usuarioId: usuario.id, accion, entidadAfectada });
}

/** Registrar llegada de un paciente que ya tenía cita agendada para hoy. */
export async function registrarLlegadaCita(citaId: string) {
  const cita = await prisma.cita.findUnique({ where: { id: citaId } });
  if (!cita) return;

  const turno = await prisma.turno.create({
    data: {
      pacienteId: cita.pacienteId,
      medicoId: cita.medicoId,
      citaId: cita.id,
      tipo: "CITA_AGENDADA",
    },
  });

  await bitacora("turno_creado", turno.id);
  revalidatePath("/turnos");
}

/**
 * RF-039 (aplicación, 5 min) y RF-035b (paciente sin cita, consulta
 * regular con lugar el mismo día) — ambos son turnos sin Cita de por
 * medio, solo cambia `tipo` y por lo tanto su regla de inserción en la
 * cola (ver cola.ts).
 */
export async function registrarTurnoDirecto(formData: FormData) {
  const pacienteId = String(formData.get("pacienteId") ?? "");
  const medicoId = String(formData.get("medicoId") ?? "");
  const tipo = String(formData.get("tipo") ?? "");
  if (!pacienteId || !medicoId || (tipo !== "APLICACION" && tipo !== "SIN_CITA")) {
    redirect(`/turnos/nuevo?pacienteId=${pacienteId}&medicoId=${medicoId}&error=1`);
  }

  const turno = await prisma.turno.create({
    data: { pacienteId, medicoId, tipo: tipo as "APLICACION" | "SIN_CITA" },
  });

  await bitacora("turno_creado", turno.id);
  revalidatePath("/turnos");
  redirect(`/turnos?medicoId=${medicoId}`);
}

export async function iniciarAtencion(turnoId: string) {
  const turno = await prisma.turno.findUnique({ where: { id: turnoId } });
  if (!turno || turno.estado !== "EN_ESPERA") return;

  // Un médico atiende a un paciente a la vez.
  const yaEnAtencion = await prisma.turno.findFirst({
    where: { medicoId: turno.medicoId, estado: "EN_ATENCION" },
  });
  if (yaEnAtencion) return;

  await prisma.turno.update({
    where: { id: turnoId },
    data: { estado: "EN_ATENCION", horaInicioAtencion: new Date() },
  });

  await bitacora("turno_actualizado", turnoId);
  revalidatePath("/turnos");
}

/** RF-038/038a: el médico registra el monto a cobrar al finalizar. */
export async function finalizarAtencion(turnoId: string, formData: FormData) {
  const montoRaw = String(formData.get("montoACobrar") ?? "").trim();
  const montoACobrar = montoRaw ? Number(montoRaw) : null;

  await prisma.turno.update({
    where: { id: turnoId },
    data: {
      estado: "COMPLETADO",
      horaFinAtencion: new Date(),
      montoACobrar: montoACobrar !== null && !Number.isNaN(montoACobrar) ? montoACobrar : null,
    },
  });

  await bitacora("turno_completado", turnoId);
  revalidatePath("/turnos");
}

export async function cancelarTurno(turnoId: string) {
  await prisma.turno.update({ where: { id: turnoId }, data: { estado: "CANCELADO" } });
  await bitacora("turno_actualizado", turnoId);
  revalidatePath("/turnos");
}

export async function marcarNoAsistio(turnoId: string) {
  await prisma.turno.update({ where: { id: turnoId }, data: { estado: "NO_ASISTIO" } });
  await bitacora("turno_actualizado", turnoId);
  revalidatePath("/turnos");
}
