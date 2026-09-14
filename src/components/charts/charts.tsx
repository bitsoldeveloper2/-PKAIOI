"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Small SVG chart set following the institute's dataviz rules: one axis, thin
 * marks with rounded data-ends, recessive grid, categorical series in fixed
 * order (tokens --chart-1…5), legend for ≥ 2 series, hover tooltips, and a
 * table view for every chart.
 */

export const SERIES = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"] as const;

type Series = { name: string; values: number[] };

function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * p;
}

function Legend({ series }: { series: Series[] }) {
  if (series.length < 2) return null;
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[0.75rem] text-ink-muted" aria-label="Legend">
      {series.map((s, i) => (
        <li key={s.name} className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: SERIES[i % SERIES.length] }} aria-hidden />
          {s.name}
        </li>
      ))}
    </ul>
  );
}

function DataTable({ labels, series, caption }: { labels: string[]; series: Series[]; caption: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[0.8125rem]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line text-left text-[0.6875rem] uppercase tracking-wider text-ink-muted">
            <th className="py-1.5 pr-3">Label</th>
            {series.map((s) => (
              <th key={s.name} className="py-1.5 pr-3 text-right">{s.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((l, i) => (
            <tr key={l} className="border-b border-line last:border-b-0">
              <td className="py-1.5 pr-3 text-ink">{l}</td>
              {series.map((s) => (
                <td key={s.name} className="py-1.5 pr-3 text-right tabular text-ink">{s.values[i] ?? 0}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ChartFrame({ title, description, labels, series, children, className }: { title: string; description?: string; labels: string[]; series: Series[]; children: React.ReactNode; className?: string }) {
  const [table, setTable] = useState(false);
  return (
    <figure className={cn("rounded-xl border border-line bg-surface p-5", className)}>
      <figcaption className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[0.9375rem] font-semibold text-ink">{title}</p>
          {description ? <p className="text-[0.8125rem] text-ink-muted">{description}</p> : null}
        </div>
        <div className="flex items-center gap-3">
          <Legend series={series} />
          <button type="button" onClick={() => setTable((t) => !t)} className="rounded-md border border-line px-2 py-1 text-[0.6875rem] font-medium text-ink-muted hover:text-ink" aria-pressed={table}>
            {table ? "Chart" : "Table"}
          </button>
        </div>
      </figcaption>
      <div className="mt-4">{table ? <DataTable labels={labels} series={series} caption={title} /> : children}</div>
    </figure>
  );
}

/** Grouped vertical bars. Thin marks, rounded tops anchored at the baseline, 2px gaps. */
export function BarChart({ labels, series, height = 180, unit = "" }: { labels: string[]; series: Series[]; height?: number; unit?: string }) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const width = 640;
  const pad = { l: 36, r: 8, t: 12, b: 26 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const max = niceMax(Math.max(1, ...series.flatMap((s) => s.values)));
  const groupW = innerW / Math.max(1, labels.length);
  const barW = Math.max(3, Math.min(18, (groupW - 8) / series.length - 2));
  const ticks = [0, 0.5, 1].map((f) => f * max);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-labelledby={`${id}-t`}>
        {/* React renders an SVG <title> only when its child is a single string, so build the label first. */}
        <title id={`${id}-t`}>{`${series.map((s) => s.name).join(", ")} by ${labels[0] ? "period" : "category"}`}</title>
        {ticks.map((t) => {
          const y = pad.t + innerH - (t / max) * innerH;
          return (
            <g key={t}>
              <line x1={pad.l} x2={width - pad.r} y1={y} y2={y} stroke="var(--chart-grid)" strokeWidth="1" />
              <text x={pad.l - 6} y={y + 3} textAnchor="end" fontSize="10" fill="var(--ink-subtle)">{t}{unit}</text>
            </g>
          );
        })}
        {labels.map((label, li) => {
          const gx = pad.l + li * groupW;
          const total = series.length * (barW + 2) - 2;
          const start = gx + (groupW - total) / 2;
          return (
            <g key={label} onMouseEnter={() => setHover(li)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(li)} onBlur={() => setHover(null)} tabIndex={0} aria-label={`${label}: ${series.map((s) => `${s.name} ${s.values[li] ?? 0}${unit}`).join(", ")}`}>
              <rect x={gx} y={pad.t} width={groupW} height={innerH} fill={hover === li ? "var(--chart-grid)" : "transparent"} />
              {series.map((s, si) => {
                const v = s.values[li] ?? 0;
                const h = (v / max) * innerH;
                const x = start + si * (barW + 2);
                const y = pad.t + innerH - h;
                return <rect key={s.name} x={x} y={y} width={barW} height={h} rx={Math.min(4, barW / 2)} fill={SERIES[si % SERIES.length]} />;
              })}
              {labels.length <= 14 || li % 2 === 0 ? (
                <text x={gx + groupW / 2} y={height - 8} textAnchor="middle" fontSize="10" fill="var(--ink-subtle)">{label}</text>
              ) : null}
            </g>
          );
        })}
      </svg>
      {hover !== null ? (
        <div role="status" className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-md border border-line bg-surface px-3 py-2 text-[0.75rem] shadow-pop">
          <p className="font-medium text-ink">{labels[hover]}</p>
          {series.map((s, si) => (
            <p key={s.name} className="flex items-center gap-1.5 text-ink-muted"><span className="size-2 rounded-sm" style={{ background: SERIES[si % SERIES.length] }} aria-hidden />{s.name}: <span className="tabular text-ink">{s.values[hover] ?? 0}{unit}</span></p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Horizontal bars for ranked categories (funnels, distributions). Single series. */
export function HBars({ labels, values, max: maxIn, unit = "", tone = 0 }: { labels: string[]; values: number[]; max?: number; unit?: string; tone?: number }) {
  const max = maxIn ?? niceMax(Math.max(1, ...values));
  return (
    <ol className="space-y-2">
      {labels.map((label, i) => {
        const v = values[i] ?? 0;
        return (
          <li key={label} className="grid grid-cols-[minmax(0,10rem)_1fr_3rem] items-center gap-3 text-[0.8125rem]">
            <span className="truncate text-ink-muted" title={label}>{label}</span>
            <span className="h-2 overflow-hidden rounded-full bg-surface-3" role="img" aria-label={`${label}: ${v}${unit}`}>
              <span className="block h-full rounded-full" style={{ width: `${Math.min(100, (v / max) * 100)}%`, background: SERIES[tone % SERIES.length] }} />
            </span>
            <span className="text-right tabular text-ink">{v}{unit}</span>
          </li>
        );
      })}
    </ol>
  );
}
