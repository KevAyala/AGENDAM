import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cancelarCita, confirmarCita, reprogramarCita } from "./actions";

const FORMATO_HORA = new Intl.DateTimeFormat("es-MX", { timeStyle: "short" });

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

const COLOR_ESTADO: Record<string, string> = {
  AGENDADA: "text-black/50",
  CONFIRMADA: "text-green-700",
  REPROGRAMADA: "text-amber-700",
  CANCELADA: "text-black/30 line-through",
  COMPLETADA: "text-black/40",
  NO_ASISTIO: "text-[#d4183d]",
};

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ medicoId?: string; fecha?: string }>;
}) {
  const params = await searchParams;
  const fecha = params.fecha || hoyISO();

  const medicos = await prisma.usuario.findMany({
    where: { rol: "MEDICO", activo: true },
    orderBy: { nombre: "asc" },
  });

  const medicoId = params.medicoId || medicos[0]?.id;

  const inicioDia = new Date(`${fecha}T00:00:00`);
  const finDia = new Date(`${fecha}T23:59:59`);

  const citas = medicoId
    ? await prisma.cita.findMany({
        where: { medicoId, fechaHoraInicio: { gte: inicioDia, lte: finDia } },
        orderBy: { fechaHoraInicio: "asc" },
        include: { paciente: true, tipoConsulta: true },
      })
    : [];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[var(--color-brand-azul-funcional)]">Agenda</h1>
        <Link
          href={`/agenda/nueva${medicoId ? `?medicoId=${medicoId}&fecha=${fecha}` : ""}`}
          className="rounded-md bg-[var(--color-brand-azul-funcional)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
        >
          Nueva cita
        </Link>
      </div>

      {medicos.length === 0 ? (
        <p className="text-sm text-black/40">
          Todavía no hay médicos dados de alta (Usuario con rol MEDICO).
        </p>
      ) : (
        <>
          <form className="flex flex-wrap items-end gap-3">
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
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fecha" className="text-xs font-medium text-black/50">
                Fecha
              </label>
              <input
                id="fecha"
                name="fecha"
                type="date"
                defaultValue={fecha}
                className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm hover:border-[var(--color-brand-azul-funcional)]"
            >
              Ver
            </button>
          </form>

          <div className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)]">
            {citas.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-black/40">
                Sin citas para ese médico en esa fecha.
              </p>
            )}
            {citas.map((c) => {
              const reprogramarConId = reprogramarCita.bind(null, c.id);
              const cancelarConId = cancelarCita.bind(null, c.id);
              const confirmarConId = confirmarCita.bind(null, c.id);
              const activa = c.estado !== "CANCELADA" && c.estado !== "COMPLETADA";

              return (
                <div key={c.id} className="px-4 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium text-[#1a1a1a]">
                        {FORMATO_HORA.format(c.fechaHoraInicio)}
                      </span>{" "}
                      · {c.paciente.apellidos}, {c.paciente.nombre} · {c.tipoConsulta.nombre}
                    </div>
                    <span className={`text-xs font-semibold uppercase tracking-wide ${COLOR_ESTADO[c.estado]}`}>
                      {c.estado}
                    </span>
                  </div>

                  {activa && (
                    <div className="mt-2 flex items-center gap-4">
                      {c.estado === "AGENDADA" && (
                        <form action={confirmarConId}>
                          <button type="submit" className="text-xs text-green-700 hover:underline">
                            Confirmar
                          </button>
                        </form>
                      )}
                      <details className="text-xs">
                        <summary className="cursor-pointer text-[var(--color-brand-azul-funcional)]">
                          Reprogramar
                        </summary>
                        <form action={reprogramarConId} className="mt-2 flex items-end gap-2">
                          <input
                            type="date"
                            name="fecha"
                            defaultValue={fecha}
                            className="rounded-md border border-[var(--color-border)] px-2 py-1"
                          />
                          <input
                            type="time"
                            name="hora"
                            className="rounded-md border border-[var(--color-border)] px-2 py-1"
                          />
                          <button
                            type="submit"
                            className="rounded-md border border-[var(--color-border)] px-2 py-1 hover:border-[var(--color-brand-azul-funcional)]"
                          >
                            Guardar
                          </button>
                        </form>
                      </details>
                      <form action={cancelarConId}>
                        <button type="submit" className="text-xs text-[#d4183d] hover:underline">
                          Cancelar
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
