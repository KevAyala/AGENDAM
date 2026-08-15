"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const DIAS = 7;
const RANGOS_POR_DIA = 2; // RF-029b: hasta 2 franjas por día (ej. mañana + tarde).

export async function guardarHorario(medicoId: string, formData: FormData) {
  const filas: { medicoId: string; diaSemana: number; horaInicio: string; horaFin: string }[] = [];

  for (let dia = 0; dia < DIAS; dia++) {
    for (let rango = 0; rango < RANGOS_POR_DIA; rango++) {
      const inicio = String(formData.get(`dia${dia}_inicio${rango}`) ?? "").trim();
      const fin = String(formData.get(`dia${dia}_fin${rango}`) ?? "").trim();
      if (inicio && fin) {
        filas.push({ medicoId, diaSemana: dia, horaInicio: inicio, horaFin: fin });
      }
    }
  }

  // Reemplaza el horario completo del médico — más simple y predecible que
  // hacer diffs de filas individuales para un formulario de tamaño fijo.
  await prisma.$transaction([
    prisma.horarioMedico.deleteMany({ where: { medicoId } }),
    ...(filas.length > 0 ? [prisma.horarioMedico.createMany({ data: filas })] : []),
  ]);

  revalidatePath("/configuracion/horarios");
  redirect(`/configuracion/horarios?medicoId=${medicoId}&guardado=1`);
}
