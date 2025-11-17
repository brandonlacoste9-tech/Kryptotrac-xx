"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"

interface MarketStats {
  total_market_cap: number
  total_volume: number
  market_cap_change_percentage_24h: number
  active_cryptocurrencies: number
}

export function MarketStatsHeader() {
  const [stats, setStats] = useState<MarketStats | null>(null)

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 60000)
    return () => clearInterval(interval)
  }, [])

  async function loadStats() {
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/global")
      const data = await response.json()
      setStats({
        total_market_cap: data.data.total_market_cap.usd,
        total_volume: data.data.total_volume.usd,
        market_cap_change_percentage_24h: data.data.market_cap_change_percentage_24h_usd,
        active_cryptocurrencies: data.data.active_cryptocurrencies,
      })
    } catch (error) {
      console.error("Failed to load market stats:", error)
    }
  }

  if (!stats) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-red-500/30 transition-all">
        <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
          <Activity className="w-4 h-4" />
          Total Market Cap
        </div>
        <div className="text-2xl font-bold text-white">${(stats.total_market_cap / 1e12).toFixed(2)}T</div>
        <div
          className={`flex items-center gap-1 text-sm mt-1 ${
            stats.market_cap_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {stats.market_cap_change_percentage_24h >= 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {Math.abs(stats.market_cap_change_percentage_24h).toFixed(2)}% (24h)
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-red-500/30 transition-all">
        <div className="text-white/60 text-sm mb-2">24h Volume</div>
        <div className="text-2xl font-bold text-white">${(stats.total_volume / 1e9).toFixed(2)}B</div>
      </div>

      <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-red-500/30 transition-all">
        <div className="text-white/60 text-sm mb-2">Active Coins</div>
        <div className="text-2xl font-bold text-white">{stats.active_cryptocurrencies.toLocaleString()}</div>
      </div>
    </div>
  )
}
