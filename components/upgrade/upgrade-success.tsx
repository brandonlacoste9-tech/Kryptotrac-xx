"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Sparkles, Zap, TrendingUp } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import confetti from "canvas-confetti"

export function UpgradeSuccess() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
    // Trigger confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
  }, [])

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 space-y-6 bg-gradient-to-br from-neutral-900 to-neutral-950 border-red-500/20 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-center">
          <div className="rounded-full bg-gradient-to-br from-red-500 to-orange-500 p-4 animate-pulse">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Welcome to Pro!
          </h2>
          <p className="text-neutral-400">
            You've unlocked the full power of KryptoTrac. Here's what you can now do:
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-800/50">
            <Sparkles className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <div className="font-semibold">Unlimited Price Alerts</div>
              <div className="text-sm text-neutral-400">Set alerts for any price movement</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-800/50">
            <Zap className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <div className="font-semibold">AI-Powered Insights</div>
              <div className="text-sm text-neutral-400">Get personalized portfolio recommendations</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-800/50">
            <TrendingUp className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <div className="font-semibold">Advanced Analytics</div>
              <div className="text-sm text-neutral-400">Track performance with Sharpe ratios and more</div>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-neutral-500">
          Cancel anytime. If you downgrade, your data stays safe and you keep access to Free tier features.
        </div>

        <div className="space-y-2">
          <Button asChild className="w-full" size="lg">
            <Link href="/dashboard">Explore Pro Features</Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setShow(false)}
          >
            Close
          </Button>
        </div>
      </Card>
    </div>
  )
}
