import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { SmallLogotype } from "@/components/brand";
import { cerrarSesion } from "./login/actions";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: user.id } });

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <nav className="flex items-center justify-between border-b border-[var(--color-border)] bg-[#0B1829] px-6 py-4">
        <SmallLogotype />
        <form action={cerrarSesion}>
          <button
            type="submit"
            className="text-[10px] uppercase tracking-[0.18em] text-white/50 hover:text-white/80"
          >
            Cerrar sesión
          </button>
        </form>
      </nav>

      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-2xl font-semibold text-[var(--color-brand-azul-funcional)]">
          Fase 0 lista
        </h1>
        <p className="max-w-md text-sm text-black/50">
          Sesión iniciada como <strong>{user.email}</strong>
          {usuario ? (
            <>
              {" "}· rol <strong>{usuario.rol}</strong>
            </>
          ) : (
            <>
              . Este usuario existe en Supabase Auth pero todavía no tiene fila
              en la tabla <code>usuarios</code> — falta el alta manual del
              Administrador (nombre + rol) antes de continuar con la Fase 1.
            </>
          )}
        </p>
      </main>
    </div>
  );
}
