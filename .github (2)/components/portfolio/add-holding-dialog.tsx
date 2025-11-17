"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { searchCoins } from "@/lib/coingecko"

interface AddHoldingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onHoldingAdded: () => void
}

interface CoinSearchResult {
  id: string
  name: string
  symbol: string
  thumb: string
}

export function AddHoldingDialog({ open, onOpenChange, onHoldingAdded }: AddHoldingDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<CoinSearchResult[]>([])
  const [selectedCoin, setSelectedCoin] = useState<CoinSearchResult | null>(null)
  const [quantity, setQuantity] = useState("")
  const [purchasePrice, setPurchasePrice] = useState("") // Corrected variable declaration
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)
  const supabase = createBrowserClient()

  const handleSearch = async () => {
    if (!searchQuery) return

    setLoading(true)
    try {
      const results = await searchCoins(searchQuery)
      setSearchResults(results.slice(0, 10))
    } catch (error) {
      console.error("[v0] Error searching coins:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddHolding = async () => {
    if (!selectedCoin || !quantity || !purchasePrice) return

    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("user_portfolios").insert({
        user_id: user.id,
        coin_id: selectedCoin.id,
        coin_name: selectedCoin.name,
        coin_symbol: selectedCoin.symbol.toUpperCase(),
        coin_image: selectedCoin.thumb,
        quantity: Number.parseFloat(quantity),
        purchase_price: Number.parseFloat(purchasePrice),
        purchase_date: new Date(purchaseDate).toISOString(),
      })

      if (error) throw error

      onHoldingAdded()
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error("[v0] Error adding holding:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSearchQuery("")
    setSearchResults([])
    setSelectedCoin(null)
    setQuantity("")
    setPurchasePrice("") // Corrected variable usage
    setPurchaseDate(new Date().toISOString().split("T")[0])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-2xl">
        <DialogHeader>
          <DialogTitle className="neon-text-white">Add New Holding</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedCoin ? (
            <>
              <div className="space-y-2">
                <Label>Search Cryptocurrency</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Bitcoin, Ethereum..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="bg-black/40 border-white/20"
                  />
                  <Button onClick={handleSearch} disabled={loading}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((coin) => (
                    <button
                      key={coin.id}
                      onClick={() => setSelectedCoin(coin)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-black/40 border border-white/10 hover:border-white/30 transition-all"
                    >
                      <img src={coin.thumb || "/placeholder.svg"} alt={coin.name} className="w-8 h-8" />
                      <div className="text-left">
                        <div className="font-semibold">{coin.name}</div>
                        <div className="text-sm text-muted-foreground">{coin.symbol.toUpperCase()}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-black/40 border border-white/20">
                <img src={selectedCoin.thumb || "/placeholder.svg"} alt={selectedCoin.name} className="w-10 h-10" />
                <div>
                  <div className="font-semibold">{selectedCoin.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedCoin.symbol.toUpperCase()}</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedCoin(null)} className="ml-auto">
                  Change
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="bg-black/40 border-white/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Purchase Price (USD)</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="bg-black/40 border-white/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Purchase Date</Label>
                <Input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="bg-black/40 border-white/20"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleAddHolding}
                  disabled={loading || !quantity || !purchasePrice}
                  className="flex-1 bg-primary hover:bg-primary/80"
                >
                  Add Holding
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
