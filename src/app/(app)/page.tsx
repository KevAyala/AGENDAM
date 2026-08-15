import Link from "next/link";
import { obtenerUsuarioActual } from "@/lib/current-user";
import { PageHeader, card } from "@/components/ui";

const ACCESOS = [
  { href: "/pacientes", titulo: "Pacientes", desc: "Registrar y buscar pacientes.", num: "01" },
  { href: "/agenda", titulo: "Agenda", desc: "Ver y crear citas por médico.", num: "02" },
  { href: "/turnos", titulo: "Turnos", desc: "Cola de espera del día, por médico.", num: "03" },
  { href: "/lista-espera", titulo: "Lista de espera", desc: "Consultas cortas pendientes de hueco.", num: "04" },
  { href: "/configuracion/horarios", titulo: "Horarios", desc: "Horario laboral de cada médico.", num: "05" },
];

export default async function Home() {
  const { authUser, usuario } = await obtenerUsuarioActual();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10">
      <PageHeader
        kicker="AGENDAM"
        title={`Hola${usuario ? `, ${usuario.nombre.split(" ")[0]}` : ""}`}
        subtitle={
          <>
            Sesión iniciada como <strong className="text-[var(--color-foreground)]">{authUser.email}</strong>
            {usuario && (
              <>
                {" "}· rol <strong className="text-[var(--color-foreground)]">{usuario.rol}</strong>
              </>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACCESOS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={`group flex flex-col gap-3 p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--color-brand-azul-funcional)]/40 ${card}`}
          >
            <span className="kicker text-[var(--color-brand-azul-principal)]" style={{ opacity: 0.9 }}>
              {a.num}
            </span>
            <div>
              <div className="text-sm font-bold text-[var(--color-foreground)] group-hover:text-[var(--color-brand-azul-funcional)]">
                {a.titulo}
              </div>
              <p className="mt-1 text-xs text-[var(--color-foreground-muted)]">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
