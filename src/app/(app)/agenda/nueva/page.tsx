import { prisma } from "@/lib/prisma";
import { PageHeader, btnPrimary, input, label as labelClass } from "@/components/ui";
import { BuscadorPaciente } from "@/components/PacienteBuscador";
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
      <PageHeader kicker="Agenda" title="Nueva cita" />
      <div className="mt-6">
        <BuscadorPaciente
          basePath="/agenda/nueva"
          pacienteSeleccionado={pacienteSeleccionado}
          query={params.pacienteQ}
          resultados={resultadosBusqueda}
        />
      </div>

      {/* Paso 2: datos de la cita — solo con paciente ya elegido */}
      {pacienteSeleccionado && (
        <form action={crearCita} className="flex flex-col gap-4">
          <input type="hidden" name="pacienteId" value={pacienteSeleccionado.id} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="medicoId" className={labelClass}>
              Médico
            </label>
            <select
              id="medicoId"
              name="medicoId"
              required
              defaultValue={params.medicoId}
              className={input}
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
            <label htmlFor="tipoConsultaId" className={labelClass}>
              Tipo de consulta
            </label>
            <select id="tipoConsultaId" name="tipoConsultaId" required className={input}>
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
              <label htmlFor="fecha" className={labelClass}>
                Fecha
              </label>
              <input
                id="fecha"
                name="fecha"
                type="date"
                required
                defaultValue={params.fecha || hoyISO()}
                className={input}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="hora" className={labelClass}>
                Hora
              </label>
              <input id="hora" name="hora" type="time" required className={input} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="notas" className={labelClass}>
              Notas (opcional)
            </label>
            <textarea id="notas" name="notas" rows={2} className={input} />
          </div>

          {params.error && (
            <p className="text-sm text-[var(--color-danger)]">
              {ERRORES[params.error] ?? "No se pudo agendar la cita."}
            </p>
          )}

          <button type="submit" className={`mt-2 self-start ${btnPrimary}`}>
            Agendar cita
          </button>
        </form>
      )}
    </div>
  );
}
