import Link from "next/link";
import { obtenerUsuarioActual } from "@/lib/current-user";
import { SmallLogotype } from "@/components/brand";
import { cerrarSesion } from "../login/actions";

const ENLACES = [
  { href: "/", label: "Inicio" },
  { href: "/pacientes", label: "Pacientes" },
  { href: "/agenda", label: "Agenda" },
  { href: "/turnos", label: "Turnos" },
  { href: "/lista-espera", label: "Lista de espera" },
  { href: "/configuracion/horarios", label: "Horarios" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { authUser, usuario } = await obtenerUsuarioActual();

  return (
    <div className="app-shell-bg flex min-h-full flex-1 flex-col">
      <nav
        className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/70 bg-white/70 px-8 py-5 shadow-[var(--shadow-card)] backdrop-blur-xl"
      >
        <div className="flex items-center gap-10">
          <SmallLogotype markSize={30} fontSize={14} textColor="#2F6F94" />
          <div className="flex items-center gap-6">
            {ENLACES.map((enlace) => (
              <Link
                key={enlace.href}
                href={enlace.href}
                className="kicker text-[var(--color-foreground-muted)] transition-colors hover:text-[var(--color-brand-azul-funcional)]"
              >
                {enlace.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-5">
          <span className="kicker text-[var(--color-foreground-faint)]">
            {usuario ? `${usuario.nombre} · ${usuario.rol}` : authUser.email}
          </span>
          <form action={cerrarSesion}>
            <button
              type="submit"
              className="kicker text-[var(--color-foreground-muted)] transition-colors hover:text-[var(--color-brand-azul-funcional)]"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </nav>

      {!usuario && (
        <div className="bg-[var(--color-brand-rosa-claro)] px-6 py-2.5 text-center text-sm text-[#7a3049]">
          Tu cuenta existe en Supabase Auth pero no tiene fila en <code>usuarios</code> — pide
          a un Administrador que te dé de alta (rol) antes de usar el resto de la app.
        </div>
      )}

      <main className="flex-1 px-8 py-14">{children}</main>
    </div>
  );
}
