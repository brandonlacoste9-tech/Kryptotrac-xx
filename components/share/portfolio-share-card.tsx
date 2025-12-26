"use client"

import { useState } from "react"
import { Share2, Download, Copy, Check, Upload, Zap } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface PortfolioShareCardProps {
  totalValue: number
  totalProfitLoss: number
  profitLossPercentage: number
  topHoldings: Array<{
    coin_id: string
    coin_symbol: string
    quantity: number
    current_price: number
    // We calculate profit loss dynamically if not provided, basically we just need enough data
    purchase_price?: number
  }>
  isPro: boolean
}

export function PortfolioShareCard({
  totalValue,
  totalProfitLoss,
  profitLossPercentage,
  topHoldings,
  isPro,
}: PortfolioShareCardProps) {
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Mock share function since we don't have the backend route fully verified for image gen yet
  // but we will keep the structure.
  const handleShare = async () => {
    setGenerating(true)
    // Simulate delay
    setTimeout(() => {
        navigator.clipboard.writeText(
            `MY_RIG_STATS:\n\nValue: $${totalValue.toFixed(2)}\nPnL: ${totalProfitLoss >= 0 ? '+' : ''}${totalProfitLoss.toFixed(2)} (${profitLossPercentage.toFixed(2)}%)\n\nTracked via KryptoTrac`
        )
        setCopied(true)
        setGenerating(false)
        setTimeout(() => setCopied(false), 3000)
    }, 1000)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 font-mono tracking-wider">
          <Share2 className="h-4 w-4" />
          SHARE_RIG
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-black/95 border-cyan-500/30 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-cyan-400 font-mono flex items-center gap-2">
            <Zap className="w-4 h-4" />
            GENERATE_FLEX_CARD
          </DialogTitle>
          <DialogDescription className="text-gray-400 font-mono text-xs">
            Export your portfolio telemetry for social transmission.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Card Preview */}
          <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-black p-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] group">
            {/* Holographic effect overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(6,182,212,0.1)_50%,transparent_75%)] bg-[length:200%_100%] animate-shimmer pointer-events-none" />
            
            {/* Scanlines */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEiIGZpbGw9InJnYmEoNiwgMTgyLCAyMTIsIDAuMDUpIi8+PC9zdmc+')] pointer-events-none z-0" />

            <div className="relative z-10 space-y-6">
                {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-3xl font-bold text-white font-mono tracking-tighter">
                    ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <div className={`flex items-center gap-2 font-mono text-sm ${totalProfitLoss >= 0 ? "text-cyan-400" : "text-pink-500"}`}>
                    <span>{totalProfitLoss >= 0 ? "▲" : "▼"}</span>
                    <span>
                        {totalProfitLoss >= 0 ? "+" : ""}$
                        {Math.abs(totalProfitLoss).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="opacity-50">|</span>
                    <span>
                        {totalProfitLoss >= 0 ? "+" : ""}
                        {profitLossPercentage.toFixed(2)}%
                    </span>
                  </div>
                </div>
                {isPro ? (
                  <div className="text-right">
                    <div className="bg-cyan-500/20 border border-cyan-500/50 px-2 py-0.5 rounded text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                        PRO_FIRMWARE
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1 font-mono">ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
                  </div>
                ) : (
                    <div className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-white/50 uppercase tracking-widest">
                        CORE_OS
                    </div>
                )}
              </div>

              {/* Holdings - Simplified for Card */}
              <div className="space-y-3">
                <div className="text-[10px] uppercase text-muted-foreground font-mono tracking-widest mb-2">Top Assets</div>
                {topHoldings.slice(0, 3).map((holding) => {
                    const value = holding.quantity * holding.current_price;
                    return (
                        <div key={holding.coin_id} className="flex items-center justify-between text-sm font-mono border-b border-dashed border-white/10 pb-2 last:border-0">
                            <span className="text-white font-bold">{holding.coin_symbol.toUpperCase()}</span>
                            <span className="text-gray-400 flex items-center gap-2">
                                <span className="text-[10px] opacity-50">{holding.quantity.toFixed(4)}</span>
                                <span className={value > 0 ? "text-white" : "text-gray-500"}>
                                    ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                            </span>
                        </div>
                    )
                })}
              </div>

              {/* Footer */}
              <div className="pt-2 flex justify-between items-end">
                <div className="text-[10px] text-gray-500 font-mono">
                    <span className="text-cyan-500">■</span> SECURE_TRANSMISSION
                </div>
                <div className="text-right">
                    <div className="text-xs font-bold italic text-white/40">KryptoTrac</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleShare} disabled={generating} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold font-mono">
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  COPIED_TO_CLIPBOARD
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  COPY_DATA_STREAM
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
