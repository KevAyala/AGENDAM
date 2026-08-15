type PacienteValores = {
  nombre?: string;
  apellidos?: string;
  telefono?: string;
  fechaNacimiento?: Date | null;
  notas?: string | null;
};

export function PacienteForm({
  action,
  valores,
  error,
  textoBoton,
}: {
  action: (formData: FormData) => void;
  valores?: PacienteValores;
  error?: string;
  textoBoton: string;
}) {
  const fechaISO = valores?.fechaNacimiento
    ? new Date(valores.fechaNacimiento).toISOString().slice(0, 10)
    : "";

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nombre" className="text-sm font-medium text-[#1a1a1a]">
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            required
            defaultValue={valores?.nombre}
            className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-azul-funcional)]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="apellidos" className="text-sm font-medium text-[#1a1a1a]">
            Apellidos
          </label>
          <input
            id="apellidos"
            name="apellidos"
            required
            defaultValue={valores?.apellidos}
            className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-azul-funcional)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="telefono" className="text-sm font-medium text-[#1a1a1a]">
            Teléfono
          </label>
          <input
            id="telefono"
            name="telefono"
            required
            defaultValue={valores?.telefono}
            className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-azul-funcional)]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fechaNacimiento" className="text-sm font-medium text-[#1a1a1a]">
            Fecha de nacimiento
          </label>
          <input
            id="fechaNacimiento"
            name="fechaNacimiento"
            type="date"
            defaultValue={fechaISO}
            className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-azul-funcional)]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notas" className="text-sm font-medium text-[#1a1a1a]">
          Notas administrativas (opcional)
        </label>
        <textarea
          id="notas"
          name="notas"
          rows={3}
          defaultValue={valores?.notas ?? ""}
          className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-azul-funcional)]"
        />
      </div>

      {error === "faltan_campos" && (
        <p className="text-sm text-[#d4183d]">Nombre, apellidos y teléfono son obligatorios.</p>
      )}

      <button
        type="submit"
        className="mt-2 self-start rounded-md bg-[var(--color-brand-azul-funcional)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
      >
        {textoBoton}
      </button>
    </form>
  );
}
