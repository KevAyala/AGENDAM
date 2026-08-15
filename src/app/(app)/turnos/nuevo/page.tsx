import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { registrarTurnoDirecto } from "../actions";

export default async function NuevoTurnoDirectoPage({
  searchParams,
}: {
  searchParams: Promise<{ pacienteId?: string; pacienteQ?: string; medicoId?: string; error?: string }>;
}) {
  const params = await searchParams;

  const [medicos, pacienteSeleccionado] = await Promise.all([
    prisma.usuario.findMany({ where: { rol: "MEDICO", activo: true }, orderBy: { nombre: "asc" } }),
    params.pacienteId ? prisma.paciente.findUnique({ where: { id: params.pacienteId } }) : null,
  ]);

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
        Registrar turno sin cita
      </h1>
      <p className="mb-6 text-xs text-black/40">
        Aplicación (5 min) o paciente que llega sin cita a consulta regular — RF-039 / RF-035b.
      </p>

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
                    href={`/turnos/nuevo?pacienteId=${p.id}`}
                    className="block px-3 py-2 text-sm hover:bg-black/[0.02]"
                  >
                    {p.apellidos}, {p.nombre} — {p.telefono}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {params.pacienteQ && resultadosBusqueda.length === 0 && (
            <p className="mt-3 text-sm text-black/40">
              Sin resultados.{" "}
              <Link href="/pacientes/nuevo" className="text-[var(--color-brand-azul-funcional)] hover:underline">
                Registrar paciente nuevo
              </Link>
              .
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between rounded-md bg-black/[0.03] px-3 py-2 text-sm">
            <span>
              Paciente: <strong>{pacienteSeleccionado.apellidos}, {pacienteSeleccionado.nombre}</strong>
            </span>
            <Link href="/turnos/nuevo" className="text-xs text-[var(--color-brand-azul-funcional)] hover:underline">
              Cambiar
            </Link>
          </div>

          <form action={registrarTurnoDirecto} className="flex flex-col gap-4">
            <input type="hidden" name="pacienteId" value={pacienteSeleccionado.id} />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="medicoId" className="text-sm font-medium text-[#1a1a1a]">
                Médico
              </label>
              <select
                id="medicoId"
                name="medicoId"
                required
                defaultValue={params.medicoId}
                className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
              >
                <option value="" disabled>
                  Selecciona…
                </option>
                {medicos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium text-[#1a1a1a]">Tipo de turno</legend>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="tipo" value="APLICACION" defaultChecked />
                Aplicación (5 min, no agendada)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="tipo" value="SIN_CITA" />
                Consulta regular sin cita previa
              </label>
            </fieldset>

            {params.error && (
              <p className="text-sm text-[#d4183d]">Selecciona médico y tipo de turno.</p>
            )}

            <button
              type="submit"
              className="mt-2 self-start rounded-md bg-[var(--color-brand-azul-funcional)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Agregar a la cola
            </button>
          </form>
        </>
      )}
    </div>
  );
}
