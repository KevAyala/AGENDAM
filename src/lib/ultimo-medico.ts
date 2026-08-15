import { cookies } from "next/headers";

const COOKIE = "agendam_ultimo_medico";

/**
 * RF-035e: la selección de médico no debe volverse un cuello de botella al
 * crecer el consultorio a más de uno — se recuerda la última selección en
 * una cookie (1 año) para que Agenda y Turnos abran directo en el médico
 * correcto la mayoría de las veces.
 */
export async function obtenerUltimoMedicoId(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIE)?.value;
}

export async function guardarUltimoMedicoId(medicoId: string) {
  const store = await cookies();
  store.set(COOKIE, medicoId, { maxAge: 60 * 60 * 24 * 365, path: "/" });
}
