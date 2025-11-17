"use client"

import { useEffect, useState } from "react"
import { getTrendingCoins, type CoinPrice } from "@/lib/coingecko"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, Star } from 'lucide-react'

export function MarketOverview() {
  const [coins, setCoins] = useState<CoinPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [watchlist, setWatchlist] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("kryptotrac_watchlist")
    if (stored) {
      setWatchlist(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    async function loadMarketData() {
      try {
        const data = await getTrendingCoins()
        setCoins(data)
        setError(null)
      } catch (err) {
        // Should never reach here since getTrendingCoins always returns data
        setError(null)
      } finally {
        setLoading(false)
      }
    }

    loadMarketData()
    const interval = setInterval(loadMarketData, 30000)
    return () => clearInterval(interval)
  }, [])

  const toggleWatchlist = (coinId: string) => {
    setWatchlist((prev) => {
      const newList = prev.includes(coinId) ? prev.filter((id) => id !== coinId) : [...prev, coinId]
      localStorage.setItem("kryptotrac_watchlist", JSON.stringify(newList))
      return newList
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold neon-text-white">Top Cryptocurrencies</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card-red p-6">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  const watchlistCoins = coins.filter((coin) => watchlist.includes(coin.id))
  const otherCoins = coins.filter((coin) => !watchlist.includes(coin.id))

  return (
    <div className="space-y-8">
      {watchlistCoins.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold neon-text-white flex items-center gap-2">
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            My Watchlist
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {watchlistCoins.map((coin) => (
              <CoinCard key={coin.id} coin={coin} isWatched={true} onToggleWatchlist={toggleWatchlist} />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-3xl font-bold neon-text-white">Top Cryptocurrencies</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {otherCoins.map((coin) => (
            <CoinCard key={coin.id} coin={coin} isWatched={false} onToggleWatchlist={toggleWatchlist} />
          ))}
        </div>
      </div>
    </div>
  )
}

function CoinCard({
  coin,
  isWatched,
  onToggleWatchlist,
}: {
  coin: CoinPrice
  isWatched: boolean
  onToggleWatchlist: (id: string) => void
}) {
  return (
    <div className="glass-card p-6 space-y-3 group relative">
      <button
        onClick={() => onToggleWatchlist(coin.id)}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={isWatched ? "Remove from watchlist" : "Add to watchlist"}
      >
        <Star className={`w-5 h-5 ${isWatched ? "fill-yellow-400 text-yellow-400" : "text-white/40"}`} />
      </button>

      <div className="flex items-center gap-3">
        <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-12 h-12 rounded-full" />
        <div>
          <div className="font-bold text-lg">{coin.name}</div>
          <div className="text-sm text-muted-foreground uppercase">{coin.symbol}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-2xl font-bold neon-text-white animate-in fade-in duration-300">
          ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
            coin.price_change_percentage_24h >= 0 ? "bg-positive text-positive" : "bg-negative text-negative"
          }`}
        >
          {coin.price_change_percentage_24h >= 0 ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          {coin.price_change_percentage_24h >= 0 ? "+" : ""}
          {coin.price_change_percentage_24h.toFixed(2)}%
        </div>
      </div>

      {coin.sparkline_in_7d?.price && (
        <div className="h-12 w-full">
          <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
            <polyline
              points={coin.sparkline_in_7d.price
                .map((price, i) => {
                  const x = (i / (coin.sparkline_in_7d!.price.length - 1)) * 100
                  const min = Math.min(...coin.sparkline_in_7d!.price)
                  const max = Math.max(...coin.sparkline_in_7d!.price)
                  const y = 25 - ((price - min) / (max - min)) * 20
                  return `${x},${y}`
                })
                .join(" ")}
              fill="none"
              stroke={coin.price_change_percentage_24h >= 0 ? "#10b981" : "#ef4444"}
              strokeWidth="1"
              className="drop-shadow-[0_0_4px_currentColor]"
            />
          </svg>
        </div>
      )}
    </div>
  )
}
