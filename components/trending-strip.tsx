"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Flame } from "lucide-react"

type Item = {
  id: string
  name: string
  symbol: string
  market_cap_rank: number | null
  thumb: string
}

export function TrendingStrip() {
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/trending")
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled && Array.isArray(data.coins)) setItems(data.coins)
      } catch {
        /* optional */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (items.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-card/40 px-3 py-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted font-semibold mb-2">
        <Flame className="h-3.5 w-3.5 text-warning" />
        Trending
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.map((c) => (
          <Link
            key={c.id}
            href={`/coin/${c.id}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-background/50 px-2.5 py-1.5 text-xs hover:border-accent/40 transition-colors"
          >
            <Image
              src={c.thumb}
              alt=""
              width={18}
              height={18}
              className="rounded-full"
              unoptimized
            />
            <span className="font-semibold uppercase">{c.symbol}</span>
            {c.market_cap_rank != null && (
              <span className="text-muted">#{c.market_cap_rank}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
