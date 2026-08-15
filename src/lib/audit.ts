import { prisma } from "@/lib/prisma";

/**
 * Registro centralizado en la bitácora de auditoría (RF-080/081,
 * Documento 04 §3.9). Documento 03 §4 sugiere resolver esto con un
 * middleware/hook común en vez de que cada función escriba en la bitácora
 * por su cuenta — este helper es ese punto único. A medida que se agreguen
 * las fases 1-4, las funciones que crean/editan citas, turnos y notas
 * clínicas deben llamar a `registrarBitacora` en vez de escribir el registro
 * directamente.
 */
export async function registrarBitacora(params: {
  usuarioId: string;
  accion: string;
  entidadAfectada?: string;
}) {
  return prisma.bitacoraAuditoria.create({
    data: {
      usuarioId: params.usuarioId,
      accion: params.accion,
      entidadAfectada: params.entidadAfectada,
    },
  });
}
