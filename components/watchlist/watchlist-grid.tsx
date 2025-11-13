"use client"

import { CoinCard } from "./coin-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { CoinData } from "@/types/crypto"

interface WatchlistGridProps {
  coins: CoinData[]
  loading: boolean
  onRemove: (coinId: string) => void
}

export function WatchlistGrid({ coins, loading, onRemove }: WatchlistGridProps) {
  if (loading && coins.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {coins.map((coin) => (
        <CoinCard key={coin.id} coin={coin} onRemove={onRemove} />
      ))}
    </div>
  )
}
