import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { obtenerUltimoMedicoId } from "@/lib/ultimo-medico";
import { minutosEsperando, ordenarCola } from "./cola";
import {
  cancelarTurno,
  filtrarTurnos,
  finalizarAtencion,
  iniciarAtencion,
  marcarNoAsistio,
  registrarLlegadaCita,
} from "./actions";

const FORMATO_HORA = new Intl.DateTimeFormat("es-MX", { timeStyle: "short" });

const ETIQUETA_TIPO: Record<string, string> = {
  CITA_AGENDADA: "Cita",
  APLICACION: "Aplicación",
  SIN_CITA: "Sin cita",
};

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function TurnosPage({
  searchParams,
}: {
  searchParams: Promise<{ medicoId?: string }>;
}) {
  const params = await searchParams;

  const medicos = await prisma.usuario.findMany({
    where: { rol: "MEDICO", activo: true },
    orderBy: { nombre: "asc" },
  });
  const medicoId = params.medicoId || (await obtenerUltimoMedicoId()) || medicos[0]?.id;

  if (!medicoId) {
    return (
      <div className="mx-auto max-w-2xl text-sm text-black/40">
        Todavía no hay médicos dados de alta.
      </div>
    );
  }

  const hoy = hoyISO();
  const inicioDia = new Date(`${hoy}T00:00:00`);
  const finDia = new Date(`${hoy}T23:59:59`);

  const [turnosDelDia, citasSinLlegada, enAtencion] = await Promise.all([
    prisma.turno.findMany({
      where: { medicoId, creadoEn: { gte: inicioDia, lte: finDia }, estado: "EN_ESPERA" },
      include: { paciente: true, cita: { include: { tipoConsulta: true } } },
    }),
    prisma.cita.findMany({
      where: {
        medicoId,
        fechaHoraInicio: { gte: inicioDia, lte: finDia },
        estado: { in: ["AGENDADA", "CONFIRMADA"] },
        turno: null,
      },
      include: { paciente: true, tipoConsulta: true },
      orderBy: { fechaHoraInicio: "asc" },
    }),
    prisma.turno.findFirst({
      where: { medicoId, estado: "EN_ATENCION" },
      include: { paciente: true, cita: { include: { tipoConsulta: true } } },
    }),
  ]);

  const cola = ordenarCola(turnosDelDia);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[var(--color-brand-azul-funcional)]">Turnos — hoy</h1>
        <Link
          href={`/turnos/nuevo?medicoId=${medicoId}`}
          className="rounded-md bg-[var(--color-brand-azul-funcional)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
        >
          + Aplicación / sin cita
        </Link>
      </div>

      <form action={filtrarTurnos} className="flex items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="medicoId" className="text-xs font-medium text-black/50">
            Médico
          </label>
          <select
            id="medicoId"
            name="medicoId"
            defaultValue={medicoId}
            className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
          >
            {medicos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm">
          Ver
        </button>
      </form>

      {/* En atención ahora */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-[#1a1a1a]">En atención</h2>
        {enAtencion ? (
          <div className="rounded-lg border border-[var(--color-brand-azul-funcional)] bg-[#FBEAF0]/30 px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {enAtencion.paciente.apellidos}, {enAtencion.paciente.nombre}
              </span>
              <span className="text-xs uppercase tracking-wide text-black/40">
                {ETIQUETA_TIPO[enAtencion.tipo]}
              </span>
            </div>
            <form action={finalizarAtencion.bind(null, enAtencion.id)} className="mt-3 flex items-end gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-black/50">Monto a cobrar (RF-038)</label>
                <input
                  type="number"
                  name="montoACobrar"
                  step="0.01"
                  min="0"
                  className="w-32 rounded-md border border-[var(--color-border)] px-2 py-1 text-sm"
                />
              </div>
              <button
                type="submit"
                className="rounded-md bg-[var(--color-brand-azul-funcional)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
              >
                Finalizar consulta
              </button>
            </form>
          </div>
        ) : (
          <p className="text-sm text-black/40">Nadie en atención en este momento.</p>
        )}
      </div>

      {/* Cola de espera */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-[#1a1a1a]">
          Cola de espera{" "}
          <span className="font-normal text-black/40">— orden de llegada / cita, RF-035</span>
        </h2>
        {cola.length === 0 ? (
          <p className="text-sm text-black/40">Sin pacientes en espera.</p>
        ) : (
          <ol className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)]">
            {cola.map((t, i) => {
              const iniciarConId = iniciarAtencion.bind(null, t.id);
              const cancelarConId = cancelarTurno.bind(null, t.id);
              const noAsistioConId = marcarNoAsistio.bind(null, t.id);
              const espera = minutosEsperando(t);

              return (
                <li key={t.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <span className="mr-2 font-mono text-xs text-black/30">{i + 1}</span>
                    <span className="font-medium">
                      {t.paciente.apellidos}, {t.paciente.nombre}
                    </span>{" "}
                    <span className="text-xs uppercase tracking-wide text-black/40">
                      {ETIQUETA_TIPO[t.tipo]}
                    </span>
                    {t.cita && (
                      <span className="ml-2 text-xs text-black/30">
                        cita {FORMATO_HORA.format(t.cita.fechaHoraInicio)} · {t.cita.tipoConsulta.nombre}
                      </span>
                    )}
                    <div className={`text-xs ${espera >= 30 ? "text-[#d4183d]" : "text-black/30"}`}>
                      esperando {espera} min
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!enAtencion && (
                      <form action={iniciarConId}>
                        <button type="submit" className="text-xs text-green-700 hover:underline">
                          Iniciar
                        </button>
                      </form>
                    )}
                    <form action={noAsistioConId}>
                      <button type="submit" className="text-xs text-black/40 hover:underline">
                        No asistió
                      </button>
                    </form>
                    <form action={cancelarConId}>
                      <button type="submit" className="text-xs text-[#d4183d] hover:underline">
                        Cancelar
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Citas de hoy sin llegada registrada */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-[#1a1a1a]">Citas de hoy — registrar llegada</h2>
        {citasSinLlegada.length === 0 ? (
          <p className="text-sm text-black/40">No hay citas pendientes de llegada para hoy.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)]">
            {citasSinLlegada.map((c) => {
              const registrarConId = registrarLlegadaCita.bind(null, c.id);
              return (
                <li key={c.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span>
                    {FORMATO_HORA.format(c.fechaHoraInicio)} · {c.paciente.apellidos}, {c.paciente.nombre} ·{" "}
                    {c.tipoConsulta.nombre}
                  </span>
                  <form action={registrarConId}>
                    <button
                      type="submit"
                      className="rounded-md border border-[var(--color-border)] px-2 py-1 text-xs hover:border-[var(--color-brand-azul-funcional)]"
                    >
                      Llegó
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
