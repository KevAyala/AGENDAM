import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { obtenerUltimoMedicoId } from "@/lib/ultimo-medico";
import { PageHeader, Kicker, Badge, card, cardRow, btnPrimary, btnSecondarySm, linkAction, linkDanger, linkMuted, type Tono } from "@/components/ui";
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

const TONO_TIPO: Record<string, Tono> = {
  CITA_AGENDADA: "info",
  APLICACION: "warning",
  SIN_CITA: "neutral",
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
      <div className="mx-auto max-w-2xl text-sm text-[var(--color-foreground-faint)]">
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
    <div className="mx-auto flex max-w-3xl flex-col gap-9">
      <PageHeader
        kicker="Fase 2"
        title="Turnos — hoy"
        action={
          <Link href={`/turnos/nuevo?medicoId=${medicoId}`} className={btnPrimary}>
            + Aplicación / sin cita
          </Link>
        }
      />

      <form action={filtrarTurnos} className={`flex items-end gap-3 p-4 ${card}`}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="medicoId" className="text-xs font-medium text-[var(--color-foreground-muted)]">
            Médico
          </label>
          <select
            id="medicoId"
            name="medicoId"
            defaultValue={medicoId}
            className="rounded-lg border border-[var(--color-border)] bg-white/80 px-3.5 py-2.5 text-[15px]"
          >
            {medicos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg border border-[var(--color-border)] bg-white/70 px-5 py-2.5 text-sm font-semibold backdrop-blur hover:border-[var(--color-brand-azul-funcional)]"
        >
          Ver
        </button>
      </form>

      {/* En atención ahora */}
      <div>
        <Kicker className="mb-2.5 block">En atención</Kicker>
        {enAtencion ? (
          <div
            className="rounded-2xl px-6 py-5 backdrop-blur-xl"
            style={{
              background: "linear-gradient(135deg, rgba(178,213,229,0.28) 0%, rgba(251,234,240,0.45) 100%)",
              border: "1px solid rgba(47,111,148,0.25)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-[var(--color-foreground)]">
                {enAtencion.paciente.apellidos}, {enAtencion.paciente.nombre}
              </span>
              <Badge tone={TONO_TIPO[enAtencion.tipo]}>{ETIQUETA_TIPO[enAtencion.tipo]}</Badge>
            </div>
            <form action={finalizarAtencion.bind(null, enAtencion.id)} className="mt-4 flex items-end gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--color-foreground-muted)]">
                  Monto a cobrar (RF-038)
                </label>
                <input
                  type="number"
                  name="montoACobrar"
                  step="0.01"
                  min="0"
                  className="w-32 rounded-lg border border-[var(--color-border)] bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-brand-azul-funcional)]"
                />
              </div>
              <button type="submit" className={btnPrimary}>
                Finalizar consulta
              </button>
            </form>
          </div>
        ) : (
          <p className="text-sm text-[var(--color-foreground-faint)]">Nadie en atención en este momento.</p>
        )}
      </div>

      {/* Cola de espera */}
      <div>
        <Kicker className="mb-2.5 block">
          Cola de espera <span className="normal-case tracking-normal opacity-60">— RF-035</span>
        </Kicker>
        {cola.length === 0 ? (
          <p className="text-sm text-[var(--color-foreground-faint)]">Sin pacientes en espera.</p>
        ) : (
          <div className={card}>
            {cola.map((t, i) => {
              const espera = minutosEsperando(t);

              return (
                <div key={t.id} className={`flex items-center justify-between ${cardRow}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="kicker text-[var(--color-foreground-faint)]">{i + 1}</span>
                      <span className="text-[15px] font-semibold text-[var(--color-foreground)]">
                        {t.paciente.apellidos}, {t.paciente.nombre}
                      </span>
                      <Badge tone={TONO_TIPO[t.tipo]}>{ETIQUETA_TIPO[t.tipo]}</Badge>
                      {t.cita && (
                        <span className="text-sm text-[var(--color-foreground-faint)]">
                          cita {FORMATO_HORA.format(t.cita.fechaHoraInicio)} · {t.cita.tipoConsulta.nombre}
                        </span>
                      )}
                    </div>
                    <div
                      className={`mt-1.5 text-sm font-medium ${espera >= 30 ? "text-[var(--color-danger)]" : "text-[var(--color-foreground-faint)]"}`}
                    >
                      esperando {espera} min
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {!enAtencion && (
                      <form action={iniciarAtencion.bind(null, t.id)}>
                        <button type="submit" className={linkAction} style={{ color: "var(--color-success)" }}>
                          Iniciar
                        </button>
                      </form>
                    )}
                    <form action={marcarNoAsistio.bind(null, t.id)}>
                      <button type="submit" className={linkMuted}>
                        No asistió
                      </button>
                    </form>
                    <form action={cancelarTurno.bind(null, t.id)}>
                      <button type="submit" className={linkDanger}>
                        Cancelar
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Citas de hoy sin llegada registrada */}
      <div>
        <Kicker className="mb-2.5 block">Citas de hoy — registrar llegada</Kicker>
        {citasSinLlegada.length === 0 ? (
          <p className="text-sm text-[var(--color-foreground-faint)]">No hay citas pendientes de llegada para hoy.</p>
        ) : (
          <div className={card}>
            {citasSinLlegada.map((c) => (
              <div key={c.id} className={`flex items-center justify-between ${cardRow}`}>
                <span className="text-sm">
                  <span className="font-semibold text-[var(--color-foreground)]">
                    {FORMATO_HORA.format(c.fechaHoraInicio)}
                  </span>{" "}
                  · {c.paciente.apellidos}, {c.paciente.nombre} · {c.tipoConsulta.nombre}
                </span>
                <form action={registrarLlegadaCita.bind(null, c.id)}>
                  <button type="submit" className={btnSecondarySm}>
                    Llegó
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
