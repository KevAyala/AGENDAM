import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PacienteForm } from "../PacienteForm";
import { actualizarPaciente } from "../actions";

const FORMATO_FECHA = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function EditarPacientePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; guardado?: string }>;
}) {
  const { id } = await params;
  const { error, guardado } = await searchParams;

  const paciente = await prisma.paciente.findUnique({
    where: { id },
    include: {
      citas: {
        where: { fechaHoraInicio: { gte: new Date() }, estado: { notIn: ["CANCELADA"] } },
        orderBy: { fechaHoraInicio: "asc" },
        include: { medico: true, tipoConsulta: true },
        take: 5,
      },
    },
  });

  if (!paciente) notFound();

  const actualizarConId = actualizarPaciente.bind(null, paciente.id);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8">
      <div>
        <h1 className="mb-6 text-lg font-semibold text-[var(--color-brand-azul-funcional)]">
          {paciente.apellidos}, {paciente.nombre}
        </h1>
        {guardado === "1" && (
          <p className="mb-4 text-sm text-green-700">Cambios guardados.</p>
        )}
        <PacienteForm
          action={actualizarConId}
          valores={paciente}
          error={error}
          textoBoton="Guardar cambios"
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#1a1a1a]">Próximas citas</h2>
          <Link
            href={`/agenda/nueva?pacienteId=${paciente.id}`}
            className="text-xs font-medium text-[var(--color-brand-azul-funcional)] hover:underline"
          >
            + Nueva cita
          </Link>
        </div>
        {paciente.citas.length === 0 ? (
          <p className="text-sm text-black/40">Sin citas próximas.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)]">
            {paciente.citas.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>
                  {FORMATO_FECHA.format(c.fechaHoraInicio)} · Dr(a). {c.medico.nombre} ·{" "}
                  {c.tipoConsulta.nombre}
                </span>
                <span className="text-xs uppercase tracking-wide text-black/40">{c.estado}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
