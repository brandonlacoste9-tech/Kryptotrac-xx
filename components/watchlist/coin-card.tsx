"use client"

import { TrendingUp, TrendingDown, X, Bell } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkline } from "./sparkline"
import Link from "next/link"
import type { CoinData } from "@/types/crypto"

interface CoinCardProps {
  coin: CoinData
  onRemove: (coinId: string) => void
}

export function CoinCard({ coin, onRemove }: CoinCardProps) {
  const isPositive = coin.price_change_percentage_24h >= 0

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 w-7 h-7 opacity-0 hover:opacity-100 transition-opacity z-10"
        onClick={() => onRemove(coin.id)}
      >
        <X className="w-4 h-4" />
      </Button>

      <CardContent className="p-4">
        <Link href={`/chart/${coin.id}`} className="block space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-10 h-10" />
              <div>
                <h3 className="font-semibold">{coin.name}</h3>
                <p className="text-sm text-muted-foreground uppercase">{coin.symbol}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7"
              onClick={(e) => {
                e.preventDefault()
                // TODO: Open alert dialog
              }}
            >
              <Bell className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-1">
            <p className="text-2xl font-bold font-mono">
              $
              {coin.current_price.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: coin.current_price < 1 ? 6 : 2,
              })}
            </p>
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-primary" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <span className={`text-sm font-medium ${isPositive ? "text-primary" : "text-destructive"}`}>
                {isPositive ? "+" : ""}
                {coin.price_change_percentage_24h.toFixed(2)}%
              </span>
              <span className="text-sm text-muted-foreground">24h</span>
            </div>
          </div>

          <Sparkline data={coin.sparkline_in_7d.price} isPositive={isPositive} />
        </Link>
      </CardContent>
    </Card>
  )
}
