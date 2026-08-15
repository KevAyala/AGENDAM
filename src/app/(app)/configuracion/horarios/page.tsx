import { prisma } from "@/lib/prisma";
import { PageHeader, card, btnPrimary } from "@/components/ui";
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
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <PageHeader
        kicker="RF-029b"
        title="Horario laboral por médico"
        subtitle={`Hasta ${RANGOS_POR_DIA} franjas por día (ej. Lun/Mié/Vie 11:00–14:00 y 17:00–20:40).`}
      />

      {medicos.length === 0 ? (
        <p className="text-sm text-[var(--color-foreground-faint)]">Todavía no hay médicos dados de alta.</p>
      ) : (
        <>
          <form className={`flex items-end gap-3 p-4 ${card}`}>
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

          {params.guardado === "1" && <p className="text-sm text-[var(--color-success)]">Horario guardado.</p>}

          {guardarConId && (
            <form action={guardarConId} className={`flex flex-col gap-4 p-5 ${card}`}>
              {NOMBRES_DIA.map((nombreDia, dia) => (
                <div key={dia} className="grid grid-cols-[100px_1fr] items-center gap-3 text-sm">
                  <span className="font-semibold text-[var(--color-foreground)]">{nombreDia}</span>
                  <div className="flex gap-3">
                    {Array.from({ length: RANGOS_POR_DIA }, (_, rango) => (
                      <div key={rango} className="flex items-center gap-1.5">
                        <input
                          type="time"
                          name={`dia${dia}_inicio${rango}`}
                          defaultValue={franjasPorDia[dia][rango]?.horaInicio}
                          className="w-24 rounded-md border border-[var(--color-border)] px-2 py-1"
                        />
                        <span className="text-[var(--color-foreground-faint)]">–</span>
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
              <button type="submit" className={`mt-2 self-start ${btnPrimary}`}>
                Guardar horario
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
