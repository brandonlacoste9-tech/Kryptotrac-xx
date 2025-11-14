"use client"

import { useState } from "react"
import { Share2, Download, Copy, Check } from "lucide-react"
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
    coinId: string
    symbol: string
    quantity: number
    currentPrice: number
    profitLoss: number
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

  const handleShare = async () => {
    setGenerating(true)
    try {
      const response = await fetch("/api/share/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalValue,
          totalProfitLoss,
          profitLossPercentage,
          topHoldings: topHoldings.slice(0, 3),
          isPro,
        }),
      })

      const { imageUrl } = await response.json()

      // Copy to clipboard
      await navigator.clipboard.writeText(`Check out my crypto portfolio on KryptoTrac! 📈\n${imageUrl}`)

      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (error) {
      console.error("[v0] Failed to generate share card:", error)
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = async () => {
    setGenerating(true)
    try {
      const response = await fetch("/api/share/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalValue,
          totalProfitLoss,
          profitLossPercentage,
          topHoldings: topHoldings.slice(0, 3),
          isPro,
        }),
      })

      const { imageUrl } = await response.json()

      // Download image
      const link = document.createElement("a")
      link.href = imageUrl
      link.download = "kryptotrac-portfolio.png"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("[v0] Failed to download share card:", error)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Share2 className="h-4 w-4" />
          Share Portfolio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-black/95 border-red-500/20">
        <DialogHeader>
          <DialogTitle className="text-white">Share Your Portfolio</DialogTitle>
          <DialogDescription className="text-gray-400">
            Generate a shareable card showcasing your portfolio performance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="relative overflow-hidden rounded-lg border border-red-500/20 bg-gradient-to-br from-red-950/20 to-black p-6">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMCwwLDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />

            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-white">
                    ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className={`text-sm font-medium ${totalProfitLoss >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {totalProfitLoss >= 0 ? "+" : ""}$
                    {Math.abs(totalProfitLoss).toLocaleString("en-US", { minimumFractionDigits: 2 })}(
                    {totalProfitLoss >= 0 ? "+" : ""}
                    {profitLossPercentage.toFixed(2)}%)
                  </p>
                </div>
                {isPro && (
                  <span className="rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-3 py-1 text-xs font-bold text-white">
                    PRO
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {topHoldings.slice(0, 3).map((holding) => (
                  <div key={holding.coinId} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{holding.symbol.toUpperCase()}</span>
                    <span className={holding.profitLoss >= 0 ? "text-emerald-400" : "text-red-400"}>
                      {holding.profitLoss >= 0 ? "+" : ""}$
                      {Math.abs(holding.profitLoss).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-red-500/20">
                <p className="text-xs text-gray-500 text-center">Powered by KryptoTrac {isPro ? "Pro" : ""}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleShare} disabled={generating} className="flex-1 bg-red-600 hover:bg-red-700">
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>
            <Button onClick={handleDownload} disabled={generating} variant="outline" className="flex-1 bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
