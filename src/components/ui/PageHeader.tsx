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
    <div className="flex flex-wrap items-start justify-between gap-5">
      <div>
        {kicker && <Kicker className="mb-2 block">{kicker}</Kicker>}
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-foreground)]">{title}</h1>
        {subtitle && <p className="mt-2 max-w-xl text-[15px] text-[var(--color-foreground-muted)]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
