"use client"

import { Globe } from 'lucide-react'
import { Card } from "@/components/ui/card"

export function GlobalNotice() {
  return (
    <Card className="bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/20 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-red-500/20 p-2 mt-0.5">
          <Globe className="h-4 w-4 text-red-400" />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="font-semibold text-sm">Built for Crypto Investors Worldwide</h3>
          <p className="text-sm text-neutral-400">
            Multi-currency support with USD, EUR, CAD, and more. Export your portfolio for tax reporting with one click.
            We support major exchanges globally including Binance, Coinbase, Kraken, and OKX.
          </p>
        </div>
      </div>
    </Card>
  )
}

// Keep the old export for backward compatibility but use the new name
export { GlobalNotice as CanadianNotice }
