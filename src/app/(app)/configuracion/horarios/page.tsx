import { prisma } from "@/lib/prisma";
import { guardarHorario } from "./actions";

const NOMBRES_DIA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const RANGOS_POR_DIA = 2;

export default async function HorariosPage({
  searchParams,
}: {
  searchParams: Promise<{ medicoId?: string; guardado?: string }>;
}) {
  const params = await searchParams;

  const medicos = await prisma.usuario.findMany({
    where: { rol: "MEDICO", activo: true },
    orderBy: { nombre: "asc" },
  });
  const medicoId = params.medicoId || medicos[0]?.id;

  const horarios = medicoId
    ? await prisma.horarioMedico.findMany({
        where: { medicoId },
        orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }],
      })
    : [];

  // Hasta RANGOS_POR_DIA franjas por día, para precargar el formulario.
  const franjasPorDia: { horaInicio: string; horaFin: string }[][] = Array.from({ length: 7 }, (_, dia) =>
    horarios.filter((h) => h.diaSemana === dia).slice(0, RANGOS_POR_DIA),
  );

  const guardarConId = medicoId ? guardarHorario.bind(null, medicoId) : undefined;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-lg font-semibold text-[var(--color-brand-azul-funcional)]">
        Horario laboral por médico
      </h1>
      <p className="text-xs text-black/40">
        Hasta {RANGOS_POR_DIA} franjas por día (ej. Lun/Mié/Vie 11:00–14:00 y 17:00–20:40) — RF-029b.
      </p>

      {medicos.length === 0 ? (
        <p className="text-sm text-black/40">Todavía no hay médicos dados de alta.</p>
      ) : (
        <>
          <form className="flex items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="medicoId" className="text-xs font-medium text-black/50">
                Médico
              </label>
              <select
                id="medicoId"
                name="medicoId"
                defaultValue={medicoId}
                className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
              >
                {medicos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm">
              Ver
            </button>
          </form>

          {params.guardado === "1" && <p className="text-sm text-green-700">Horario guardado.</p>}

          {guardarConId && (
            <form action={guardarConId} className="flex flex-col gap-3">
              {NOMBRES_DIA.map((nombreDia, dia) => (
                <div key={dia} className="grid grid-cols-[100px_1fr] items-center gap-3 text-sm">
                  <span className="font-medium text-[#1a1a1a]">{nombreDia}</span>
                  <div className="flex gap-3">
                    {Array.from({ length: RANGOS_POR_DIA }, (_, rango) => (
                      <div key={rango} className="flex items-center gap-1.5">
                        <input
                          type="time"
                          name={`dia${dia}_inicio${rango}`}
                          defaultValue={franjasPorDia[dia][rango]?.horaInicio}
                          className="w-24 rounded-md border border-[var(--color-border)] px-2 py-1"
                        />
                        <span className="text-black/30">–</span>
                        <input
                          type="time"
                          name={`dia${dia}_fin${rango}`}
                          defaultValue={franjasPorDia[dia][rango]?.horaFin}
                          className="w-24 rounded-md border border-[var(--color-border)] px-2 py-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button
                type="submit"
                className="mt-2 self-start rounded-md bg-[var(--color-brand-azul-funcional)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Guardar horario
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
