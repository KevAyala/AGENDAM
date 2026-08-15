import { btnPrimary, input, label as labelClass } from "@/components/ui";

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
    <form action={action} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nombre" className={labelClass}>
            Nombre
          </label>
          <input id="nombre" name="nombre" required defaultValue={valores?.nombre} className={input} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="apellidos" className={labelClass}>
            Apellidos
          </label>
          <input id="apellidos" name="apellidos" required defaultValue={valores?.apellidos} className={input} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="telefono" className={labelClass}>
            Teléfono
          </label>
          <input id="telefono" name="telefono" required defaultValue={valores?.telefono} className={input} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fechaNacimiento" className={labelClass}>
            Fecha de nacimiento
          </label>
          <input
            id="fechaNacimiento"
            name="fechaNacimiento"
            type="date"
            defaultValue={fechaISO}
            className={input}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notas" className={labelClass}>
          Notas administrativas (opcional)
        </label>
        <textarea id="notas" name="notas" rows={3} defaultValue={valores?.notas ?? ""} className={input} />
      </div>

      {error === "faltan_campos" && (
        <p className="text-sm text-[var(--color-danger)]">Nombre, apellidos y teléfono son obligatorios.</p>
      )}

      <button type="submit" className={`mt-1 self-start ${btnPrimary}`}>
        {textoBoton}
      </button>
    </form>
  );
}
