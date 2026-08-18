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
      style={{ background: "linear-gradient(130deg, #B2D5E5 0%, #FBEAF0 100%)" }}
    >
      {/* Glows ambientales — degradado de marca (Documento 05 §6) con puntos de luz cálida
          para que el glassmorphism de la tarjeta tenga algo que desenfocar. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-[12%] -top-[18%] h-[55vw] w-[55vw] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(250,249,247,0.65) 0%, transparent 65%)" }}
        />
        <div
          className="absolute -right-[15%] bottom-[-10%] h-[50vw] w-[50vw] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(212,83,126,0.28) 0%, transparent 65%)" }}
        />
        <div
          className="absolute right-[10%] top-[-5%] h-[30vw] w-[30vw] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(11,24,41,0.08) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logotype markSize={48} />
        </div>

        <div
          className="rounded-2xl px-8 py-9 backdrop-blur-2xl backdrop-saturate-150"
          style={{
            background: "rgba(255,255,255,0.55)",
            border: "1px solid rgba(255,255,255,0.8)",
            borderTop: "1px solid rgba(255,255,255,0.95)",
            boxShadow: "0 8px 32px rgba(11,24,41,0.14), inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          <form action={iniciarSesion} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="kicker text-[var(--color-foreground-muted)]">
                Correo
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="rounded-lg border px-3 py-2 text-sm text-[var(--color-foreground)] outline-none transition-colors placeholder:text-[var(--color-foreground-faint)] focus:border-[var(--color-brand-azul-funcional)]"
                style={{ background: "rgba(255,255,255,0.65)", borderColor: "rgba(22,34,46,0.12)" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="kicker text-[var(--color-foreground-muted)]">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="rounded-lg border px-3 py-2 text-sm text-[var(--color-foreground)] outline-none transition-colors placeholder:text-[var(--color-foreground-faint)] focus:border-[var(--color-brand-azul-funcional)]"
                style={{ background: "rgba(255,255,255,0.65)", borderColor: "rgba(22,34,46,0.12)" }}
              />
            </div>

            {error && (
              <p className="text-sm font-medium text-[var(--color-brand-rosa-acento)]">
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

        <p className="mt-6 text-center text-xs text-[#16222E]/45">
          Las cuentas se crean manualmente por el Administrador.
          <br />
          Contacta a tu consultorio si no tienes acceso.
        </p>
      </div>
    </div>
  );
}
