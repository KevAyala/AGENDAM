import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, card, cardRow, btnPrimary, input } from "@/components/ui";

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
      <PageHeader
        kicker="Núcleo"
        title="Pacientes"
        action={
          <Link href="/pacientes/nuevo" className={btnPrimary}>
            + Nuevo paciente
          </Link>
        }
      />

      <form className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={busqueda}
          placeholder="Buscar por nombre, apellido o teléfono…"
          className={input}
        />
        <button type="submit" className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:border-[var(--color-brand-azul-funcional)]">
          Buscar
        </button>
      </form>

      <div className={card}>
        {pacientes.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-[var(--color-foreground-faint)]">
            {busqueda ? "Sin resultados para esa búsqueda." : "Todavía no hay pacientes registrados."}
          </p>
        )}
        {pacientes.map((p) => (
          <Link key={p.id} href={`/pacientes/${p.id}`} className={`flex items-center justify-between ${cardRow}`}>
            <span className="text-sm font-semibold text-[var(--color-foreground)]">
              {p.apellidos}, {p.nombre}
            </span>
            <span className="kicker text-[var(--color-foreground-faint)]">{p.telefono}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
