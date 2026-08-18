const TONOS = {
  neutral: "bg-black/[0.04] text-[var(--color-foreground-muted)]",
  info: "bg-[var(--color-brand-azul-principal)]/25 text-[var(--color-brand-azul-funcional)]",
  success: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  warning: "bg-[var(--color-brand-rosa-claro)] text-[var(--color-brand-rosa-acento)]",
  danger: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
  strike: "bg-black/[0.03] text-[var(--color-foreground-faint)] line-through",
} as const;

export type Tono = keyof typeof TONOS;

export function Badge({ tone = "neutral", children }: { tone?: Tono; children: React.ReactNode }) {
  return (
    <span
      className={`kicker inline-flex items-center rounded-full px-3 py-1 font-semibold ${TONOS[tone]}`}
    >
      {children}
    </span>
  );
}
