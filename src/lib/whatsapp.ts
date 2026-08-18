import twilio from "twilio";
import { prisma } from "@/lib/prisma";
import { registrarBitacora } from "@/lib/audit";

/**
 * Envío/recepción de WhatsApp vía Twilio (Documento 03 §2, Fase 3).
 *
 * Alcance de esta iteración — dos decisiones tomadas junto con el usuario,
 * distintas de lo que dice el SRS original, y que quedan documentadas aquí
 * para revisarlas cuando toque pasar a producción real:
 *
 * 1. Número: RF-045 pide usar el mismo número de WhatsApp Business que ya
 *    opera la farmacia. Por ahora se usa el **WhatsApp Sandbox de Twilio**
 *    (número de pruebas de Twilio, cada destinatario debe unirse una vez
 *    mandando "join <código>") para no arriesgar el número real mientras se
 *    prueba el flujo. Migrar a un número dedicado o al número real de la
 *    farmacia es solo cambiar `TWILIO_WHATSAPP_FROM` — no requiere tocar
 *    este archivo.
 * 2. Clasificación de intención: RF-041 pide un clasificador de IA sobre
 *    lenguaje libre. Por ahora el paciente responde con un menú cerrado
 *    (1/2/3 o confirmar/reagendar/cancelar) — ver `interpretarRespuesta` en
 *    la ruta del webhook. Sin IA no hay "pausa de la IA" que gestionar
 *    (RF-041b/c ya no aplican tal cual); si se agrega el clasificador más
 *    adelante, `EstadoConfirmacionWsp` y `MensajeWhatsapp` ya alcanzan.
 */

function clienteTwilio() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    throw new Error("Faltan TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN en las variables de entorno.");
  }
  return twilio(sid, token);
}

/** Normaliza un teléfono capturado en México (10 dígitos locales) a E.164. */
export function normalizarTelefonoMx(telefono: string): string {
  const digitos = telefono.replace(/\D/g, "");
  if (digitos.startsWith("52")) return `+${digitos}`;
  return `+52${digitos}`;
}

const FORMATO_FECHA = new Intl.DateTimeFormat("es-MX", { dateStyle: "full" });
const FORMATO_HORA = new Intl.DateTimeFormat("es-MX", { timeStyle: "short" });

/** RF-040: plantilla del mensaje de confirmación, con menú cerrado en vez de lenguaje libre. */
export function mensajeConfirmacionCita(params: {
  nombrePaciente: string;
  fechaHoraInicio: Date;
}): string {
  const consultorio = process.env.CONSULTORIO_NOMBRE || "tu consultorio";
  const fecha = FORMATO_FECHA.format(params.fechaHoraInicio);
  const hora = FORMATO_HORA.format(params.fechaHoraInicio);
  return (
    `Hola ${params.nombrePaciente} 👋, hablamos de ${consultorio} para confirmar tu cita del ${fecha} a las ${hora}.\n\n` +
    `Responde con el *número* de una opción:\n` +
    `1️⃣ Confirmar\n` +
    `2️⃣ Reagendar\n` +
    `3️⃣ Cancelar`
  );
}

export function mensajeNoEntendido(): string {
  return (
    "No entendí tu respuesta 🙏. Por favor responde solo con el número de una opción:\n" +
    "1️⃣ Confirmar\n2️⃣ Reagendar\n3️⃣ Cancelar"
  );
}

export function mensajeGracias(resultado: "CONFIRMADA" | "CANCELADA" | "REAGENDAR_SOLICITADO"): string {
  if (resultado === "CONFIRMADA") return "¡Gracias! Tu cita quedó confirmada. Te esperamos 😊";
  if (resultado === "CANCELADA") return "Listo, cancelamos tu cita. Si quieres agendar otra, contáctanos cuando gustes.";
  return "Gracias, anotamos que quieres reagendar. Recepción te contactará en breve para buscar un nuevo horario.";
}

/** Envía un mensaje de WhatsApp de texto libre (sin plantilla aprobada) vía Twilio. */
export async function enviarWhatsapp(paraE164: string, cuerpo: string) {
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!from) throw new Error("Falta TWILIO_WHATSAPP_FROM en las variables de entorno.");

  const mensaje = await clienteTwilio().messages.create({
    from: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
    to: `whatsapp:${paraE164}`,
    body: cuerpo,
  });
  return mensaje.sid;
}

/**
 * Envía (o reenvía) la confirmación de una cita puntual y deja rastro en
 * `MensajeWhatsapp` y en la bitácora. La usan tanto el cron de envío masivo
 * (RF-040a) como el botón manual "Enviar por WhatsApp" en Agenda.
 */
export async function enviarConfirmacionParaCita(citaId: string) {
  const cita = await prisma.cita.findUnique({ where: { id: citaId }, include: { paciente: true } });
  if (!cita) throw new Error(`Cita ${citaId} no encontrada`);

  const telefono = normalizarTelefonoMx(cita.paciente.telefono);
  const cuerpo = mensajeConfirmacionCita({
    nombrePaciente: cita.paciente.nombre,
    fechaHoraInicio: cita.fechaHoraInicio,
  });
  const sid = await enviarWhatsapp(telefono, cuerpo);

  await prisma.$transaction([
    prisma.cita.update({
      where: { id: citaId },
      data: { estadoConfirmacionWsp: "ENVIADA", confirmacionEnviadaEn: new Date() },
    }),
    prisma.mensajeWhatsapp.create({
      data: { citaId, direccion: "SALIENTE", cuerpo, twilioSid: sid },
    }),
  ]);

  await registrarBitacora({ accion: "whatsapp_confirmacion_enviada", entidadAfectada: citaId });
}

/** Valida que un POST entrante realmente venga de Twilio (firma X-Twilio-Signature). */
export function validarFirmaTwilio(params: {
  urlCompleta: string;
  cabeceraFirma: string | null;
  parametrosFormulario: Record<string, string>;
}): boolean {
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!token || !params.cabeceraFirma) return false;
  return twilio.validateRequest(token, params.cabeceraFirma, params.urlCompleta, params.parametrosFormulario);
}
