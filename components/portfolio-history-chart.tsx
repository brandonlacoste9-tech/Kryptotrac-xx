"use client"

import { useMemo } from "react"
import type { HistoryPoint } from "@/lib/portfolio-history"
import type { QuoteCurrency } from "@/lib/types"
import { cn, formatMoney } from "@/lib/utils"

export function PortfolioHistoryChart({
  points,
  currency,
  usdToCad,
  className,
}: {
  points: HistoryPoint[]
  currency: QuoteCurrency
  usdToCad: number
  className?: string
}) {
  const path = useMemo(() => {
    if (points.length < 2) return null
    const vals = points.map((p) =>
      currency === "cad" ? p.v * usdToCad : p.v
    )
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    const range = max - min || 1
    const w = 640
    const h = 120
    const pad = 6
    const line = points
      .map((_, i) => {
        const x = pad + (i / (points.length - 1)) * (w - pad * 2)
        const y = pad + (1 - (vals[i] - min) / range) * (h - pad * 2)
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(" ")
    const first = vals[0]
    const last = vals[vals.length - 1]
    const up = last >= first
    const changePct = first > 0 ? ((last - first) / first) * 100 : 0
    return { line, w, h, min, max, up, changePct, first, last }
  }, [points, currency, usdToCad])

  if (!path) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-border bg-card/30 px-4 py-6 text-center text-xs text-muted",
          className
        )}
      >
        Portfolio history builds as you keep the app open with holdings. Check
        back after a few price refreshes.
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card/50 p-4",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] uppercase tracking-wider text-muted font-medium">
          Portfolio value (local history)
        </p>
        <p
          className={cn(
            "text-xs font-mono tabular-nums",
            path.up ? "text-success" : "text-danger"
          )}
        >
          {path.changePct >= 0 ? "+" : ""}
          {path.changePct.toFixed(2)}% sampled
        </p>
      </div>
      <svg
        viewBox={`0 0 ${path.w} ${path.h}`}
        className="w-full h-[120px]"
        preserveAspectRatio="none"
        aria-label="Portfolio history"
      >
        <polyline
          fill="none"
          stroke={path.up ? "var(--success)" : "var(--danger)"}
          strokeWidth="2"
          strokeLinejoin="round"
          points={path.line}
        />
      </svg>
      <div className="flex justify-between text-[10px] text-muted font-mono mt-1">
        <span>{formatMoney(path.min, currency)}</span>
        <span>{formatMoney(path.last, currency)}</span>
        <span>{formatMoney(path.max, currency)}</span>
      </div>
    </div>
  )
}
