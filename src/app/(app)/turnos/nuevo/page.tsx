import { prisma } from "@/lib/prisma";
import { PageHeader, btnPrimary, input, label as labelClass } from "@/components/ui";
import { BuscadorPaciente } from "@/components/PacienteBuscador";
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
      <PageHeader
        kicker="Turnos"
        title="Registrar turno sin cita"
        subtitle="Aplicación (5 min) o paciente que llega sin cita a consulta regular — RF-039 / RF-035b."
      />
      <div className="mt-6">
        <BuscadorPaciente
          basePath="/turnos/nuevo"
          pacienteSeleccionado={pacienteSeleccionado}
          query={params.pacienteQ}
          resultados={resultadosBusqueda}
        />
      </div>

      {pacienteSeleccionado && (
        <form action={registrarTurnoDirecto} className="flex flex-col gap-4">
          <input type="hidden" name="pacienteId" value={pacienteSeleccionado.id} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="medicoId" className={labelClass}>
              Médico
            </label>
            <select id="medicoId" name="medicoId" required defaultValue={params.medicoId} className={input}>
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
            <legend className={labelClass}>Tipo de turno</legend>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="tipo" value="APLICACION" defaultChecked />
              Aplicación (5 min, no agendada)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="tipo" value="SIN_CITA" />
              Consulta regular sin cita previa
            </label>
          </fieldset>

          {params.error && <p className="text-sm text-[var(--color-danger)]">Selecciona médico y tipo de turno.</p>}

          <button type="submit" className={`mt-2 self-start ${btnPrimary}`}>
            Agregar a la cola
          </button>
        </form>
      )}
    </div>
  );
}
