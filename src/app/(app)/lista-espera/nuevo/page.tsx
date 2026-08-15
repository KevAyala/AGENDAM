import Link from "next/link";
import { prisma } from "@/lib/prisma";
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
      <h1 className="mb-6 text-lg font-semibold text-[var(--color-brand-azul-funcional)]">
        Agregar a lista de espera
      </h1>

      {!pacienteSeleccionado ? (
        <div>
          <form className="flex gap-2">
            <input
              type="text"
              name="pacienteQ"
              defaultValue={params.pacienteQ}
              placeholder="Buscar paciente por nombre o teléfono…"
              className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm">
              Buscar
            </button>
          </form>
          {resultadosBusqueda.length > 0 && (
            <ul className="mt-3 divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)]">
              {resultadosBusqueda.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/lista-espera/nuevo?pacienteId=${p.id}`}
                    className="block px-3 py-2 text-sm hover:bg-black/[0.02]"
                  >
                    {p.apellidos}, {p.nombre} — {p.telefono}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between rounded-md bg-black/[0.03] px-3 py-2 text-sm">
            <span>
              Paciente: <strong>{pacienteSeleccionado.apellidos}, {pacienteSeleccionado.nombre}</strong>
            </span>
            <Link href="/lista-espera/nuevo" className="text-xs text-[var(--color-brand-azul-funcional)] hover:underline">
              Cambiar
            </Link>
          </div>

          <form action={agregarAListaEspera} className="flex flex-col gap-4">
            <input type="hidden" name="pacienteId" value={pacienteSeleccionado.id} />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="motivo" className="text-sm font-medium text-[#1a1a1a]">
                Motivo (consulta corta conocida)
              </label>
              <input
                id="motivo"
                name="motivo"
                required
                className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
              />
            </div>
            {params.error && <p className="text-sm text-[#d4183d]">El motivo es obligatorio.</p>}
            <button
              type="submit"
              className="mt-2 self-start rounded-md bg-[var(--color-brand-azul-funcional)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Agregar a la lista
            </button>
          </form>
        </>
      )}
    </div>
  );
}
