"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function agregarAListaEspera(formData: FormData) {
  const pacienteId = String(formData.get("pacienteId") ?? "");
  const motivo = String(formData.get("motivo") ?? "").trim();
  if (!pacienteId || !motivo) {
    redirect(`/lista-espera/nuevo?pacienteId=${pacienteId}&error=1`);
  }

  await prisma.listaEspera.create({ data: { pacienteId, motivo } });
  revalidatePath("/lista-espera");
  redirect("/lista-espera");
}

// RF-035d: la reasignación automática al liberarse un lugar por cancelación
// no está implementada (requeriría un canal de notificación — WhatsApp
// llega en Fase 3). Por ahora recepción marca manualmente ASIGNADA cuando
// acomoda al paciente en un hueco liberado.
export async function marcarAsignada(id: string) {
  await prisma.listaEspera.update({ where: { id }, data: { estatus: "ASIGNADA" } });
  revalidatePath("/lista-espera");
}

export async function marcarCancelada(id: string) {
  await prisma.listaEspera.update({ where: { id }, data: { estatus: "CANCELADA" } });
  revalidatePath("/lista-espera");
}
