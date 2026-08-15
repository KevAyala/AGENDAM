import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader, Badge, Kicker, card, cardRow, linkAction, type Tono } from "@/components/ui";
import { PacienteForm } from "../PacienteForm";
import { actualizarPaciente } from "../actions";

const FORMATO_FECHA = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

const TONO_ESTADO: Record<string, Tono> = {
  AGENDADA: "neutral",
  CONFIRMADA: "success",
  REPROGRAMADA: "warning",
  CANCELADA: "strike",
  COMPLETADA: "neutral",
  NO_ASISTIO: "danger",
};

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
    <div className="mx-auto flex max-w-xl flex-col gap-10">
      <div>
        <PageHeader kicker="Paciente" title={`${paciente.apellidos}, ${paciente.nombre}`} />
        {guardado === "1" && <p className="mt-3 text-sm text-[var(--color-success)]">Cambios guardados.</p>}
        <div className={`mt-6 p-6 ${card}`}>
          <PacienteForm action={actualizarConId} valores={paciente} error={error} textoBoton="Guardar cambios" />
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <Kicker>Próximas citas</Kicker>
          <Link href={`/agenda/nueva?pacienteId=${paciente.id}`} className={linkAction}>
            + Nueva cita
          </Link>
        </div>
        {paciente.citas.length === 0 ? (
          <p className="text-sm text-[var(--color-foreground-faint)]">Sin citas próximas.</p>
        ) : (
          <div className={card}>
            {paciente.citas.map((c) => (
              <div key={c.id} className={`flex items-center justify-between ${cardRow}`}>
                <span className="text-sm">
                  {FORMATO_FECHA.format(c.fechaHoraInicio)} · Dr(a). {c.medico.nombre} · {c.tipoConsulta.nombre}
                </span>
                <Badge tone={TONO_ESTADO[c.estado]}>{c.estado}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
