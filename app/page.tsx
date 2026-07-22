"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowDownUp, RefreshCw, Star } from "lucide-react"
import type { MarketCoin } from "@/lib/types"
import { cn, formatMoney } from "@/lib/utils"
import { ChangeBadge } from "@/components/change-badge"
import { Sparkline } from "@/components/sparkline"
import { usePortfolio } from "@/lib/portfolio"
import { useCurrency } from "@/lib/currency"
import { GlobalStats } from "@/components/global-stats"
import { MarketMovers } from "@/components/market-movers"
import { TrendingStrip } from "@/components/trending-strip"
import { CoinSearch } from "@/components/coin-search"
import { ErrorBanner } from "@/components/error-banner"
import { CategoryFilter } from "@/components/category-filter"
import { AdBanner } from "@/components/ad-unit"
import { MarketHeatmap } from "@/components/market-heatmap"
import {
  loadCompareIds,
  toggleCompareId,
} from "@/lib/compare-selection"
import { GitCompare } from "lucide-react"

type SortKey = "rank" | "price" | "change" | "mcap" | "volume" | "name"
type SortDir = "asc" | "desc"

const REFRESH_MS = 75_000

export default function MarketsPage() {
  const [coins, setCoins] = useState<MarketCoin[]>([])
  const [q, setQ] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>("rank")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [category, setCategory] = useState("")
  const [compareIds, setCompareIds] = useState<string[]>([])
  const { toggleWatchlist, isWatched, addHolding } = usePortfolio()
  const { currency } = useCurrency()

  useEffect(() => {
    setCompareIds(loadCompareIds())
  }, [])

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError("")
    try {
      const url = category
        ? `/api/categories?category=${encodeURIComponent(category)}&vs=${currency}&per_page=100`
        : `/api/markets?per_page=100&sparkline=true&vs=${currency}`
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load markets")
      const list = category
        ? ((data.coins as MarketCoin[]) || [])
        : (data as MarketCoin[])
      setCoins(list)
      setUpdatedAt(new Date())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [currency, category])

  useEffect(() => {
    load()
    const t = setInterval(() => load(true), REFRESH_MS)
    return () => clearInterval(t)
  }, [load])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir(key === "name" || key === "rank" ? "asc" : "desc")
    }
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    let list = coins
    if (s) {
      list = coins.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.symbol.toLowerCase().includes(s) ||
          c.id.includes(s)
      )
    }
    const mult = sortDir === "asc" ? 1 : -1
    return [...list].sort((a, b) => {
      switch (sortKey) {
        case "name":
          return mult * a.name.localeCompare(b.name)
        case "price":
          return mult * (a.current_price - b.current_price)
        case "change":
          return (
            mult *
            ((a.price_change_percentage_24h ?? -Infinity) -
              (b.price_change_percentage_24h ?? -Infinity))
          )
        case "mcap":
          return mult * (a.market_cap - b.market_cap)
        case "volume":
          return mult * (a.total_volume - b.total_volume)
        case "rank":
        default:
          return (
            mult *
            ((a.market_cap_rank ?? 9999) - (b.market_cap_rank ?? 9999))
          )
      }
    })
  }, [coins, q, sortKey, sortDir])

  function SortTh({
    k,
    children,
    className,
  }: {
    k: SortKey
    children: React.ReactNode
    className?: string
  }) {
    const active = sortKey === k
    return (
      <th className={cn("px-3 py-3 font-medium", className)}>
        <button
          type="button"
          onClick={() => toggleSort(k)}
          className={cn(
            "inline-flex items-center gap-1 uppercase tracking-wider text-[11px] hover:text-foreground",
            active ? "text-accent" : "text-muted"
          )}
        >
          {children}
          <ArrowDownUp
            className={cn("h-3 w-3", active ? "opacity-100" : "opacity-40")}
          />
        </button>
      </th>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card/40 px-5 py-8 sm:px-8 sm:py-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(600px 200px at 10% 0%, rgba(34,211,166,0.18), transparent), radial-gradient(400px 180px at 90% 100%, rgba(96,165,250,0.12), transparent)",
          }}
        />
        <div className="relative max-w-2xl space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            Private · live · no account
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
            Track crypto without giving up your data
          </h1>
          <p className="text-sm sm:text-base text-muted leading-relaxed">
            Live CoinGecko markets, a browser-only portfolio, watchlist, and
            USD/CAD — nothing uploaded to our servers.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              href="/portfolio"
              className="inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
            >
              Open portfolio
            </Link>
            <button
              type="button"
              onClick={() => {
                addHolding({
                  id: "bitcoin",
                  symbol: "btc",
                  name: "Bitcoin",
                  amount: 0.01,
                })
                window.location.href = "/portfolio"
              }}
              className="inline-flex rounded-lg border border-border bg-background/50 px-4 py-2 text-sm font-medium hover:border-accent/40"
            >
              Try sample 0.01 BTC
            </button>
          </div>
        </div>
      </section>

      <GlobalStats currency={currency} />
      <TrendingStrip />
      {coins.length > 0 && !category && (
        <MarketMovers coins={coins} currency={currency} />
      )}
      {coins.length > 0 && !category && (
        <MarketHeatmap coins={coins} currency={currency} />
      )}
      {compareIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-accent/30 bg-accent/5 px-3 py-2 text-xs">
          <GitCompare className="h-3.5 w-3.5 text-accent" />
          <span className="text-muted">Compare tray:</span>
          {compareIds.map((id) => (
            <span key={id} className="font-mono text-accent">
              {id}
            </span>
          ))}
          <Link
            href={`/compare?ids=${encodeURIComponent(compareIds.join(","))}`}
            className="ml-auto rounded-lg bg-accent px-3 py-1 font-semibold text-black"
          >
            Open compare ({compareIds.length})
          </Link>
          <button
            type="button"
            className="text-muted hover:text-danger"
            onClick={() => {
              setCompareIds([])
              try {
                localStorage.removeItem("kryptotrac-compare-ids-v1")
              } catch {
                /* ignore */
              }
            }}
          >
            Clear
          </button>
        </div>
      )}
      <AdBanner />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
              Markets
            </h2>
            <p className="mt-1 text-sm text-muted">
              {category ? "Category filter" : "Top 100 by market cap"} · search
              all coins or filter table
              {updatedAt && (
                <span className="ml-2 text-xs">
                  · updated {updatedAt.toLocaleTimeString()}
                  <span className="text-muted/70">
                    {" "}
                    · auto {REFRESH_MS / 1000}s
                  </span>
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => load()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:border-accent/40 disabled:opacity-50"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", loading && "animate-spin")}
              />
              Refresh
            </button>
            <CoinSearch />
            <label className="relative w-full sm:w-52">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Filter table…"
                className="w-full rounded-xl border border-border bg-card py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-accent/40"
                aria-label="Filter market table"
              />
            </label>
          </div>
        </div>
        <CategoryFilter value={category} onChange={setCategory} />
      </div>

      {error && (
        <ErrorBanner
          message={error}
          onRetry={() => load()}
          hint="CoinGecko rate limits may apply. Wait a minute and retry."
        />
      )}

      {loading && coins.length === 0 ? (
        <div className="grid gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-xl bg-card/60 border border-border"
            />
          ))}
        </div>
      ) : (
        <div className="table-scroll rounded-xl border border-border bg-card/40">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border">
              <tr>
                <SortTh k="rank" className="w-10">
                  #
                </SortTh>
                <SortTh k="name">Asset</SortTh>
                <SortTh k="price" className="text-right">
                  Price
                </SortTh>
                <SortTh k="change" className="text-right">
                  24h
                </SortTh>
                <SortTh k="mcap" className="text-right hidden md:table-cell">
                  Market cap
                </SortTh>
                <SortTh k="volume" className="text-right hidden lg:table-cell">
                  Volume
                </SortTh>
                <th className="px-3 py-3 font-medium text-right hidden sm:table-cell text-[11px] uppercase tracking-wider text-muted">
                  7d
                </th>
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
                      <Link
                        href={`/coin/${c.id}`}
                        className="flex items-center gap-3 group"
                      >
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
                          <span className="ml-2 text-xs uppercase text-muted">
                            {c.symbol}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums">
                      {formatMoney(c.current_price, currency)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <ChangeBadge value={ch} />
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums text-muted hidden md:table-cell">
                      {formatMoney(c.market_cap, currency, true)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums text-muted hidden lg:table-cell">
                      {formatMoney(c.total_volume, currency, true)}
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
                      <div className="inline-flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => setCompareIds(toggleCompareId(c.id))}
                          className={cn(
                            "rounded-md p-1.5 text-muted hover:bg-white/5 hover:text-accent",
                            compareIds.includes(c.id) && "text-accent"
                          )}
                          aria-label="Toggle compare"
                          title="Add to compare"
                        >
                          <GitCompare className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleWatchlist(c.id)}
                          className="rounded-md p-1.5 text-muted hover:bg-white/5 hover:text-warning"
                          aria-label={
                            watched
                              ? "Remove from watchlist"
                              : "Add to watchlist"
                          }
                        >
                          <Star
                            className="h-4 w-4"
                            fill={watched ? "currentColor" : "none"}
                            style={
                              watched ? { color: "var(--warning)" } : undefined
                            }
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="p-8 text-center text-sm text-muted">
              No coins match your search.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
