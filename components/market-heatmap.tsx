"use client"

import Link from "next/link"
import type { MarketCoin, QuoteCurrency } from "@/lib/types"
import { cn, formatPct } from "@/lib/utils"

export function MarketHeatmap({
  coins,
  currency: _currency,
}: {
  coins: MarketCoin[]
  currency: QuoteCurrency
}) {
  const top = coins.slice(0, 48)
  if (top.length < 8) return null

  return (
    <div className="rounded-xl border border-border bg-card/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wider text-muted font-semibold">
          24h heatmap
        </p>
        <p className="text-[10px] text-muted">Top {top.length} by mcap</p>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
        {top.map((c) => {
          const ch = c.price_change_percentage_24h
          const intensity =
            ch == null ? 0 : Math.min(Math.abs(ch) / 12, 1)
          const pos = (ch ?? 0) >= 0
          return (
            <Link
              key={c.id}
              href={`/coin/${c.id}`}
              className={cn(
                "rounded-md border border-border/60 px-1.5 py-2 text-center transition-transform hover:scale-[1.03]",
                ch == null
                  ? "bg-card"
                  : pos
                    ? "heat-pos"
                    : "heat-neg"
              )}
              style={
                ch != null
                  ? {
                      opacity: 0.55 + intensity * 0.45,
                    }
                  : undefined
              }
              title={`${c.name}: ${formatPct(ch)}`}
            >
              <div className="text-[10px] font-bold uppercase truncate">
                {c.symbol}
              </div>
              <div
                className={cn(
                  "text-[10px] font-mono tabular-nums",
                  ch == null
                    ? "text-muted"
                    : pos
                      ? "text-success"
                      : "text-danger"
                )}
              >
                {formatPct(ch)}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
