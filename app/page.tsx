"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Star } from "lucide-react"
import type { MarketCoin } from "@/lib/types"
import { formatUsd } from "@/lib/utils"
import { ChangeBadge } from "@/components/change-badge"
import { Sparkline } from "@/components/sparkline"
import { usePortfolio } from "@/lib/portfolio"

export default function MarketsPage() {
  const [coins, setCoins] = useState<MarketCoin[]>([])
  const [q, setQ] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const { toggleWatchlist, isWatched } = usePortfolio()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError("")
      try {
        const res = await fetch("/api/markets?per_page=100&sparkline=true")
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to load markets")
        if (!cancelled) setCoins(data as MarketCoin[])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return coins
    return coins.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.symbol.toLowerCase().includes(s) ||
        c.id.includes(s)
    )
  }, [coins, q])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Markets</h1>
          <p className="mt-1 text-sm text-muted">
            Top coins by market cap · live via CoinGecko
          </p>
        </div>
        <label className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or symbol…"
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-accent/40"
          />
        </label>
      </div>

      {error && (
        <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
          <p className="mt-1 text-xs opacity-80">
            Free API rate limits may apply. Wait a minute and refresh.
          </p>
        </div>
      )}

      {loading ? (
        <div className="grid gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-card/60 border border-border" />
          ))}
        </div>
      ) : (
        <div className="table-scroll rounded-xl border border-border bg-card/40">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted border-b border-border">
              <tr>
                <th className="px-3 py-3 font-medium w-10">#</th>
                <th className="px-3 py-3 font-medium">Asset</th>
                <th className="px-3 py-3 font-medium text-right">Price</th>
                <th className="px-3 py-3 font-medium text-right">24h</th>
                <th className="px-3 py-3 font-medium text-right hidden md:table-cell">Market cap</th>
                <th className="px-3 py-3 font-medium text-right hidden lg:table-cell">Volume</th>
                <th className="px-3 py-3 font-medium text-right hidden sm:table-cell">7d</th>
                <th className="px-3 py-3 font-medium w-12" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const ch = c.price_change_percentage_24h
                const watched = isWatched(c.id)
                return (
                  <tr
                    key={c.id}
                    className="border-b border-border/60 hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-3 py-3 text-muted tabular-nums">
                      {c.market_cap_rank ?? "—"}
                    </td>
                    <td className="px-3 py-3">
                      <Link href={`/coin/${c.id}`} className="flex items-center gap-3 group">
                        <Image
                          src={c.image}
                          alt=""
                          width={28}
                          height={28}
                          className="rounded-full"
                          unoptimized
                        />
                        <span>
                          <span className="font-medium group-hover:text-accent transition-colors">
                            {c.name}
                          </span>
                          <span className="ml-2 text-xs uppercase text-muted">{c.symbol}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums">
                      {formatUsd(c.current_price)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <ChangeBadge value={ch} />
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums text-muted hidden md:table-cell">
                      {formatUsd(c.market_cap, true)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums text-muted hidden lg:table-cell">
                      {formatUsd(c.total_volume, true)}
                    </td>
                    <td className="px-3 py-3 text-right hidden sm:table-cell">
                      <div className="inline-flex justify-end">
                        <Sparkline
                          prices={c.sparkline_in_7d?.price ?? []}
                          positive={ch == null ? undefined : ch >= 0}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleWatchlist(c.id)}
                        className="rounded-md p-1.5 text-muted hover:bg-white/5 hover:text-warning"
                        aria-label={watched ? "Remove from watchlist" : "Add to watchlist"}
                      >
                        <Star
                          className="h-4 w-4"
                          fill={watched ? "currentColor" : "none"}
                          style={watched ? { color: "var(--warning)" } : undefined}
                        />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="p-8 text-center text-sm text-muted">No coins match your search.</p>
          )}
        </div>
      )}
    </div>
  )
}
