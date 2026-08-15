import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { crearCita } from "../actions";

const ERRORES: Record<string, string> = {
  faltan_campos: "Faltan campos obligatorios.",
  tipo_invalido: "El tipo de consulta seleccionado ya no existe.",
  traslape: "Ese médico ya tiene una cita activa que se traslapa con ese horario.",
};

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function NuevaCitaPage({
  searchParams,
}: {
  searchParams: Promise<{ pacienteId?: string; pacienteQ?: string; medicoId?: string; fecha?: string; error?: string }>;
}) {
  const params = await searchParams;

  const [medicos, tiposConsulta, pacienteSeleccionado] = await Promise.all([
    prisma.usuario.findMany({ where: { rol: "MEDICO", activo: true }, orderBy: { nombre: "asc" } }),
    prisma.tipoConsulta.findMany({ where: { requiereAgenda: true }, orderBy: [{ nombre: "asc" }, { duracionMin: "asc" }] }),
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
      <h1 className="mb-6 text-lg font-semibold text-[var(--color-brand-azul-funcional)]">Nueva cita</h1>

      {/* Paso 1: elegir paciente (si no viene preseleccionado desde su ficha) */}
      {!pacienteSeleccionado ? (
        <div className="mb-6">
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
                    href={`/agenda/nueva?pacienteId=${p.id}`}
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
        <div className="mb-6 flex items-center justify-between rounded-md bg-black/[0.03] px-3 py-2 text-sm">
          <span>
            Paciente: <strong>{pacienteSeleccionado.apellidos}, {pacienteSeleccionado.nombre}</strong>
          </span>
          <Link href="/agenda/nueva" className="text-xs text-[var(--color-brand-azul-funcional)] hover:underline">
            Cambiar
          </Link>
        </div>
      )}

      {/* Paso 2: datos de la cita — solo con paciente ya elegido */}
      {pacienteSeleccionado && (
        <form action={crearCita} className="flex flex-col gap-4">
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

          <div className="flex flex-col gap-1.5">
            <label htmlFor="tipoConsultaId" className="text-sm font-medium text-[#1a1a1a]">
              Tipo de consulta
            </label>
            <select
              id="tipoConsultaId"
              name="tipoConsultaId"
              required
              className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
            >
              <option value="" disabled>
                Selecciona…
              </option>
              {tiposConsulta.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} — {t.duracionMin} min
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fecha" className="text-sm font-medium text-[#1a1a1a]">
                Fecha
              </label>
              <input
                id="fecha"
                name="fecha"
                type="date"
                required
                defaultValue={params.fecha || hoyISO()}
                className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="hora" className="text-sm font-medium text-[#1a1a1a]">
                Hora
              </label>
              <input
                id="hora"
                name="hora"
                type="time"
                required
                className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="notas" className="text-sm font-medium text-[#1a1a1a]">
              Notas (opcional)
            </label>
            <textarea
              id="notas"
              name="notas"
              rows={2}
              className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
            />
          </div>

          {params.error && (
            <p className="text-sm text-[#d4183d]">{ERRORES[params.error] ?? "No se pudo agendar la cita."}</p>
          )}

          <button
            type="submit"
            className="mt-2 self-start rounded-md bg-[var(--color-brand-azul-funcional)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Agendar cita
          </button>
        </form>
      )}
    </div>
  );
}
