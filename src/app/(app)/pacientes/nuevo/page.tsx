import { PageHeader, card } from "@/components/ui";
import { PacienteForm } from "../PacienteForm";
import { crearPaciente } from "../actions";

export default async function NuevoPacientePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader kicker="Pacientes" title="Nuevo paciente" />
      <div className={`mt-6 p-6 ${card}`}>
        <PacienteForm action={crearPaciente} error={error} textoBoton="Registrar paciente" />
      </div>
    </div>
  );
}
