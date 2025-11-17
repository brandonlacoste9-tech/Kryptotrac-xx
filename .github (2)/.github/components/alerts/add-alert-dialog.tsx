"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { searchCoins } from "@/lib/coingecko"
import { createBrowserClient } from "@/lib/supabase/client"
import { Loader2 } from 'lucide-react'

type SearchResult = {
  id: string
  name: string
  symbol: string
}

export function AddAlertDialog({
  open,
  onOpenChange,
  userId,
  onAlertAdded,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onAlertAdded: () => void
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedCoin, setSelectedCoin] = useState<SearchResult | null>(null)
  const [threshold, setThreshold] = useState("")
  const [condition, setCondition] = useState<"above" | "below">("above")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const supabase = createBrowserClient()

  async function handleSearch(query: string) {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      const results = await searchCoins(query)
      setSearchResults(results.slice(0, 10))
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCoin || !threshold) return

    setSaving(true)
    try {
      await supabase.from("price_alerts").insert({
        user_id: userId,
        coin_id: selectedCoin.id,
        coin_name: selectedCoin.name,
        coin_symbol: selectedCoin.symbol,
        target_price: Number.parseFloat(threshold),
        condition,
        is_triggered: false,
      })

      onAlertAdded()
      onOpenChange(false)
      setSearchQuery("")
      setSearchResults([])
      setSelectedCoin(null)
      setThreshold("")
    } catch (error) {
      console.error("Failed to create alert:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border border-white/10">
        <DialogHeader>
          <DialogTitle className="neon-text-white">Create Price Alert</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Search Cryptocurrency</Label>
            <Input
              placeholder="Search for a coin..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-white/5 border-white/10"
            />

            {loading && (
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="glass-card p-2 space-y-1 max-h-48 overflow-y-auto">
                {searchResults.map((coin) => (
                  <button
                    key={coin.id}
                    type="button"
                    onClick={() => {
                      setSelectedCoin(coin)
                      setSearchResults([])
                      setSearchQuery(coin.name)
                    }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-white/5 transition-colors"
                  >
                    <div className="font-medium">{coin.name}</div>
                    <div className="text-sm text-white/60">{coin.symbol.toUpperCase()}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedCoin && (
            <>
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select value={condition} onValueChange={(val) => setCondition(val as "above" | "below")}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Price goes above</SelectItem>
                    <SelectItem value="below">Price goes below</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Price (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="bg-white/5 border-white/10"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={saving || !threshold}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Alert"
                )}
              </Button>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
