import type { Cita, Paciente, TipoConsulta, Turno } from "@prisma/client";

export type TurnoConRelaciones = Turno & {
  paciente: Paciente;
  cita: (Cita & { tipoConsulta: TipoConsulta }) | null;
};

const MINUTOS_REGLA_APLICACION = 30;

/**
 * Orden de la cola de espera — RF-035 y RF-035a.
 *
 * RF-035: los pacientes pasan por orden de llegada y de hora de cita.
 * RF-035a: una "aplicación" (sin cita) puede insertarse entre consultas ya
 * en curso — es decir, pasar antes que los pacientes agendados que siguen
 * esperando — siempre y cuando NINGÚN paciente agendado lleve más de 30
 * minutos esperando. En cuanto alguno cruza ese umbral, ninguna aplicación
 * puede seguir adelantándose: se van todas al final, después de los
 * agendados.
 *
 * Esta función implementa esa regla de forma literal: no es un detalle que
 * esté en el v0.1 que falta en docs/, es la lectura más directa del texto
 * del RF.
 */
export function ordenarCola(turnos: TurnoConRelaciones[], ahora: Date = new Date()): TurnoConRelaciones[] {
  const enEspera = turnos.filter((t) => t.estado === "EN_ESPERA");

  const agendados = enEspera
    .filter((t) => t.tipo !== "APLICACION")
    .sort((a, b) => horaReferencia(a).getTime() - horaReferencia(b).getTime());

  const aplicaciones = enEspera
    .filter((t) => t.tipo === "APLICACION")
    .sort((a, b) => a.horaLlegada.getTime() - b.horaLlegada.getTime());

  const hayAgendadoEsperando30 = agendados.some(
    (t) => (ahora.getTime() - t.horaInicioEspera.getTime()) / 60_000 >= MINUTOS_REGLA_APLICACION,
  );

  return hayAgendadoEsperando30 ? [...agendados, ...aplicaciones] : [...aplicaciones, ...agendados];
}

function horaReferencia(turno: TurnoConRelaciones): Date {
  return turno.cita?.fechaHoraInicio ?? turno.horaInicioEspera;
}

export function minutosEsperando(turno: Turno, ahora: Date = new Date()): number {
  return Math.floor((ahora.getTime() - turno.horaInicioEspera.getTime()) / 60_000);
}
