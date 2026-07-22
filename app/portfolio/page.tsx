"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Trash2 } from "lucide-react"
import { usePortfolio } from "@/lib/portfolio"
import { useCurrency } from "@/lib/currency"
import type { PriceMap } from "@/lib/types"
import {
  changeFromMap,
  formatAmount,
  formatMoney,
  fromUsd,
  priceFromMap,
  toUsd,
} from "@/lib/utils"
import { ChangeBadge } from "@/components/change-badge"
import { StatCard } from "@/components/stat-card"
import { AllocationChart } from "@/components/allocation-chart"
import { PortfolioBackup } from "@/components/portfolio-backup"
import { ErrorBanner } from "@/components/error-banner"
import { PortfolioHistoryChart } from "@/components/portfolio-history-chart"
import {
  loadHistory,
  recordHistoryValue,
  type HistoryPoint,
} from "@/lib/portfolio-history"

const REFRESH_MS = 75_000

export default function PortfolioPage() {
  const { ready, holdings, updateHolding, removeHolding, addHolding } =
    usePortfolio()
  const { currency, usdToCad } = useCurrency()
  const [prices, setPrices] = useState<PriceMap>({})
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [history, setHistory] = useState<HistoryPoint[]>([])

  const ids = holdings.map((h) => h.id).join(",")

  const load = useCallback(async () => {
    if (!ids) {
      setPrices({})
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/prices?ids=${encodeURIComponent(ids)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load prices")
      setPrices(data as PriceMap)
      setUpdatedAt(new Date())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load prices")
    } finally {
      setLoading(false)
    }
  }, [ids])

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  useEffect(() => {
    load()
    if (!ids) return
    const t = setInterval(load, REFRESH_MS)
    return () => clearInterval(t)
  }, [load, ids])

  const rows = useMemo(() => {
    return holdings.map((h) => {
      const p = prices[h.id]
      const price = priceFromMap(p, currency)
      const change = changeFromMap(p, currency)
      const value = price != null ? h.amount * price : null
      const costDisplay = fromUsd(h.costBasisUsd, currency, usdToCad)
      const pnl =
        value != null && costDisplay != null ? value - costDisplay : null
      const pnlPct =
        pnl != null && costDisplay && costDisplay > 0
          ? (pnl / costDisplay) * 100
          : null
      return { h, price, change, value, costDisplay, pnl, pnlPct }
    })
  }, [holdings, prices, currency, usdToCad])

  const totalValue = rows.reduce((s, r) => s + (r.value ?? 0), 0)

  // Record USD total for local history (currency-independent)
  useEffect(() => {
    if (!ready || holdings.length === 0) return
    let totalUsd = 0
    let ok = true
    for (const h of holdings) {
      const p = prices[h.id]?.usd
      if (p == null) {
        ok = false
        break
      }
      totalUsd += h.amount * p
    }
    if (ok && totalUsd > 0) {
      setHistory(recordHistoryValue(totalUsd))
    }
  }, [prices, holdings, ready])

  const totalCostUsd = holdings.reduce((s, h) => s + (h.costBasisUsd ?? 0), 0)
  const totalCost = fromUsd(
    totalCostUsd > 0 ? totalCostUsd : null,
    currency,
    usdToCad
  )
  const hasCost = holdings.some((h) => h.costBasisUsd != null)
  const totalPnl =
    hasCost && totalCost != null ? totalValue - totalCost : null
  const totalPnlPct =
    totalPnl != null && totalCost && totalCost > 0
      ? (totalPnl / totalCost) * 100
      : null

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

  const slices = useMemo(
    () =>
      rows
        .filter((r) => r.value != null && r.value > 0)
        .map((r) => ({
          id: r.h.id,
          label: r.h.symbol.toUpperCase(),
          value: r.value!,
          pct: totalValue > 0 ? (r.value! / totalValue) * 100 : 0,
        })),
    [rows, totalValue]
  )

  if (!ready) {
    return <p className="text-sm text-muted">Loading portfolio…</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Portfolio
          </h1>
          <p className="mt-1 text-sm text-muted">
            Stored only in this browser · never uploaded
            {updatedAt && (
              <span className="ml-2 text-xs">
                · prices {updatedAt.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <PortfolioBackup />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label={`Total value (${currency.toUpperCase()})`}
          value={formatMoney(totalValue, currency)}
          sub={loading ? "Updating…" : undefined}
        />
        <StatCard
          label="24h (est.)"
          value={
            weighted24h != null
              ? `${weighted24h >= 0 ? "+" : ""}${weighted24h.toFixed(2)}%`
              : "—"
          }
          sub={<ChangeBadge value={weighted24h} />}
        />
        <StatCard
          label="Unrealized P&L"
          value={totalPnl != null ? formatMoney(totalPnl, currency) : "—"}
          sub={
            totalPnlPct != null ? (
              <ChangeBadge value={totalPnlPct} />
            ) : (
              <span className="text-xs text-muted">
                Edit cost basis in the table
              </span>
            )
          }
        />
      </div>

      {slices.length > 0 && <AllocationChart slices={slices} />}
      <PortfolioHistoryChart
        points={history}
        currency={currency}
        usdToCad={usdToCad}
      />

      {error && (
        <ErrorBanner
          message={error}
          onRetry={() => load()}
          hint="Rate limits may apply — wait and retry."
        />
      )}

      {holdings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
          <p className="font-medium">No holdings yet</p>
          <p className="mt-2 text-sm text-muted max-w-md mx-auto">
            Add coins from markets, or start with a small sample position.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href="/"
              className="inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
            >
              Explore markets
            </Link>
            <button
              type="button"
              onClick={() =>
                addHolding({
                  id: "bitcoin",
                  symbol: "btc",
                  name: "Bitcoin",
                  amount: 0.01,
                })
              }
              className="inline-flex rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-accent/40"
            >
              Add 0.01 BTC
            </button>
            <button
              type="button"
              onClick={() =>
                addHolding({
                  id: "ethereum",
                  symbol: "eth",
                  name: "Ethereum",
                  amount: 0.1,
                })
              }
              className="inline-flex rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-accent/40"
            >
              Add 0.1 ETH
            </button>
          </div>
        </div>
      ) : (
        <div className="table-scroll rounded-xl border border-border bg-card/40">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted border-b border-border">
              <tr>
                <th className="px-3 py-3 font-medium">Asset</th>
                <th className="px-3 py-3 font-medium text-right">Amount</th>
                <th className="px-3 py-3 font-medium text-right">
                  Cost basis ({currency.toUpperCase()})
                </th>
                <th className="px-3 py-3 font-medium text-right">Price</th>
                <th className="px-3 py-3 font-medium text-right">Value</th>
                <th className="px-3 py-3 font-medium text-right">24h</th>
                <th className="px-3 py-3 font-medium text-right">P&L</th>
                <th className="px-3 py-3 font-medium text-right">Alloc</th>
                <th className="px-3 py-3 font-medium w-12" />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ h, price, change, value, costDisplay, pnl, pnlPct }) => {
                const alloc =
                  value != null && totalValue > 0
                    ? (value / totalValue) * 100
                    : null
                return (
                  <tr
                    key={h.id}
                    className="border-b border-border/60 hover:bg-white/[0.03]"
                  >
                    <td className="px-3 py-3">
                      <Link
                        href={`/coin/${h.id}`}
                        className="font-medium hover:text-accent"
                      >
                        {h.name}{" "}
                        <span className="text-xs uppercase text-muted">
                          {h.symbol}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        defaultValue={h.amount}
                        key={`${h.id}-amt-${h.amount}`}
                        onBlur={(e) => {
                          const n = parseFloat(e.target.value)
                          if (Number.isFinite(n) && n > 0)
                            updateHolding(h.id, { amount: n })
                        }}
                        className="w-28 rounded-md border border-border bg-background px-2 py-1 text-right font-mono text-sm outline-none focus:ring-2 focus:ring-accent/40"
                      />
                    </td>
                    <td className="px-3 py-3 text-right">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="Total paid"
                        defaultValue={
                          costDisplay != null
                            ? Number(costDisplay.toFixed(2))
                            : ""
                        }
                        key={`${h.id}-cost-${h.costBasisUsd}-${currency}`}
                        onBlur={(e) => {
                          const raw = e.target.value.trim()
                          if (raw === "") {
                            updateHolding(h.id, { costBasisUsd: undefined })
                            return
                          }
                          const n = parseFloat(raw)
                          if (!Number.isFinite(n) || n < 0) return
                          updateHolding(h.id, {
                            costBasisUsd: toUsd(n, currency, usdToCad),
                          })
                        }}
                        className="w-28 rounded-md border border-border bg-background px-2 py-1 text-right font-mono text-sm outline-none focus:ring-2 focus:ring-accent/40"
                      />
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums">
                      {formatMoney(price, currency)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums font-medium">
                      {formatMoney(value, currency)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <ChangeBadge value={change} />
                    </td>
                    <td className="px-3 py-3 text-right">
                      {pnl != null ? (
                        <span className="block font-mono tabular-nums text-sm">
                          {formatMoney(pnl, currency)}
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
            Cost basis is converted to USD for storage. Display follows your USD/CAD
            toggle. Amounts:{" "}
            {holdings
              .map((h) => `${formatAmount(h.amount)} ${h.symbol.toUpperCase()}`)
              .join(" · ")}
          </p>
        </div>
      )}
    </div>
  )
}
