"use client"

import { TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface EmptyWatchlistProps {
  onAddCoin: (coinId: string) => void
}

const POPULAR_COINS = ["bitcoin", "ethereum", "binancecoin", "solana", "cardano", "ripple"]

export function EmptyWatchlist({ onAddCoin }: EmptyWatchlistProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-12 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <TrendingUp className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Start tracking crypto</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Add cryptocurrencies to your watchlist to track prices, charts, and set price alerts.
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {POPULAR_COINS.map((coinId) => (
            <Button key={coinId} variant="outline" size="sm" onClick={() => onAddCoin(coinId)} className="capitalize">
              Add {coinId.replace("binancecoin", "BNB").replace("ripple", "XRP")}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
