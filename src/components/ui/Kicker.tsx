export function Kicker({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={`kicker text-[var(--color-foreground-faint)] ${className}`}>{children}</span>;
}
