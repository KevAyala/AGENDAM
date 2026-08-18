import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { prisma } from "@/lib/prisma";
import { registrarBitacora } from "@/lib/audit";
import { mensajeGracias, mensajeNoEntendido, validarFirmaTwilio } from "@/lib/whatsapp";

/**
 * Webhook de Twilio para respuestas entrantes de WhatsApp (RF-041, versión
 * sin IA de esta iteración — ver nota de alcance en src/lib/whatsapp.ts).
 * Configúralo en Twilio Console → WhatsApp Sandbox Settings → "WHEN A
 * MESSAGE COMES IN" apuntando a `https://<tu-deploy>/api/whatsapp/webhook`.
 */

type Resultado = "CONFIRMADA" | "CANCELADA" | "REAGENDAR_SOLICITADO" | "NO_ENTENDIDO";

function interpretarRespuesta(textoOriginal: string): Resultado {
  const texto = textoOriginal
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // quita acentos

  if (["1", "confirmar", "confirmo"].includes(texto)) return "CONFIRMADA";
  if (["3", "cancelar", "cancelo"].includes(texto)) return "CANCELADA";
  if (["2", "reagendar", "cambiar", "cambio", "cambio de horario"].includes(texto)) {
    return "REAGENDAR_SOLICITADO";
  }
  return "NO_ENTENDIDO";
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const parametros: Record<string, string> = {};
  formData.forEach((valor, clave) => {
    parametros[clave] = String(valor);
  });

  const firmaValida = validarFirmaTwilio({
    urlCompleta: request.url,
    cabeceraFirma: request.headers.get("x-twilio-signature"),
    parametrosFormulario: parametros,
  });
  if (!firmaValida) {
    return NextResponse.json({ error: "firma inválida" }, { status: 403 });
  }

  const desde = (parametros.From || "").replace("whatsapp:", "");
  const cuerpo = parametros.Body || "";
  const messageSid = parametros.MessageSid || undefined;

  const ultimos10 = desde.replace(/\D/g, "").slice(-10);

  const cita = await prisma.cita.findFirst({
    where: {
      paciente: { telefono: { endsWith: ultimos10 } },
      estadoConfirmacionWsp: { in: ["ENVIADA", "NO_ENTENDIDO"] },
    },
    orderBy: { confirmacionEnviadaEn: "desc" },
  });

  const twiml = new twilio.twiml.MessagingResponse();

  if (!cita) {
    // No hay una cita esperando respuesta de este número — no se puede
    // asociar el mensaje a ningún registro (MensajeWhatsapp exige citaId).
    twiml.message(
      "No encontramos una cita pendiente de confirmar para este número. Si necesitas ayuda, contáctanos directamente."
    );
    return new NextResponse(twiml.toString(), { status: 200, headers: { "Content-Type": "text/xml" } });
  }

  const resultado = interpretarRespuesta(cuerpo);

  await prisma.mensajeWhatsapp.create({
    data: { citaId: cita.id, direccion: "ENTRANTE", cuerpo, twilioSid: messageSid },
  });

  if (resultado === "NO_ENTENDIDO") {
    await prisma.cita.update({ where: { id: cita.id }, data: { estadoConfirmacionWsp: "NO_ENTENDIDO" } });
    twiml.message(mensajeNoEntendido());
    await prisma.mensajeWhatsapp.create({
      data: { citaId: cita.id, direccion: "SALIENTE", cuerpo: mensajeNoEntendido() },
    });
    return new NextResponse(twiml.toString(), { status: 200, headers: { "Content-Type": "text/xml" } });
  }

  await prisma.cita.update({
    where: { id: cita.id },
    data: {
      estadoConfirmacionWsp: resultado,
      ...(resultado === "CONFIRMADA" ? { estado: "CONFIRMADA" } : {}),
      ...(resultado === "CANCELADA" ? { estado: "CANCELADA" } : {}),
    },
  });

  const respuesta = mensajeGracias(resultado);
  twiml.message(respuesta);
  await prisma.mensajeWhatsapp.create({ data: { citaId: cita.id, direccion: "SALIENTE", cuerpo: respuesta } });

  await registrarBitacora({
    accion:
      resultado === "CONFIRMADA"
        ? "whatsapp_cita_confirmada"
        : resultado === "CANCELADA"
          ? "whatsapp_cita_cancelada"
          : "whatsapp_reagendar_solicitado",
    entidadAfectada: cita.id,
  });

  return new NextResponse(twiml.toString(), { status: 200, headers: { "Content-Type": "text/xml" } });
}
