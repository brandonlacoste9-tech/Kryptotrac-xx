"use client"

import { cn } from "@/lib/utils"

const COLORS = [
  "#22d3a6",
  "#60a5fa",
  "#fbbf24",
  "#f472b6",
  "#a78bfa",
  "#34d399",
  "#fb923c",
  "#38bdf8",
  "#e879f9",
  "#94a3b8",
]

export type AllocSlice = {
  id: string
  label: string
  value: number
  pct: number
}

export function AllocationChart({
  slices,
  className,
}: {
  slices: AllocSlice[]
  className?: string
}) {
  const sorted = [...slices].filter((s) => s.value > 0).sort((a, b) => b.value - a.value)
  if (sorted.length === 0) return null

  let acc = 0
  const gradientStops = sorted.map((s, i) => {
    const start = acc
    acc += s.pct
    const color = COLORS[i % COLORS.length]
    return `${color} ${start}% ${acc}%`
  })
  const conic = `conic-gradient(${gradientStops.join(", ")})`

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card/50 p-4 flex flex-col sm:flex-row gap-6 items-center",
        className
      )}
    >
      <div
        className="h-36 w-36 shrink-0 rounded-full ring-4 ring-border/40"
        style={{ background: conic }}
        role="img"
        aria-label="Portfolio allocation chart"
      >
        <div className="h-full w-full flex items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-[var(--bg)] border border-border" />
        </div>
      </div>
      <ul className="flex-1 w-full space-y-2 max-h-48 overflow-y-auto">
        {sorted.map((s, i) => (
          <li key={s.id} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-sm shrink-0"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="flex-1 truncate text-muted">
              <span className="text-foreground font-medium">{s.label}</span>
            </span>
            <span className="font-mono tabular-nums text-xs">{s.pct.toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
