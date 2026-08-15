"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function leerDatosFormulario(formData: FormData) {
  const fechaNacimientoRaw = String(formData.get("fechaNacimiento") ?? "");
  return {
    nombre: String(formData.get("nombre") ?? "").trim(),
    apellidos: String(formData.get("apellidos") ?? "").trim(),
    telefono: String(formData.get("telefono") ?? "").trim(),
    fechaNacimiento: fechaNacimientoRaw ? new Date(fechaNacimientoRaw) : null,
    notas: String(formData.get("notas") ?? "").trim() || null,
  };
}

export async function crearPaciente(formData: FormData) {
  const datos = leerDatosFormulario(formData);
  if (!datos.nombre || !datos.apellidos || !datos.telefono) {
    redirect("/pacientes/nuevo?error=faltan_campos");
  }

  const paciente = await prisma.paciente.create({ data: datos });
  revalidatePath("/pacientes");
  redirect(`/pacientes/${paciente.id}`);
}

export async function actualizarPaciente(pacienteId: string, formData: FormData) {
  const datos = leerDatosFormulario(formData);
  if (!datos.nombre || !datos.apellidos || !datos.telefono) {
    redirect(`/pacientes/${pacienteId}?error=faltan_campos`);
  }

  await prisma.paciente.update({ where: { id: pacienteId }, data: datos });
  revalidatePath("/pacientes");
  revalidatePath(`/pacientes/${pacienteId}`);
  redirect(`/pacientes/${pacienteId}?guardado=1`);
}

export async function desactivarPaciente(pacienteId: string) {
  await prisma.paciente.update({ where: { id: pacienteId }, data: { activo: false } });
  revalidatePath("/pacientes");
  revalidatePath(`/pacientes/${pacienteId}`);
}
