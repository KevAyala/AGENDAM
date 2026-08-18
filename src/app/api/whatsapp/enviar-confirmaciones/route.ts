import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarConfirmacionParaCita } from "@/lib/whatsapp";

// RF-040a: matutina (antes del corte) se avisa la tarde-noche anterior;
// vespertina (desde el corte) se avisa la mañana del mismo día. El SRS no da
// una hora exacta de corte ni de envío — se toma 15:00 como frontera
// matutino/vespertino (coincide con los bloques de ejemplo de HorarioMedico,
// Documento 04 §3.2) y 08:00/18:00 como horas de envío; ambos son
// configurables aquí si el consultorio prefiere otro horario. Asume que el
// proceso corre en hora de México — en Vercel, fija `TZ=America/Mexico_City`
// en las variables de entorno del proyecto para que esto sea correcto.
const CORTE_MATUTINO_VESPERTINO_HORA = 15;
const HORA_MIN_ENVIO_VESPERTINO_MISMO_DIA = 8;
const HORA_MIN_ENVIO_MATUTINO_DIA_ANTERIOR = 18;

const ESTADOS_ACTIVOS = ["AGENDADA", "CONFIRMADA", "REPROGRAMADA"] as const;

function inicioFinDia(base: Date) {
  const inicio = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, 0, 0);
  const fin = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 23, 59, 59);
  return { inicio, fin };
}

async function citasCandidatas(request: NextRequest) {
  const ahora = new Date();
  const horaActual = ahora.getHours();
  const candidatas: { id: string }[] = [];

  if (horaActual >= HORA_MIN_ENVIO_VESPERTINO_MISMO_DIA) {
    const { inicio, fin } = inicioFinDia(ahora);
    const vespertinasHoy = await prisma.cita.findMany({
      where: {
        estado: { in: [...ESTADOS_ACTIVOS] },
        estadoConfirmacionWsp: "PENDIENTE",
        fechaHoraInicio: { gte: inicio, lte: fin },
      },
      select: { id: true, fechaHoraInicio: true },
    });
    candidatas.push(...vespertinasHoy.filter((c) => c.fechaHoraInicio.getHours() >= CORTE_MATUTINO_VESPERTINO_HORA));
  }

  if (horaActual >= HORA_MIN_ENVIO_MATUTINO_DIA_ANTERIOR) {
    const manana = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
    const { inicio, fin } = inicioFinDia(manana);
    const matutinasManana = await prisma.cita.findMany({
      where: {
        estado: { in: [...ESTADOS_ACTIVOS] },
        estadoConfirmacionWsp: "PENDIENTE",
        fechaHoraInicio: { gte: inicio, lte: fin },
      },
      select: { id: true, fechaHoraInicio: true },
    });
    candidatas.push(...matutinasManana.filter((c) => c.fechaHoraInicio.getHours() < CORTE_MATUTINO_VESPERTINO_HORA));
  }

  // `?forzar=1` ignora las ventanas de horario — útil para probar a mano
  // (curl/navegador) sin esperar a que dé la hora real.
  if (request.nextUrl.searchParams.get("forzar") === "1") {
    const todas = await prisma.cita.findMany({
      where: { estado: { in: [...ESTADOS_ACTIVOS] }, estadoConfirmacionWsp: "PENDIENTE" },
      select: { id: true },
    });
    return todas;
  }

  return candidatas;
}

async function manejarSolicitud(request: NextRequest) {
  const secreto = process.env.CRON_SECRET;
  if (secreto) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secreto}`) {
      return NextResponse.json({ error: "no autorizado" }, { status: 401 });
    }
  }

  const candidatas = await citasCandidatas(request);
  const enviados: string[] = [];
  const fallidos: string[] = [];

  for (const cita of candidatas) {
    try {
      await enviarConfirmacionParaCita(cita.id);
      enviados.push(cita.id);
    } catch (err) {
      console.error(`[whatsapp] error enviando confirmación de cita ${cita.id}:`, err);
      fallidos.push(cita.id);
    }
  }

  return NextResponse.json({ enviados: enviados.length, fallidos: fallidos.length, citaIds: enviados });
}

// Vercel Cron llama por GET; se deja también POST por si se dispara a mano.
export async function GET(request: NextRequest) {
  return manejarSolicitud(request);
}

export async function POST(request: NextRequest) {
  return manejarSolicitud(request);
}
