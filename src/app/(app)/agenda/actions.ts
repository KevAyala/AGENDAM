"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { registrarBitacora } from "@/lib/audit";
import { obtenerUsuarioActual } from "@/lib/current-user";
import { guardarUltimoMedicoId } from "@/lib/ultimo-medico";

// RF-035e: recuerda el médico elegido para la próxima vez que se abra la
// Agenda o Turnos.
export async function filtrarAgenda(formData: FormData) {
  const medicoId = String(formData.get("medicoId") ?? "");
  const fecha = String(formData.get("fecha") ?? "");
  if (medicoId) await guardarUltimoMedicoId(medicoId);
  redirect(`/agenda?medicoId=${medicoId}&fecha=${fecha}`);
}

/**
 * Valida que la nueva cita no se traslape con otra cita activa del mismo
 * médico. No es un RF explícito del SRS disponible en docs/ — se agrega
 * como regla de sentido común para una agenda utilizable; quitar si el
 * negocio decide que sí se permite doble-booking a propósito.
 */
async function hayTraslape(params: {
  medicoId: string;
  inicio: Date;
  fin: Date;
  excluirCitaId?: string;
}) {
  const conflicto = await prisma.cita.findFirst({
    where: {
      medicoId: params.medicoId,
      estado: { notIn: ["CANCELADA", "NO_ASISTIO"] },
      id: params.excluirCitaId ? { not: params.excluirCitaId } : undefined,
      fechaHoraInicio: { lt: params.fin },
      fechaHoraFin: { gt: params.inicio },
    },
  });
  return Boolean(conflicto);
}

export async function crearCita(formData: FormData) {
  const { usuario } = await obtenerUsuarioActual();

  const pacienteId = String(formData.get("pacienteId") ?? "");
  const medicoId = String(formData.get("medicoId") ?? "");
  const tipoConsultaId = String(formData.get("tipoConsultaId") ?? "");
  const fecha = String(formData.get("fecha") ?? "");
  const hora = String(formData.get("hora") ?? "");
  const notas = String(formData.get("notas") ?? "").trim() || null;

  if (!pacienteId || !medicoId || !tipoConsultaId || !fecha || !hora) {
    redirect(`/agenda/nueva?pacienteId=${pacienteId}&error=faltan_campos`);
  }

  const tipoConsulta = await prisma.tipoConsulta.findUnique({ where: { id: tipoConsultaId } });
  if (!tipoConsulta) {
    redirect(`/agenda/nueva?pacienteId=${pacienteId}&error=tipo_invalido`);
  }

  const inicio = new Date(`${fecha}T${hora}:00`);
  const fin = new Date(inicio.getTime() + tipoConsulta!.duracionMin * 60_000);

  if (await hayTraslape({ medicoId, inicio, fin })) {
    redirect(`/agenda/nueva?pacienteId=${pacienteId}&error=traslape`);
  }

  const cita = await prisma.cita.create({
    data: {
      pacienteId,
      medicoId,
      tipoConsultaId,
      fechaHoraInicio: inicio,
      fechaHoraFin: fin,
      notas,
      creadoPorId: usuario?.id,
    },
  });

  if (usuario) {
    await registrarBitacora({ usuarioId: usuario.id, accion: "cita_creada", entidadAfectada: cita.id });
  }

  revalidatePath("/agenda");
  redirect(`/agenda?medicoId=${medicoId}&fecha=${fecha}`);
}

export async function reprogramarCita(citaId: string, formData: FormData) {
  const { usuario } = await obtenerUsuarioActual();

  const fecha = String(formData.get("fecha") ?? "");
  const hora = String(formData.get("hora") ?? "");
  if (!fecha || !hora) return;

  const citaActual = await prisma.cita.findUnique({ where: { id: citaId } });
  if (!citaActual) return;

  const duracionMin = (citaActual.fechaHoraFin.getTime() - citaActual.fechaHoraInicio.getTime()) / 60_000;
  const inicio = new Date(`${fecha}T${hora}:00`);
  const fin = new Date(inicio.getTime() + duracionMin * 60_000);

  if (await hayTraslape({ medicoId: citaActual.medicoId, inicio, fin, excluirCitaId: citaId })) {
    revalidatePath("/agenda");
    return;
  }

  await prisma.cita.update({
    where: { id: citaId },
    data: { fechaHoraInicio: inicio, fechaHoraFin: fin, estado: "REPROGRAMADA" },
  });

  if (usuario) {
    await registrarBitacora({ usuarioId: usuario.id, accion: "cita_reprogramada", entidadAfectada: citaId });
  }

  revalidatePath("/agenda");
}

export async function cancelarCita(citaId: string) {
  const { usuario } = await obtenerUsuarioActual();

  await prisma.cita.update({ where: { id: citaId }, data: { estado: "CANCELADA" } });

  if (usuario) {
    await registrarBitacora({ usuarioId: usuario.id, accion: "cita_cancelada", entidadAfectada: citaId });
  }

  revalidatePath("/agenda");
}

export async function confirmarCita(citaId: string) {
  const { usuario } = await obtenerUsuarioActual();

  await prisma.cita.update({ where: { id: citaId }, data: { estado: "CONFIRMADA" } });

  if (usuario) {
    await registrarBitacora({ usuarioId: usuario.id, accion: "cita_confirmada", entidadAfectada: citaId });
  }

  revalidatePath("/agenda");
}
