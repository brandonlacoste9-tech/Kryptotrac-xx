"use client"

import { Check } from "lucide-react"

export function WhySection() {
  const reasons = [
    "Built for speed, not spreadsheets.",
    "Everything important on one screen.",
    "Affordable enough for everyone to be in the game.",
  ]

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">
          Why Kryptotrac
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <div key={index} className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600/20 to-red-500/20 border border-red-500/30 flex items-center justify-center">
                <Check className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-gray-300 text-lg font-medium">
                {reason}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
