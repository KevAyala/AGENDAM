import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { obtenerUltimoMedicoId } from "@/lib/ultimo-medico";
import { PageHeader, Badge, card, btnPrimary, linkAction, linkDanger, type Tono } from "@/components/ui";
import { cancelarCita, confirmarCita, filtrarAgenda, reprogramarCita } from "./actions";

const FORMATO_HORA = new Intl.DateTimeFormat("es-MX", { timeStyle: "short" });

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

const TONO_ESTADO: Record<string, Tono> = {
  AGENDADA: "neutral",
  CONFIRMADA: "success",
  REPROGRAMADA: "warning",
  CANCELADA: "strike",
  COMPLETADA: "neutral",
  NO_ASISTIO: "danger",
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

  const medicoId = params.medicoId || (await obtenerUltimoMedicoId()) || medicos[0]?.id;

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
      <PageHeader
        kicker="Núcleo"
        title="Agenda"
        action={
          <Link href={`/agenda/nueva${medicoId ? `?medicoId=${medicoId}&fecha=${fecha}` : ""}`} className={btnPrimary}>
            + Nueva cita
          </Link>
        }
      />

      {medicos.length === 0 ? (
        <p className="text-sm text-[var(--color-foreground-faint)]">
          Todavía no hay médicos dados de alta (Usuario con rol MEDICO).
        </p>
      ) : (
        <>
          <form action={filtrarAgenda} className={`flex flex-wrap items-end gap-3 p-4 ${card}`}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="medicoId" className="text-xs font-medium text-[var(--color-foreground-muted)]">
                Médico
              </label>
              <select
                id="medicoId"
                name="medicoId"
                defaultValue={medicoId}
                className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              >
                {medicos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fecha" className="text-xs font-medium text-[var(--color-foreground-muted)]">
                Fecha
              </label>
              <input
                id="fecha"
                name="fecha"
                type="date"
                defaultValue={fecha}
                className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:border-[var(--color-brand-azul-funcional)]"
            >
              Ver
            </button>
          </form>

          <div className={card}>
            {citas.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-[var(--color-foreground-faint)]">
                Sin citas para ese médico en esa fecha.
              </p>
            )}
            {citas.map((c) => {
              const reprogramarConId = reprogramarCita.bind(null, c.id);
              const cancelarConId = cancelarCita.bind(null, c.id);
              const confirmarConId = confirmarCita.bind(null, c.id);
              const activa = c.estado !== "CANCELADA" && c.estado !== "COMPLETADA";

              return (
                <div key={c.id} className="border-b border-[var(--color-border-soft)] px-5 py-4 last:border-b-0">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-semibold text-[var(--color-foreground)]">
                        {FORMATO_HORA.format(c.fechaHoraInicio)}
                      </span>{" "}
                      <span className="text-[var(--color-foreground-muted)]">
                        · {c.paciente.apellidos}, {c.paciente.nombre} · {c.tipoConsulta.nombre}
                      </span>
                    </div>
                    <Badge tone={TONO_ESTADO[c.estado]}>{c.estado}</Badge>
                  </div>

                  {activa && (
                    <div className="mt-2.5 flex items-center gap-4">
                      {c.estado === "AGENDADA" && (
                        <form action={confirmarConId}>
                          <button type="submit" className={linkAction} style={{ color: "var(--color-success)" }}>
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
                        <button type="submit" className={linkDanger}>
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
