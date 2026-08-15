import Link from "next/link";
import { prisma } from "@/lib/prisma";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-brand-azul-funcional)]">Lista de espera</h1>
          <p className="text-xs text-black/40">
            Pacientes con consultas cortas conocidas — RF-035c. Se atienden entre pacientes
            agendados cuando el médico tiene tiempo.
          </p>
        </div>
        <Link
          href="/lista-espera/nuevo"
          className="rounded-md bg-[var(--color-brand-azul-funcional)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
        >
          Agregar
        </Link>
      </div>

      <div className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)]">
        {entradas.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-black/40">Lista de espera vacía.</p>
        )}
        {entradas.map((e) => (
          <div key={e.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <span className="font-medium">
                {e.paciente.apellidos}, {e.paciente.nombre}
              </span>
              <div className="text-xs text-black/40">
                {e.motivo} · desde {FORMATO_FECHA.format(e.fechaRegistro)}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <form action={marcarAsignada.bind(null, e.id)}>
                <button type="submit" className="text-xs text-green-700 hover:underline">
                  Asignar
                </button>
              </form>
              <form action={marcarCancelada.bind(null, e.id)}>
                <button type="submit" className="text-xs text-[#d4183d] hover:underline">
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
