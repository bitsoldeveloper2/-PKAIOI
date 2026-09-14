import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  size = "md",
  className,
  action,
  as: Tag = "h2",
  invert,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: "left" | "center";
  size?: "sm" | "md" | "lg";
  className?: string;
  action?: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  invert?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "items-center text-center sm:flex-col sm:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? <p className={cn("eyebrow mb-4", invert && "text-white/70")}>{eyebrow}</p> : null}
        <Tag
          className={cn(
            "font-display text-ink",
            size === "sm" && "text-display-sm",
            size === "md" && "text-display-md",
            size === "lg" && "text-display-lg",
            invert && "text-white",
          )}
        >
          {title}
        </Tag>
        {lede ? (
          <p className={cn("mt-4 text-[1.0625rem] leading-relaxed text-ink-muted", invert && "text-white/70")}>{lede}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  lede,
  actions,
  meta,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
        <h1 className="font-display text-display-sm text-ink">{title}</h1>
        {lede ? <p className="mt-2 max-w-2xl text-[0.9375rem] text-ink-muted">{lede}</p> : null}
        {meta ? <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
