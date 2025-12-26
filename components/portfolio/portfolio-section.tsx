"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { searchCoinGecko } from "@/lib/coingecko"
import Decimal from "decimal.js"

export function PortfolioSection() {
  const [holdings, setHoldings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedCoin, setSelectedCoin] = useState<any>(null)
  const [quantity, setQuantity] = useState("")
  const [purchasePrice, setPurchasePrice] = useState("")
  const [purchaseDate, setPurchaseDate] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  const supabase = createBrowserClient()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadHoldings()
    }
  }, [user])

  async function checkUser() {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }

  async function loadHoldings() {
    if (!user) return
    const { data } = await supabase.from("user_portfolios").select("*").eq("user_id", user.id)
    if (data) {
        // Sort by value (descending)
        const sorted = data
            .sort((a, b) => {
                const valA = new Decimal(a.quantity).times(a.current_price || 0).toNumber()
                const valB = new Decimal(b.quantity).times(b.current_price || 0).toNumber()
                return valB - valA
            })
      setHoldings(sorted)
    }
    setLoading(false)
  }

  async function searchCoins(query: string) {
    if (query.length < 2) return
    const results = await searchCoinGecko(query)
    setSearchResults(results)
  }

  async function addHolding() {
    if (!user || !selectedCoin || !quantity || !purchasePrice) return

    const newHolding = {
      user_id: user.id,
      coin_id: selectedCoin.id,
      coin_name: selectedCoin.name,
      coin_symbol: selectedCoin.symbol,
      coin_image: selectedCoin.large,
      quantity: parseFloat(quantity),
      purchase_price: parseFloat(purchasePrice),
      purchase_date: purchaseDate ? new Date(purchaseDate).toISOString() : new Date().toISOString(),
      current_price: selectedCoin.current_price || parseFloat(purchasePrice), // Fallback
    }

    const { error } = await supabase.from("user_portfolios").insert([newHolding])

    if (!error) {
      setIsAddOpen(false)
      setSelectedCoin(null)
      setQuantity("")
      setPurchasePrice("")
      setPurchaseDate("")
      setSearchQuery("")
      loadHoldings()
    }
  }

  async function deleteHolding(id: string) {
    const { error } = await supabase.from("user_portfolios").delete().eq("id", id)
    if (!error) {
      loadHoldings()
    }
  }

  // Safe Math with Decimal.js
  const totalValue = holdings.reduce((sum, h) => {
      const val = new Decimal(h.quantity).times(h.current_price || 0)
      return new Decimal(sum).plus(val).toNumber()
  }, 0)

  const totalCost = holdings.reduce((sum, h) => {
      const val = new Decimal(h.quantity).times(h.purchase_price)
      return new Decimal(sum).plus(val).toNumber()
  }, 0)

  const totalGain = new Decimal(totalValue).minus(totalCost).toNumber()
  const totalGainPercent = totalCost > 0 ? new Decimal(totalGain).div(totalCost).times(100).toNumber() : 0

  if (loading) return <div className="text-white/60 text-center font-mono py-8">INITIALIZING_SECURE_CONNECTION...</div>

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/>
                Asset_Database
            </h2>
            <p className="text-white/40 text-xs font-mono mt-1">SECURE_VAULT_ACCESS_GRANTED</p>
        </div>

        <div className="flex gap-2">
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase tracking-wider">
                <Plus className="w-4 h-4 mr-2" />
                Add_Asset
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/90 border-white/10 text-white">
                <DialogHeader>
                <DialogTitle className="font-mono uppercase tracking-widest text-red-500">Add New Asset</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                {!selectedCoin ? (
                    <>
                    <Input
                        placeholder="SEARCH_PROTOCOL..."
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
          const currentValue = new Decimal(holding.quantity).times(holding.current_price || 0).toNumber()
          const costBasis = new Decimal(holding.quantity).times(holding.purchase_price).toNumber()
          const gain = new Decimal(currentValue).minus(costBasis).toNumber()
          const gainPercent = costBasis > 0 ? new Decimal(gain).div(costBasis).times(100).toNumber() : 0

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
