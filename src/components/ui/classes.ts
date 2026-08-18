// Clases compartidas — lenguaje visual del Documento 05 (Identidad de
// Marca) aplicado a la UI de trabajo: glassmorphism real (blur sobre el
// fondo con textura de .app-shell-bg, no solo un borde), azul funcional
// como único color interactivo, rosa acento reservado para el logo
// (Documento 05 §6: "Logo · énfasis de marca" — no se usa suelto en
// botones ni estados).

export const card =
  "rounded-2xl border border-white/70 bg-white/55 backdrop-blur-xl backdrop-saturate-150 shadow-[var(--shadow-card)]";

export const cardRow =
  "border-b border-white/60 px-6 py-5 transition-colors last:border-b-0 hover:bg-white/55";

export const input =
  "w-full rounded-xl border border-[var(--color-border)] bg-white/75 px-4 py-2.5 text-[15px] text-[var(--color-foreground)] outline-none backdrop-blur-sm transition-colors placeholder:text-[var(--color-foreground-faint)] focus:border-[var(--color-brand-azul-funcional)] focus:ring-2 focus:ring-[var(--color-brand-azul-funcional)]/15";

export const label = "text-xs font-semibold uppercase tracking-wide text-[var(--color-foreground-muted)]";

export const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-brand-azul-funcional)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50";

export const btnSecondary =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-white/65 px-5 py-2.5 text-sm font-semibold text-[var(--color-foreground)] backdrop-blur-md backdrop-saturate-150 transition-colors hover:border-[var(--color-brand-azul-funcional)] hover:text-[var(--color-brand-azul-funcional)]";

export const btnPrimarySm =
  "inline-flex items-center justify-center rounded-lg bg-[var(--color-brand-azul-funcional)] px-3.5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90";

export const btnSecondarySm =
  "inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-white/65 px-3.5 py-2 text-xs font-semibold backdrop-blur-md backdrop-saturate-150 transition-colors hover:border-[var(--color-brand-azul-funcional)] hover:text-[var(--color-brand-azul-funcional)]";

export const linkAction = "text-sm font-medium text-[var(--color-brand-azul-funcional)] hover:underline";
export const linkDanger = "text-sm font-medium text-[var(--color-danger)] hover:underline";
export const linkMuted = "text-sm font-medium text-[var(--color-foreground-faint)] hover:underline";
