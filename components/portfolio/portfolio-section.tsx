"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Holding {
  id: string
  coin_id: string
  coin_name: string
  coin_symbol: string
  coin_image: string
  quantity: number
  purchase_price: number
  purchase_date: string
  current_price?: number
}

export function PortfolioSection() {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedCoin, setSelectedCoin] = useState<any>(null)
  const [quantity, setQuantity] = useState("")
  const [purchasePrice, setPurchasePrice] = useState("")
  const [purchaseDate, setPurchaseDate] = useState("")
  const [user, setUser] = useState<any>(null)

  const supabase = createBrowserClient()

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadHoldings()
    }
  }, [user])

  async function loadUser() {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }

  async function loadHoldings() {
    const { data } = await supabase.from("user_portfolios").select("*").eq("user_id", user.id)

    if (data) {
      const holdingsWithPrices = await Promise.all(
        data.map(async (holding) => {
          try {
            const response = await fetch(
              `https://api.coingecko.com/api/v3/simple/price?ids=${holding.coin_id}&vs_currencies=usd`,
            )
            const priceData = await response.json()
            return {
              ...holding,
              current_price: priceData[holding.coin_id]?.usd || 0,
            }
          } catch (error) {
            return { ...holding, current_price: 0 }
          }
        }),
      )
      setHoldings(holdingsWithPrices)
    }
    setLoading(false)
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

  async function addHolding() {
    if (!selectedCoin || !quantity || !purchasePrice) return

    const { error } = await supabase.from("user_portfolios").insert({
      user_id: user.id,
      coin_id: selectedCoin.id,
      coin_name: selectedCoin.name,
      coin_symbol: selectedCoin.symbol,
      coin_image: selectedCoin.large,
      quantity: parseFloat(quantity),
      purchase_price: parseFloat(purchasePrice),
      purchase_date: purchaseDate || new Date().toISOString(),
    })

    if (!error) {
      loadHoldings()
      setDialogOpen(false)
      setSelectedCoin(null)
      setQuantity("")
      setPurchasePrice("")
      setPurchaseDate("")
      setSearchQuery("")
      setSearchResults([])
    }
  }

  async function deleteHolding(id: string) {
    await supabase.from("user_portfolios").delete().eq("id", id)
    loadHoldings()
  }

  const totalValue = holdings.reduce((sum, h) => sum + (h.current_price || 0) * h.quantity, 0)
  const totalCost = holdings.reduce((sum, h) => sum + h.purchase_price * h.quantity, 0)
  const totalGain = totalValue - totalCost
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0

  if (!user) {
    return null
  }

  if (loading) {
    return <div className="text-white/60">Loading portfolio...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Portfolio</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Holding
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black/95 border-red-900/30 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-white">Add Holding</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {!selectedCoin ? (
                <>
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
                        onClick={() => setSelectedCoin(coin)}
                        className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-3 transition-all"
                      >
                        <img src={coin.large || "/placeholder.svg"} alt={coin.name} className="w-8 h-8" />
                        <div className="flex-1 text-left">
                          <div className="text-white font-medium">{coin.name}</div>
                          <div className="text-white/60 text-sm uppercase">{coin.symbol}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <img src={selectedCoin.large || "/placeholder.svg"} alt={selectedCoin.name} className="w-10 h-10" />
                    <div>
                      <div className="text-white font-medium">{selectedCoin.name}</div>
                      <div className="text-white/60 text-sm">{selectedCoin.symbol.toUpperCase()}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-white">
                      Quantity
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="any"
                      placeholder="0.0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-white">
                      Purchase Price (USD)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="any"
                      placeholder="0.0"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-white">
                      Purchase Date (Optional)
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => setSelectedCoin(null)} variant="outline" className="flex-1">
                      Back
                    </Button>
                    <Button onClick={addHolding} className="flex-1 bg-red-600 hover:bg-red-700">
                      Add Holding
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {holdings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="text-white/60 text-sm mb-1">Total Value</div>
            <div className="text-2xl font-bold text-white">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="text-white/60 text-sm mb-1">Total Cost</div>
            <div className="text-2xl font-bold text-white">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="text-white/60 text-sm mb-1">Total Gain/Loss</div>
            <div className={`text-2xl font-bold ${totalGain >= 0 ? "text-green-500" : "text-red-500"}`}>
              {totalGain >= 0 ? "+" : ""}${totalGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-base ml-2">({totalGainPercent >= 0 ? "+" : ""}{totalGainPercent.toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {holdings.map((holding) => {
          const currentValue = (holding.current_price || 0) * holding.quantity
          const costBasis = holding.purchase_price * holding.quantity
          const gain = currentValue - costBasis
          const gainPercent = costBasis > 0 ? (gain / costBasis) * 100 : 0

          return (
            <div
              key={holding.id}
              className="group p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-red-500/50 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <img src={holding.coin_image || "/placeholder.svg"} alt={holding.coin_name} className="w-10 h-10" />
                  <div className="flex-1">
                    <div className="text-white font-bold">{holding.coin_name}</div>
                    <div className="text-white/60 text-sm">
                      {holding.quantity} {holding.coin_symbol.toUpperCase()} @ ${holding.purchase_price.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-lg">${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className={`text-sm font-medium flex items-center gap-1 ${gain >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {gain >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {gain >= 0 ? "+" : ""}${Math.abs(gain).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({gainPercent >= 0 ? "+" : ""}{gainPercent.toFixed(2)}%)
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteHolding(holding.id)}
                  className="ml-4 p-2 rounded-lg bg-black/50 hover:bg-red-600/20 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {holdings.length === 0 && (
        <div className="text-center py-12 text-white/60">
          <p>No holdings in your portfolio yet.</p>
          <p className="text-sm mt-2">Click "Add Holding" to track your investments!</p>
        </div>
      )}
    </div>
  )
}
