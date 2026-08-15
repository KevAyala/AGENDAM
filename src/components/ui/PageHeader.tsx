import { Kicker } from "./Kicker";

export function PageHeader({
  kicker,
  title,
  subtitle,
  action,
}: {
  kicker?: string;
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        {kicker && <Kicker className="mb-1.5 block">{kicker}</Kicker>}
        <h1 className="text-xl font-bold text-[var(--color-foreground)]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
