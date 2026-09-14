import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  as: Tag = "div",
  padded = true,
  interactive,
}: {
  className?: string;
  children: React.ReactNode;
  as?: "div" | "section" | "article" | "li";
  padded?: boolean;
  interactive?: boolean;
}) {
  return (
    <Tag
      className={cn(
        "surface-card",
        padded && "p-5 sm:p-6",
        interactive &&
          "transition-[transform,box-shadow,border-color] duration-300 ease-out-quart hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h3 className="text-[0.9375rem] font-semibold leading-6 text-ink">{title}</h3>
        {description ? <p className="mt-0.5 text-sm text-ink-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Stat({
  label,
  value,
  delta,
  hint,
  className,
}: {
  label: string;
  value: React.ReactNode;
  delta?: { value: string; tone: "up" | "down" | "flat" };
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("surface-card p-5", className)}>
      <p className="eyebrow">{label}</p>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="font-display text-3xl tabular text-ink">{value}</p>
        {delta ? (
          <span
            className={cn(
              "text-xs font-semibold tabular",
              delta.tone === "up" && "text-success",
              delta.tone === "down" && "text-danger",
              delta.tone === "flat" && "text-ink-subtle",
            )}
          >
            {delta.value}
          </span>
        ) : null}
      </div>
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}
