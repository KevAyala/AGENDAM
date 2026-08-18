import Link from "next/link";
import { obtenerUsuarioActual } from "@/lib/current-user";
import { PageHeader, card } from "@/components/ui";

const ACCESOS = [
  { href: "/pacientes", titulo: "Pacientes", desc: "Registrar y buscar pacientes." },
  { href: "/agenda", titulo: "Agenda", desc: "Ver y crear citas por médico." },
  { href: "/turnos", titulo: "Turnos", desc: "Cola de espera del día, por médico." },
  { href: "/lista-espera", titulo: "Lista de espera", desc: "Consultas cortas pendientes de hueco." },
  { href: "/configuracion/horarios", titulo: "Horarios", desc: "Horario laboral de cada médico." },
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ACCESOS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={`group relative flex flex-col gap-2 overflow-hidden p-7 transition-all hover:-translate-y-1 hover:border-[var(--color-brand-azul-funcional)]/40 hover:shadow-[0_20px_44px_-18px_rgba(212,83,126,0.35)] ${card}`}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(212,83,126,0.22) 0%, transparent 70%)" }}
            />
            <div className="relative text-lg font-bold text-[var(--color-foreground)] group-hover:text-[var(--color-brand-azul-funcional)]">
              {a.titulo}
            </div>
            <p className="relative text-[15px] text-[var(--color-foreground-muted)]">{a.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
