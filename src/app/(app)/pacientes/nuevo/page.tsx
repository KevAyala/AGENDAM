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
      <h1 className="mb-6 text-lg font-semibold text-[var(--color-brand-azul-funcional)]">
        Nuevo paciente
      </h1>
      <PacienteForm action={crearPaciente} error={error} textoBoton="Registrar paciente" />
    </div>
  );
}
