"use client"

import { useEffect, useMemo, useState } from "react"
import type { ChartPoint, QuoteCurrency } from "@/lib/types"
import { cn, formatMoney } from "@/lib/utils"

const RANGES = [
  { days: "1", label: "24H" },
  { days: "7", label: "7D" },
  { days: "30", label: "30D" },
  { days: "90", label: "90D" },
  { days: "365", label: "1Y" },
  { days: "max", label: "MAX" },
] as const

export function PriceChart({
  coinId,
  currency,
  className,
}: {
  coinId: string
  currency: QuoteCurrency
  className?: string
}) {
  const [days, setDays] = useState<string>("7")
  const [prices, setPrices] = useState<ChartPoint[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(
          `/api/coin/${encodeURIComponent(coinId)}/chart?days=${days}&vs=${currency}`
        )
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Chart failed")
        if (!cancelled) setPrices((data.prices as ChartPoint[]) || [])
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Chart failed")
          setPrices([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [coinId, days, currency])

  const path = useMemo(() => {
    if (prices.length < 2) return null
    const vals = prices.map((p) => p[1])
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    const range = max - min || 1
    const w = 640
    const h = 220
    const pad = 8
    const pts = prices.map((p, i) => {
      const x = pad + (i / (prices.length - 1)) * (w - pad * 2)
      const y = pad + (1 - (p[1] - min) / range) * (h - pad * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    const line = pts.join(" ")
    const area = `${pad},${h - pad} ${line} ${w - pad},${h - pad}`
    const first = vals[0]
    const last = vals[vals.length - 1]
    const up = last >= first
    return { line, area, w, h, min, max, up, first, last }
  }, [prices])

  const changePct =
    path && path.first
      ? ((path.last - path.first) / path.first) * 100
      : null

  return (
    <div className={cn("rounded-xl border border-border bg-card/50 p-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted font-medium">
            Price chart
          </p>
          {changePct != null && (
            <p
              className={cn(
                "text-sm font-mono tabular-nums",
                changePct >= 0 ? "text-success" : "text-danger"
              )}
            >
              {changePct >= 0 ? "+" : ""}
              {changePct.toFixed(2)}% over range
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              onClick={() => setDays(r.days)}
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-semibold transition-colors",
                days === r.days
                  ? "bg-accent/20 text-accent"
                  : "text-muted hover:bg-white/5 hover:text-foreground"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="h-[220px] animate-pulse rounded-lg bg-background/60" />
      )}
      {error && !loading && (
        <p className="text-sm text-danger py-8 text-center">{error}</p>
      )}
      {!loading && !error && path && (
        <div>
          <svg
            viewBox={`0 0 ${path.w} ${path.h}`}
            className="w-full h-[220px]"
            preserveAspectRatio="none"
            role="img"
            aria-label="Price chart"
          >
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={path.up ? "#34d399" : "#f87171"}
                  stopOpacity="0.35"
                />
                <stop
                  offset="100%"
                  stopColor={path.up ? "#34d399" : "#f87171"}
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
            <polygon fill="url(#chartFill)" points={path.area} />
            <polyline
              fill="none"
              stroke={path.up ? "#34d399" : "#f87171"}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={path.line}
            />
          </svg>
          <div className="flex justify-between text-[11px] text-muted font-mono mt-1">
            <span>{formatMoney(path.min, currency)}</span>
            <span>{formatMoney(path.max, currency)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
