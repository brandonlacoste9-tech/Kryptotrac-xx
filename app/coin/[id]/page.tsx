"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Star } from "lucide-react"
import type { CoinDetail } from "@/lib/types"
import { formatUsd } from "@/lib/utils"
import { ChangeBadge } from "@/components/change-badge"
import { StatCard } from "@/components/stat-card"
import { AddHoldingForm } from "@/components/add-holding-form"
import { usePortfolio } from "@/lib/portfolio"

export default function CoinPage() {
  const params = useParams()
  const id = params.id as string
  const [coin, setCoin] = useState<CoinDetail | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const { toggleWatchlist, isWatched } = usePortfolio()

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`/api/coin/${encodeURIComponent(id)}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to load coin")
        if (!cancelled) setCoin(data as CoinDetail)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded bg-card" />
        <div className="h-40 animate-pulse rounded-xl bg-card" />
      </div>
    )
  }

  if (error || !coin) {
    return (
      <div className="space-y-4">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent">
          <ArrowLeft className="h-4 w-4" /> Markets
        </Link>
        <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error || "Coin not found"}
        </div>
      </div>
    )
  }

  const md = coin.market_data
  const price = md.current_price.usd
  const watched = isWatched(coin.id)
  const desc = coin.description?.en?.replace(/<[^>]+>/g, "").slice(0, 480)

  return (
    <div className="space-y-6">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent">
        <ArrowLeft className="h-4 w-4" /> Markets
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Image
            src={coin.image.large || coin.image.small}
            alt=""
            width={56}
            height={56}
            className="rounded-full"
            unoptimized
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              {coin.name}{" "}
              <span className="text-base font-normal uppercase text-muted">{coin.symbol}</span>
            </h1>
            <p className="text-sm text-muted">
              Rank #{coin.market_cap_rank ?? "—"} · {formatUsd(price)}
              <span className="ml-2">
                <ChangeBadge value={md.price_change_percentage_24h} />
              </span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => toggleWatchlist(coin.id)}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-border bg-card px-3 py-2 text-sm hover:border-warning/50"
        >
          <Star
            className="h-4 w-4"
            fill={watched ? "currentColor" : "none"}
            style={watched ? { color: "var(--warning)" } : undefined}
          />
          {watched ? "Watching" : "Watch"}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Market cap" value={formatUsd(md.market_cap.usd, true)} />
        <StatCard label="Volume 24h" value={formatUsd(md.total_volume.usd, true)} />
        <StatCard label="24h high" value={formatUsd(md.high_24h.usd)} />
        <StatCard label="24h low" value={formatUsd(md.low_24h.usd)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          label="7d change"
          value={
            md.price_change_percentage_7d != null
              ? `${md.price_change_percentage_7d.toFixed(2)}%`
              : "—"
          }
          sub={<ChangeBadge value={md.price_change_percentage_7d} />}
        />
        <StatCard
          label="ATH / ATL"
          value={`${formatUsd(md.ath.usd)} / ${formatUsd(md.atl.usd)}`}
        />
      </div>

      <AddHoldingForm
        id={coin.id}
        symbol={coin.symbol}
        name={coin.name}
        currentPrice={price}
      />

      {desc && (
        <section className="rounded-xl border border-border bg-card/50 p-5">
          <h2 className="text-sm font-semibold mb-2">About</h2>
          <p className="text-sm text-muted leading-relaxed">
            {desc}
            {coin.description.en.length > 480 ? "…" : ""}
          </p>
        </section>
      )}
    </div>
  )
}
