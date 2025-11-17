"use client"

import { useState } from "react"
import { Share2, Copy, Check, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"

interface AnalyticsShareCardProps {
  sharpeRatio: number
  volatility: number
  riskScore: number
  diversificationScore: number
  isPro: boolean
}

export function AnalyticsShareCard({
  sharpeRatio,
  volatility,
  riskScore,
  diversificationScore,
  isPro,
}: AnalyticsShareCardProps) {
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)

  if (!isPro) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Lock className="h-4 w-4" />
            Share Analytics
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-black/95 border-red-500/20">
          <DialogHeader>
            <DialogTitle className="text-white">Pro Feature</DialogTitle>
            <DialogDescription className="text-gray-400">
              Upgrade to KryptoTrac Pro to share your analytics
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-red-500/20 bg-red-950/20 p-4">
              <p className="text-sm text-gray-300">
                Share your portfolio analytics including Sharpe ratio, risk score, and diversification metrics with Pro.
              </p>
            </div>
            <Link href="/upgrade">
              <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const handleShare = async () => {
    setGenerating(true)
    try {
      const response = await fetch("/api/share/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sharpeRatio,
          volatility,
          riskScore,
          diversificationScore,
        }),
      })

      const { imageUrl } = await response.json()

      await navigator.clipboard.writeText(`Check out my portfolio analytics on KryptoTrac Pro! 📊\n${imageUrl}`)

      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (error) {
      console.error("[v0] Failed to generate share card:", error)
    } finally {
      setGenerating(false)
    }
  }

  const getRiskColor = (score: number) => {
    if (score <= 3) return "text-emerald-400"
    if (score <= 6) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Share2 className="h-4 w-4" />
          Share Analytics
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-black/95 border-red-500/20">
        <DialogHeader>
          <DialogTitle className="text-white">Share Your Analytics</DialogTitle>
          <DialogDescription className="text-gray-400">
            Generate a shareable card showcasing your portfolio metrics
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="relative overflow-hidden rounded-lg border border-red-500/20 bg-gradient-to-br from-red-950/20 to-black p-6">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMCwwLDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />

            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Portfolio Analytics</h3>
                <span className="rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-3 py-1 text-xs font-bold text-white">
                  PRO
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Sharpe Ratio</p>
                  <p className="text-2xl font-bold text-white">{sharpeRatio.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Risk Score</p>
                  <p className={`text-2xl font-bold ${getRiskColor(riskScore)}`}>{riskScore.toFixed(1)}/10</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Volatility</p>
                  <p className="text-2xl font-bold text-white">{volatility.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Diversification</p>
                  <p className="text-2xl font-bold text-white">{diversificationScore.toFixed(1)}/10</p>
                </div>
              </div>

              <div className="pt-4 border-t border-red-500/20">
                <p className="text-xs text-gray-500 text-center">Powered by KryptoTrac Pro</p>
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
