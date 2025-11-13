"use client"

import { Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddCoinDialog } from "./add-coin-dialog"
import { useState } from "react"

interface WatchlistHeaderProps {
  onAddCoin: (coinId: string) => void
  lastUpdated: Date | null
  onRefresh: () => void
  isRefreshing: boolean
}

export function WatchlistHeader({ onAddCoin, lastUpdated, onRefresh, isRefreshing }: WatchlistHeaderProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleAddCoin = (coinId: string) => {
    onAddCoin(coinId)
    setDialogOpen(false)
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">My Watchlist</h2>
        {lastUpdated && (
          <p className="text-sm text-muted-foreground mt-1">Last updated: {lastUpdated.toLocaleTimeString()}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onRefresh} disabled={isRefreshing}>
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Coin
        </Button>
      </div>

      <AddCoinDialog open={dialogOpen} onOpenChange={setDialogOpen} onAddCoin={handleAddCoin} />
    </div>
  )
}
