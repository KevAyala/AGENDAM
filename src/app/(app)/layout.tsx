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
    <div className="flex min-h-full flex-1 flex-col bg-[var(--color-background)]">
      <nav
        className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 px-6 py-4"
        style={{
          background: "rgba(11,24,41,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(178,213,229,0.12)",
        }}
      >
        <div className="flex items-center gap-8">
          <SmallLogotype />
          <div className="flex items-center gap-5">
            {ENLACES.map((enlace) => (
              <Link
                key={enlace.href}
                href={enlace.href}
                className="kicker text-white/55 transition-colors hover:text-white"
              >
                {enlace.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="kicker text-white/35">
            {usuario ? `${usuario.nombre} · ${usuario.rol}` : authUser.email}
          </span>
          <form action={cerrarSesion}>
            <button type="submit" className="kicker text-white/50 transition-colors hover:text-white/85">
              Cerrar sesión
            </button>
          </form>
        </div>
      </nav>

      {!usuario && (
        <div className="bg-[var(--color-brand-rosa-claro)] px-6 py-2 text-center text-xs text-[#7a3049]">
          Tu cuenta existe en Supabase Auth pero no tiene fila en <code>usuarios</code> — pide
          a un Administrador que te dé de alta (rol) antes de usar el resto de la app.
        </div>
      )}

      <main className="flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
