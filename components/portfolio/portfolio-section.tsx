"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PortfolioShareCard } from "@/components/share/portfolio-share-card"

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
  const [isPro, setIsPro] = useState(false)

  const supabase = createBrowserClient()

  useEffect(() => {
    loadUserAndSubscription()
  }, [])

  useEffect(() => {
    if (user) {
      loadHoldings()
      const interval = setInterval(loadHoldings, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  async function loadUserAndSubscription() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
        const { data: sub } = await supabase
            .from('user_subscriptions')
            .select('status')
            .eq('user_id', user.id)
            .in('status', ['active', 'trialing'])
            .single()
        
        if (sub) {
            setIsPro(true)
        }
    }
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
    return <div className="text-white/60 font-mono animate-pulse">INITIALIZING_PORTFOLIO_MODULE...</div>
  }

  // Prepare top holdings for share card
  const topHoldings = holdings
    .map(h => ({
        coin_id: h.coin_id,
        coin_symbol: h.coin_symbol,
        quantity: h.quantity,
        current_price: h.current_price || 0,
        purchase_price: h.purchase_price
    }))
    .sort((a, b) => (b.quantity * b.current_price) - (a.quantity * a.current_price))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white font-mono tracking-tighter">PORTFOLIO_STATUS</h2>
        <div className="flex gap-2">
            <PortfolioShareCard 
                totalValue={totalValue}
                totalProfitLoss={totalGain}
                profitLossPercentage={totalGainPercent}
                topHoldings={topHoldings}
                isPro={isPro}
            />
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 font-mono tracking-wider">
                <Plus className="w-4 h-4 mr-2" />
                ADD_ASSET
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/95 border-red-900/30 backdrop-blur-xl">
                <DialogHeader>
                <DialogTitle className="text-white font-mono text-xl">ADD_NEW_ASSET</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 font-mono">
                {!selectedCoin ? (
                    <>
                    <Input
                        placeholder="SEARCH_COIN_DATABASE..."
                        value={searchQuery}
                        onChange={(e) => {
                        setSearchQuery(e.target.value)
                        searchCoins(e.target.value)
                        }}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    />
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {searchResults.map((coin) => (
                        <button
                            key={coin.id}
                            onClick={() => setSelectedCoin(coin)}
                            className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-3 transition-all group"
                        >
                            <img src={coin.large || "/placeholder.svg"} alt={coin.name} className="w-8 h-8 rounded-full ring-1 ring-white/10 group-hover:ring-red-500/50" />
                            <div className="flex-1 text-left">
                            <div className="text-white font-medium group-hover:text-red-400 transition-colors uppercase">{coin.name}</div>
                            <div className="text-white/60 text-sm uppercase">{coin.symbol}</div>
                            </div>
                        </button>
                        ))}
                    </div>
                    </>
                ) : (
                    <>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                        <img src={selectedCoin.large || "/placeholder.svg"} alt={selectedCoin.name} className="w-10 h-10 rounded-full" />
                        <div>
                        <div className="text-white font-medium uppercase">{selectedCoin.name}</div>
                        <div className="text-white/60 text-sm uppercase">{selectedCoin.symbol.toUpperCase()}</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quantity" className="text-white text-xs uppercase tracking-widest">
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
                        <Label htmlFor="price" className="text-white text-xs uppercase tracking-widest">
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
                        <Label htmlFor="date" className="text-white text-xs uppercase tracking-widest">
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

                    <div className="flex gap-2 pt-2">
                        <Button onClick={() => setSelectedCoin(null)} variant="outline" className="flex-1 border-white/10 hover:bg-white/5 hover:text-white">
                        BACK
                        </Button>
                        <Button onClick={addHolding} className="flex-1 bg-red-600 hover:bg-red-700">
                        CONFIRM_ADD
                        </Button>
                    </div>
                    </>
                )}
                </div>
            </DialogContent>
            </Dialog>
        </div>
      </div>

      {holdings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
            <div className="text-cyan-500/60 text-[10px] uppercase tracking-widest mb-1 font-mono">Total Value</div>
            <div className="text-2xl font-bold text-white font-mono">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className="p-4 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10">
            <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1 font-mono">Total Cost</div>
            <div className="text-2xl font-bold text-white/80 font-mono">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className="p-4 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 relative overflow-hidden">
             <div className={`absolute inset-0 bg-gradient-to-br ${totalGain >= 0 ? "from-green-500/10" : "from-red-500/10"} to-transparent opacity-50`}/>
            <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1 font-mono relative z-10">Total Gain/Loss</div>
            <div className={`text-2xl font-bold relative z-10 font-mono ${totalGain >= 0 ? "text-green-400" : "text-red-400"}`}>
              {totalGain >= 0 ? "+" : ""}${totalGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-base ml-2 opacity-80">({totalGainPercent >= 0 ? "+" : ""}{totalGainPercent.toFixed(2)}%)</span>
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
              className="group p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-cyan-500/30 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"/>
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <img src={holding.coin_image || "/placeholder.svg"} alt={holding.coin_name} className="w-10 h-10 rounded-full ring-2 ring-white/10 group-hover:ring-cyan-500/50 transition-all" />
                    <div className="absolute -bottom-1 -right-1 bg-black/80 text-[8px] px-1 rounded text-white/60 border border-white/10 font-mono">V1</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-bold uppercase tracking-wider font-mono flex items-center gap-2">
                        {holding.coin_name}
                        <span className="text-[10px] bg-white/10 px-1 rounded text-white/40">{holding.coin_symbol.toUpperCase()}</span>
                    </div>
                    <div className="text-white/40 text-xs font-mono mt-0.5">
                      {holding.quantity} UNITS @ ${holding.purchase_price.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-lg font-mono">${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className={`text-sm font-medium flex items-center justify-end gap-1 font-mono ${gain >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {gain >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {gain >= 0 ? "+" : ""}${Math.abs(gain).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteHolding(holding.id)}
                  className="ml-4 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 opacity-0 group-hover:opacity-100 transition-all border border-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {holdings.length === 0 && (
        <div className="text-center py-12 border border-white/5 rounded-xl bg-white/5 backdrop-blur-sm">
          <p className="text-white/40 font-mono uppercase tracking-widest text-sm">No assets detected in secure storage</p>
          <p className="text-xs text-white/20 mt-2 font-mono">INITIATE_PROTOCOL: ADD_ASSET to begin tracking</p>
        </div>
      )}
    </div>
  )
}
