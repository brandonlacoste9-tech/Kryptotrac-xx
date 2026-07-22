"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Trash2 } from "lucide-react"
import { usePortfolio } from "@/lib/portfolio"
import type { PriceMap } from "@/lib/types"
import { formatAmount, formatUsd } from "@/lib/utils"
import { ChangeBadge } from "@/components/change-badge"
import { StatCard } from "@/components/stat-card"

export default function PortfolioPage() {
  const { ready, holdings, updateHolding, removeHolding } = usePortfolio()
  const [prices, setPrices] = useState<PriceMap>({})
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const ids = holdings.map((h) => h.id).join(",")

  useEffect(() => {
    if (!ids) {
      setPrices({})
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`/api/prices?ids=${encodeURIComponent(ids)}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to load prices")
        if (!cancelled) setPrices(data as PriceMap)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load prices")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ids])

  const rows = useMemo(() => {
    return holdings.map((h) => {
      const p = prices[h.id]
      const price = p?.usd ?? null
      const change = p?.usd_24h_change ?? null
      const value = price != null ? h.amount * price : null
      const pnl =
        value != null && h.costBasisUsd != null ? value - h.costBasisUsd : null
      const pnlPct =
        pnl != null && h.costBasisUsd && h.costBasisUsd > 0
          ? (pnl / h.costBasisUsd) * 100
          : null
      return { h, price, change, value, pnl, pnlPct }
    })
  }, [holdings, prices])

  const totalValue = rows.reduce((s, r) => s + (r.value ?? 0), 0)
  const totalCost = holdings.reduce((s, h) => s + (h.costBasisUsd ?? 0), 0)
  const hasCost = holdings.some((h) => h.costBasisUsd != null)
  const totalPnl = hasCost ? totalValue - totalCost : null
  const totalPnlPct =
    totalPnl != null && totalCost > 0 ? (totalPnl / totalCost) * 100 : null

  // Weighted 24h portfolio change (approx)
  const weighted24h = useMemo(() => {
    let w = 0
    let sum = 0
    for (const r of rows) {
      if (r.value != null && r.change != null) {
        sum += r.value * r.change
        w += r.value
      }
    }
    return w > 0 ? sum / w : null
  }, [rows])

  if (!ready) {
    return <p className="text-sm text-muted">Loading portfolio…</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Portfolio</h1>
        <p className="mt-1 text-sm text-muted">
          Stored only in this browser · never uploaded
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total value" value={formatUsd(totalValue)} sub={loading ? "Updating…" : undefined} />
        <StatCard
          label="24h (est.)"
          value={weighted24h != null ? `${weighted24h >= 0 ? "+" : ""}${weighted24h.toFixed(2)}%` : "—"}
          sub={<ChangeBadge value={weighted24h} />}
        />
        <StatCard
          label="Unrealized P&L"
          value={totalPnl != null ? formatUsd(totalPnl) : "—"}
          sub={
            totalPnlPct != null ? (
              <ChangeBadge value={totalPnlPct} />
            ) : (
              <span className="text-xs text-muted">Set cost basis for P&L</span>
            )
          }
        />
      </div>

      {error && (
        <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {holdings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
          <p className="font-medium">No holdings yet</p>
          <p className="mt-2 text-sm text-muted max-w-md mx-auto">
            Browse markets and open a coin to add amounts. Your data stays on this device.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
          >
            Explore markets
          </Link>
        </div>
      ) : (
        <div className="table-scroll rounded-xl border border-border bg-card/40">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted border-b border-border">
              <tr>
                <th className="px-3 py-3 font-medium">Asset</th>
                <th className="px-3 py-3 font-medium text-right">Amount</th>
                <th className="px-3 py-3 font-medium text-right">Price</th>
                <th className="px-3 py-3 font-medium text-right">Value</th>
                <th className="px-3 py-3 font-medium text-right">24h</th>
                <th className="px-3 py-3 font-medium text-right">P&L</th>
                <th className="px-3 py-3 font-medium text-right">Alloc</th>
                <th className="px-3 py-3 font-medium w-12" />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ h, price, change, value, pnl, pnlPct }) => {
                const alloc =
                  value != null && totalValue > 0 ? (value / totalValue) * 100 : null
                return (
                  <tr key={h.id} className="border-b border-border/60 hover:bg-white/[0.03]">
                    <td className="px-3 py-3">
                      <Link href={`/coin/${h.id}`} className="font-medium hover:text-accent">
                        {h.name}{" "}
                        <span className="text-xs uppercase text-muted">{h.symbol}</span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        defaultValue={h.amount}
                        key={`${h.id}-${h.amount}`}
                        onBlur={(e) => {
                          const n = parseFloat(e.target.value)
                          if (Number.isFinite(n) && n > 0) updateHolding(h.id, { amount: n })
                        }}
                        className="w-28 rounded-md border border-border bg-background px-2 py-1 text-right font-mono text-sm outline-none focus:ring-2 focus:ring-accent/40"
                      />
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums">
                      {formatUsd(price)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums font-medium">
                      {formatUsd(value)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <ChangeBadge value={change} />
                    </td>
                    <td className="px-3 py-3 text-right">
                      {pnl != null ? (
                        <span className="block font-mono tabular-nums text-sm">
                          {formatUsd(pnl)}
                          <br />
                          <ChangeBadge value={pnlPct} className="text-xs" />
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums text-muted">
                      {alloc != null ? `${alloc.toFixed(1)}%` : "—"}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => removeHolding(h.id)}
                        className="rounded-md p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
                        aria-label={`Remove ${h.symbol}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="px-3 py-2 text-[11px] text-muted border-t border-border">
            Amounts: {holdings.map((h) => `${formatAmount(h.amount)} ${h.symbol.toUpperCase()}`).join(" · ")}
          </p>
        </div>
      )}
    </div>
  )
}
