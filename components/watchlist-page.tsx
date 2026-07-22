"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import { usePortfolio } from "@/lib/portfolio"
import type { MarketCoin } from "@/lib/types"
import { formatMoney } from "@/lib/utils"
import { ChangeBadge } from "@/components/change-badge"
import { useCurrency } from "@/lib/currency"

export default function WatchlistPage() {
  const { ready, watchlist, toggleWatchlist } = usePortfolio()
  const { currency } = useCurrency()
  const [coins, setCoins] = useState<MarketCoin[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!ready) return
    if (watchlist.length === 0) {
      setCoins([])
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(
          `/api/markets?per_page=250&sparkline=false&vs=${currency}`
        )
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to load")
        const set = new Set(watchlist)
        const list = (data as MarketCoin[]).filter((c) => set.has(c.id))
        if (!cancelled) setCoins(list)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ready, watchlist, currency])

  if (!ready) return <p className="text-sm text-muted">Loading…</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Watchlist</h1>
        <p className="mt-1 text-sm text-muted">
          {watchlist.length} coin{watchlist.length === 1 ? "" : "s"} · saved in this browser
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {watchlist.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
          <p className="font-medium">Watchlist is empty</p>
          <p className="mt-2 text-sm text-muted">Tap the star on any market row or coin page.</p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black"
          >
            Browse markets
          </Link>
        </div>
      ) : loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-card border border-border" />
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card/40 overflow-hidden">
          {coins.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03]"
            >
              <Link href={`/coin/${c.id}`} className="flex flex-1 items-center gap-3 min-w-0">
                <Image src={c.image} alt="" width={32} height={32} className="rounded-full" unoptimized />
                <span className="min-w-0">
                  <span className="font-medium block truncate">{c.name}</span>
                  <span className="text-xs uppercase text-muted">{c.symbol}</span>
                </span>
              </Link>
              <div className="text-right shrink-0">
                <div className="font-mono text-sm tabular-nums">
                  {formatMoney(c.current_price, currency)}
                </div>
                <ChangeBadge value={c.price_change_percentage_24h} className="text-xs" />
              </div>
              <button
                type="button"
                onClick={() => toggleWatchlist(c.id)}
                className="rounded-md p-1.5 text-warning hover:bg-white/5"
                aria-label="Remove from watchlist"
              >
                <Star className="h-4 w-4" fill="currentColor" />
              </button>
            </li>
          ))}
          {watchlist
            .filter((id) => !coins.some((c) => c.id === id))
            .map((id) => (
              <li key={id} className="flex items-center justify-between px-4 py-3 text-sm">
                <Link href={`/coin/${id}`} className="text-accent hover:underline">
                  {id}
                </Link>
                <span className="text-xs text-muted">Outside top markets — open coin page</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
