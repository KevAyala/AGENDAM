import Link from "next/link";
import { obtenerUsuarioActual } from "@/lib/current-user";
import { SmallLogotype } from "@/components/brand";
import { cerrarSesion } from "../login/actions";

const ENLACES = [
  { href: "/", label: "Inicio" },
  { href: "/pacientes", label: "Pacientes" },
  { href: "/agenda", label: "Agenda" },
  { href: "/configuracion/horarios", label: "Horarios" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { authUser, usuario } = await obtenerUsuarioActual();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[#0B1829] px-6 py-4">
        <div className="flex items-center gap-8">
          <SmallLogotype />
          <div className="flex items-center gap-5">
            {ENLACES.map((enlace) => (
              <Link
                key={enlace.href}
                href={enlace.href}
                className="text-xs font-medium text-white/60 hover:text-white"
              >
                {enlace.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] uppercase tracking-[0.14em] text-white/35">
            {usuario ? `${usuario.nombre} · ${usuario.rol}` : authUser.email}
          </span>
          <form action={cerrarSesion}>
            <button
              type="submit"
              className="text-[10px] uppercase tracking-[0.18em] text-white/50 hover:text-white/80"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </nav>

      {!usuario && (
        <div className="bg-[#FBEAF0] px-6 py-2 text-center text-xs text-[#7a3049]">
          Tu cuenta existe en Supabase Auth pero no tiene fila en <code>usuarios</code> — pide
          a un Administrador que te dé de alta (rol) antes de usar el resto de la app.
        </div>
      )}

      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
