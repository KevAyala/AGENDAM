import { Logotype } from "@/components/brand";
import { iniciarSesion } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div
      className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden px-6 py-16"
      style={{ background: "var(--color-brand-azul-oscuro)" }}
    >
      {/* Glows ambientales — mismo tratamiento que la página de identidad (Documento 05). */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-[10%] -top-[15%] h-[50vw] w-[50vw] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(178,213,229,0.16) 0%, transparent 65%)" }}
        />
        <div
          className="absolute -right-[10%] bottom-[5%] h-[40vw] w-[40vw] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(212,83,126,0.12) 0%, transparent 65%)" }}
        />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logotype markSize={48} textColor="#FAF9F7" />
        </div>

        <div
          className="rounded-2xl px-8 py-9"
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderTop: "1px solid rgba(255,255,255,0.22)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          <form action={iniciarSesion} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="kicker text-white/45">
                Correo
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="rounded-lg border px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[var(--color-brand-azul-principal)]"
                style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.14)" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="kicker text-white/45">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="rounded-lg border px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[var(--color-brand-azul-principal)]"
                style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.14)" }}
              />
            </div>

            {error && (
              <p className="text-sm text-[#f0a8bc]">
                No se pudo iniciar sesión. Verifica tu correo y contraseña.
              </p>
            )}

            <button
              type="submit"
              className="mt-2 rounded-lg bg-[var(--color-brand-azul-funcional)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Entrar
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/25">
          Las cuentas se crean manualmente por el Administrador.
          <br />
          Contacta a tu consultorio si no tienes acceso.
        </p>
      </div>
    </div>
  );
}
