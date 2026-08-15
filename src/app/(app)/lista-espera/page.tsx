import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, card, cardRow, btnPrimary, linkAction, linkDanger } from "@/components/ui";
import { marcarAsignada, marcarCancelada } from "./actions";

const FORMATO_FECHA = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });

export default async function ListaEsperaPage() {
  const entradas = await prisma.listaEspera.findMany({
    where: { estatus: "EN_ESPERA" },
    include: { paciente: true },
    orderBy: { fechaRegistro: "asc" },
  });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        kicker="Turnos"
        title="Lista de espera"
        subtitle="Pacientes con consultas cortas conocidas — RF-035c. Se atienden entre pacientes agendados cuando el médico tiene tiempo."
        action={
          <Link href="/lista-espera/nuevo" className={btnPrimary}>
            + Agregar
          </Link>
        }
      />

      <div className={card}>
        {entradas.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-[var(--color-foreground-faint)]">
            Lista de espera vacía.
          </p>
        )}
        {entradas.map((e) => (
          <div key={e.id} className={`flex items-center justify-between ${cardRow}`}>
            <div>
              <span className="text-sm font-semibold text-[var(--color-foreground)]">
                {e.paciente.apellidos}, {e.paciente.nombre}
              </span>
              <div className="text-xs text-[var(--color-foreground-faint)]">
                {e.motivo} · desde {FORMATO_FECHA.format(e.fechaRegistro)}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <form action={marcarAsignada.bind(null, e.id)}>
                <button type="submit" className={linkAction} style={{ color: "var(--color-success)" }}>
                  Asignar
                </button>
              </form>
              <form action={marcarCancelada.bind(null, e.id)}>
                <button type="submit" className={linkDanger}>
                  Cancelar
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
