// Clases compartidas — lenguaje visual del Documento 05 (Identidad de
// Marca) aplicado a la UI de trabajo: tarjetas con sombra suave en vez de
// tablas planas, azul funcional como único color interactivo, rosa acento
// reservado para el logo (Documento 05 §6: "Logo · énfasis de marca" — no
// se usa suelto en botones ni estados).

export const card =
  "rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]";

export const cardRow =
  "border-b border-[var(--color-border-soft)] px-5 py-4 transition-colors last:border-b-0 hover:bg-[var(--color-brand-azul-principal)]/[0.05]";

export const input =
  "w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-foreground)] outline-none transition-colors placeholder:text-[var(--color-foreground-faint)] focus:border-[var(--color-brand-azul-funcional)] focus:ring-2 focus:ring-[var(--color-brand-azul-funcional)]/15";

export const label = "text-xs font-semibold uppercase tracking-wide text-[var(--color-foreground-muted)]";

export const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--color-brand-azul-funcional)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50";

export const btnSecondary =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-foreground)] transition-colors hover:border-[var(--color-brand-azul-funcional)] hover:text-[var(--color-brand-azul-funcional)]";

export const btnPrimarySm =
  "inline-flex items-center justify-center rounded-md bg-[var(--color-brand-azul-funcional)] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90";

export const btnSecondarySm =
  "inline-flex items-center justify-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium transition-colors hover:border-[var(--color-brand-azul-funcional)] hover:text-[var(--color-brand-azul-funcional)]";

export const linkAction = "text-xs font-medium text-[var(--color-brand-azul-funcional)] hover:underline";
export const linkDanger = "text-xs font-medium text-[var(--color-danger)] hover:underline";
export const linkMuted = "text-xs font-medium text-[var(--color-foreground-faint)] hover:underline";
