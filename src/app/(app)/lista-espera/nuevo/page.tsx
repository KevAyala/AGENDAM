import { prisma } from "@/lib/prisma";
import { PageHeader, btnPrimary, input, label as labelClass } from "@/components/ui";
import { BuscadorPaciente } from "@/components/PacienteBuscador";
import { agregarAListaEspera } from "../actions";

export default async function NuevaListaEsperaPage({
  searchParams,
}: {
  searchParams: Promise<{ pacienteId?: string; pacienteQ?: string; error?: string }>;
}) {
  const params = await searchParams;

  const pacienteSeleccionado = params.pacienteId
    ? await prisma.paciente.findUnique({ where: { id: params.pacienteId } })
    : null;

  const resultadosBusqueda = params.pacienteQ
    ? await prisma.paciente.findMany({
        where: {
          activo: true,
          OR: [
            { nombre: { contains: params.pacienteQ, mode: "insensitive" } },
            { apellidos: { contains: params.pacienteQ, mode: "insensitive" } },
            { telefono: { contains: params.pacienteQ, mode: "insensitive" } },
          ],
        },
        take: 8,
      })
    : [];

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader kicker="Turnos" title="Agregar a lista de espera" />
      <div className="mt-6">
        <BuscadorPaciente
          basePath="/lista-espera/nuevo"
          pacienteSeleccionado={pacienteSeleccionado}
          query={params.pacienteQ}
          resultados={resultadosBusqueda}
        />
      </div>

      {pacienteSeleccionado && (
        <form action={agregarAListaEspera} className="flex flex-col gap-4">
          <input type="hidden" name="pacienteId" value={pacienteSeleccionado.id} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="motivo" className={labelClass}>
              Motivo (consulta corta conocida)
            </label>
            <input id="motivo" name="motivo" required className={input} />
          </div>
          {params.error && <p className="text-sm text-[var(--color-danger)]">El motivo es obligatorio.</p>}
          <button type="submit" className={`mt-2 self-start ${btnPrimary}`}>
            Agregar a la lista
          </button>
        </form>
      )}
    </div>
  );
}
