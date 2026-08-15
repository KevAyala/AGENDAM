import { Logotype } from "@/components/brand";
import { iniciarSesion } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-[var(--color-brand-blanco-calido)] px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex justify-center">
          <Logotype markSize={44} />
        </div>

        <form action={iniciarSesion} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-[#1a1a1a]">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-azul-funcional)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-[#1a1a1a]">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-azul-funcional)]"
            />
          </div>

          {error && (
            <p className="text-sm text-[#d4183d]">
              No se pudo iniciar sesión. Verifica tu correo y contraseña.
            </p>
          )}

          <button
            type="submit"
            className="mt-2 rounded-md bg-[var(--color-brand-azul-funcional)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Entrar
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-black/40">
          Las cuentas se crean manualmente por el Administrador (Fase 0).
          Contacta a tu consultorio si no tienes acceso.
        </p>
      </div>
    </div>
  );
}
