import Link from "next/link";
import type { Paciente } from "@prisma/client";
import { card, cardRow, input, linkAction } from "@/components/ui";

/**
 * Paso "elegir paciente" reutilizado en Agenda, Turnos y Lista de espera —
 * mismo patrón de búsqueda + selección, un solo lugar para el diseño.
 * `basePath` es la página donde vive el flujo (ej. "/agenda/nueva").
 */
export function BuscadorPaciente({
  basePath,
  pacienteSeleccionado,
  query,
  resultados,
}: {
  basePath: string;
  pacienteSeleccionado: Paciente | null;
  query?: string;
  resultados: Paciente[];
}) {
  if (pacienteSeleccionado) {
    return (
      <div className={`mb-6 flex items-center justify-between px-4 py-3 text-sm ${card}`}>
        <span>
          Paciente:{" "}
          <strong className="text-[var(--color-foreground)]">
            {pacienteSeleccionado.apellidos}, {pacienteSeleccionado.nombre}
          </strong>
        </span>
        <Link href={basePath} className={linkAction}>
          Cambiar
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <form className="flex gap-2">
        <input
          type="text"
          name="pacienteQ"
          defaultValue={query}
          placeholder="Buscar paciente por nombre o teléfono…"
          className={input}
        />
        <button type="submit" className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium">
          Buscar
        </button>
      </form>
      {resultados.length > 0 && (
        <div className={`mt-3 ${card}`}>
          {resultados.map((p) => (
            <Link key={p.id} href={`${basePath}?pacienteId=${p.id}`} className={`block ${cardRow}`}>
              <span className="text-sm">
                {p.apellidos}, {p.nombre} — <span className="text-[var(--color-foreground-faint)]">{p.telefono}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
      {query && resultados.length === 0 && (
        <p className="mt-3 text-sm text-[var(--color-foreground-faint)]">
          Sin resultados.{" "}
          <Link href="/pacientes/nuevo" className={linkAction}>
            Registrar paciente nuevo
          </Link>
          .
        </p>
      )}
    </div>
  );
}
