"use client"

import { MapPin } from 'lucide-react'
import { Card } from "@/components/ui/card"

export function CanadianNotice() {
  return (
    <Card className="bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/20 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-red-500/20 p-2 mt-0.5">
          <MapPin className="h-4 w-4 text-red-400" />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="font-semibold text-sm">Built for Canadian Crypto Investors</h3>
          <p className="text-sm text-neutral-400">
            All prices shown in CAD. Tax season coming? Export your capital gains with one click.
            We support Canadian-friendly exchanges like Kraken, NDAX, and Coinsquare.
          </p>
        </div>
      </div>
    </Card>
  )
}
