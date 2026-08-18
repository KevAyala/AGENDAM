// Script de prueba puntual (no forma parte del flujo normal de la app):
// crea una cita de prueba para un paciente existente y le envía la
// confirmación por WhatsApp de inmediato, sin esperar al cron.
// Uso: npx tsx scripts/test-envio-whatsapp.ts <pacienteId>
import { PrismaClient } from "@prisma/client";
import { enviarConfirmacionParaCita } from "../src/lib/whatsapp";

const prisma = new PrismaClient();

async function main() {
  const pacienteId = process.argv[2];
  if (!pacienteId) throw new Error("Uso: npx tsx scripts/test-envio-whatsapp.ts <pacienteId>");

  const [medico, tipoConsulta] = await Promise.all([
    prisma.usuario.findFirst({ where: { rol: "MEDICO", activo: true } }),
    prisma.tipoConsulta.findFirst({ where: { nombre: "Consulta general", duracionMin: 20 } }),
  ]);
  if (!medico) throw new Error("No hay ningún médico dado de alta.");
  if (!tipoConsulta) throw new Error("No se encontró el tipo de consulta 'Consulta general' 20 min.");

  const inicio = new Date(Date.now() + 60 * 60 * 1000); // en 1 hora, solo para la prueba
  const fin = new Date(inicio.getTime() + tipoConsulta.duracionMin * 60_000);

  const cita = await prisma.cita.create({
    data: {
      pacienteId,
      medicoId: medico.id,
      tipoConsultaId: tipoConsulta.id,
      fechaHoraInicio: inicio,
      fechaHoraFin: fin,
      notas: "Cita de prueba — scripts/test-envio-whatsapp.ts",
    },
  });
  console.log(`✓ Cita de prueba creada: ${cita.id} (${inicio.toLocaleString("es-MX")})`);

  await enviarConfirmacionParaCita(cita.id);
  console.log("✓ Mensaje de confirmación enviado por WhatsApp.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
