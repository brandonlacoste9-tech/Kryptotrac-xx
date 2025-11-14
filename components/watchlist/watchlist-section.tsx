"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Plus, Star, StarOff, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface Coin {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  image: string
  sparkline_in_7d?: { price: number[] }
}

export function WatchlistSection() {
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [coins, setCoins] = useState<Coin[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Coin[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const supabase = createBrowserClient()

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadWatchlist()
    } else {
      loadLocalWatchlist()
    }
  }, [user])

  useEffect(() => {
    if (watchlist.length > 0) {
      loadCoins()
      const interval = setInterval(loadCoins, 30000)
      return () => clearInterval(interval)
    } else {
      setLoading(false)
    }
  }, [watchlist])

  async function loadUser() {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }

  async function loadWatchlist() {
    const { data } = await supabase.from("user_watchlists").select("coin_id").eq("user_id", user.id)

    if (data) {
      setWatchlist(data.map((w) => w.coin_id))
    }
  }

  function loadLocalWatchlist() {
    const stored = localStorage.getItem("watchlist")
    if (stored) {
      setWatchlist(JSON.parse(stored))
    } else {
      setWatchlist(["bitcoin", "ethereum", "solana"])
    }
  }

  async function loadCoins() {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${watchlist.join(",")}&sparkline=true`,
      )
      const data = await response.json()
      setCoins(data)
    } catch (error) {
      console.error("Failed to load coins:", error)
    } finally {
      setLoading(false)
    }
  }

  async function searchCoins(query: string) {
    if (!query) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${query}`)
      const data = await response.json()
      setSearchResults(data.coins.slice(0, 5))
    } catch (error) {
      console.error("Search failed:", error)
    }
  }

  async function addToWatchlist(coinId: string) {
    if (watchlist.includes(coinId)) {
      return
    }

    const newWatchlist = [...watchlist, coinId]
    setWatchlist(newWatchlist)

    if (user) {
      const { error } = await supabase
        .from("user_watchlists")
        .upsert(
          {
            user_id: user.id,
            coin_id: coinId,
          },
          {
            onConflict: "user_id,coin_id",
            ignoreDuplicates: true,
          }
        )

      if (error) {
        console.error("[v0] Error adding to watchlist:", error)
        // Revert on error
        setWatchlist(watchlist)
      }
    } else {
      localStorage.setItem("watchlist", JSON.stringify(newWatchlist))
    }

    setDialogOpen(false)
    setSearchQuery("")
    setSearchResults([])
  }

  async function removeFromWatchlist(coinId: string) {
    const newWatchlist = watchlist.filter((id) => id !== coinId)
    setWatchlist(newWatchlist)

    if (user) {
      await supabase.from("user_watchlists").delete().eq("user_id", user.id).eq("coin_id", coinId)
    } else {
      localStorage.setItem("watchlist", JSON.stringify(newWatchlist))
    }
  }

  if (loading) {
    return <div className="text-white/60">Loading watchlist...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Star className="w-6 h-6 text-red-500" />
          My Watchlist
        </h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Coin
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black/95 border-red-900/30 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-white">Add to Watchlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Search cryptocurrencies..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  searchCoins(e.target.value)
                }}
                className="bg-white/5 border-white/10 text-white"
              />
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.map((coin) => (
                  <button
                    key={coin.id}
                    onClick={() => addToWatchlist(coin.id)}
                    disabled={watchlist.includes(coin.id)}
                    className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-8 h-8" />
                    <div className="flex-1 text-left">
                      <div className="text-white font-medium">{coin.name}</div>
                      <div className="text-white/60 text-sm uppercase">{coin.symbol}</div>
                    </div>
                    {watchlist.includes(coin.id) && <span className="text-green-500 text-sm">Added</span>}
                  </button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {coins.map((coin) => (
          <div
            key={coin.id}
            className="group relative p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-red-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]"
          >
            <button
              onClick={() => removeFromWatchlist(coin.id)}
              className="absolute top-2 right-2 p-1 rounded-lg bg-black/50 hover:bg-red-600/20 opacity-0 group-hover:opacity-100 transition-all"
            >
              <StarOff className="w-4 h-4 text-red-500" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-10 h-10" />
              <div className="flex-1">
                <div className="text-white font-bold">{coin.name}</div>
                <div className="text-white/60 text-sm uppercase">{coin.symbol}</div>
              </div>
            </div>

            <div className="text-2xl font-bold text-white mb-2">${coin.current_price.toLocaleString()}</div>

            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                coin.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {coin.price_change_percentage_24h >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
            </div>

            {coin.sparkline_in_7d && (
              <svg className="w-full h-12 mt-3" viewBox="0 0 164 48" preserveAspectRatio="none">
                <polyline
                  points={coin.sparkline_in_7d.price
                    .map((price, i) => {
                      const x = (i / (coin.sparkline_in_7d!.price.length - 1)) * 164
                      const minPrice = Math.min(...coin.sparkline_in_7d!.price)
                      const maxPrice = Math.max(...coin.sparkline_in_7d!.price)
                      const y = 48 - ((price - minPrice) / (maxPrice - minPrice)) * 48
                      return `${x},${y}`
                    })
                    .join(" ")}
                  fill="none"
                  stroke={coin.price_change_percentage_24h >= 0 ? "#10b981" : "#ef4444"}
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
              </svg>
            )}
          </div>
        ))}
      </div>

      {coins.length === 0 && (
        <div className="text-center py-12 text-white/60">
          <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No coins in your watchlist yet.</p>
          <p className="text-sm mt-2">Click "Add Coin" to get started!</p>
        </div>
      )}
    </div>
  )
}
