import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const busqueda = q?.trim() ?? "";

  const pacientes = await prisma.paciente.findMany({
    where: busqueda
      ? {
          activo: true,
          OR: [
            { nombre: { contains: busqueda, mode: "insensitive" } },
            { apellidos: { contains: busqueda, mode: "insensitive" } },
            { telefono: { contains: busqueda, mode: "insensitive" } },
          ],
        }
      : { activo: true },
    orderBy: [{ apellidos: "asc" }, { nombre: "asc" }],
    take: 50,
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[var(--color-brand-azul-funcional)]">Pacientes</h1>
        <Link
          href="/pacientes/nuevo"
          className="rounded-md bg-[var(--color-brand-azul-funcional)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
        >
          Nuevo paciente
        </Link>
      </div>

      <form className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={busqueda}
          placeholder="Buscar por nombre, apellido o teléfono…"
          className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-azul-funcional)]"
        />
        <button
          type="submit"
          className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm hover:border-[var(--color-brand-azul-funcional)]"
        >
          Buscar
        </button>
      </form>

      <div className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)]">
        {pacientes.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-black/40">
            {busqueda ? "Sin resultados para esa búsqueda." : "Todavía no hay pacientes registrados."}
          </p>
        )}
        {pacientes.map((p) => (
          <Link
            key={p.id}
            href={`/pacientes/${p.id}`}
            className="flex items-center justify-between px-4 py-3 text-sm hover:bg-black/[0.02]"
          >
            <span className="font-medium text-[#1a1a1a]">
              {p.apellidos}, {p.nombre}
            </span>
            <span className="text-black/40">{p.telefono}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
