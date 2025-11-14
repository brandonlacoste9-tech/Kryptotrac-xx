"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Loader2, Zap } from "lucide-react"
import { createCheckoutSession } from "@/app/actions/stripe"
import { useRouter } from "next/navigation"

interface UpgradeContainerProps {
  userEmail: string
}

export function UpgradeContainer({ userEmail }: UpgradeContainerProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const { url, error } = await createCheckoutSession("pro")

      if (error) {
        console.error("[v0] Checkout error:", error)
        alert("Failed to start checkout. Please try again.")
        return
      }

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error("[v0] Upgrade error:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const proFeatures = [
    "Unlimited price alerts",
    "Email notifications for all alerts",
    "Advanced portfolio analytics",
    "Historical performance tracking",
    "Ad-free experience",
    "Priority customer support",
    "Export portfolio data (CSV)",
    "Early access to new features",
  ]

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 md:p-12 bg-gradient-to-br from-red-950/40 to-black/40 backdrop-blur-xl border-2 border-red-500/50 rounded-2xl shadow-[0_0_80px_rgba(239,68,68,0.4)]">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/50">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              Upgrade to KryptoTrac Pro
            </h1>
            <p className="text-gray-300 text-lg">Unlock unlimited alerts and advanced analytics</p>
          </div>

          {/* Pricing */}
          <div className="text-center mb-8">
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-6xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                $9
              </span>
              <span className="text-2xl text-gray-400">/month</span>
            </div>
            <p className="text-sm text-gray-400">Cancel anytime, no questions asked</p>
          </div>

          {/* Features */}
          <div className="mb-8 space-y-3">
            {proFeatures.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-gray-200 font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/50 hover:shadow-red-500/70 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Upgrade Now
              </>
            )}
          </Button>

          <p className="text-center text-sm text-gray-400 mt-6">Billed monthly to {userEmail}</p>
        </Card>
      </div>
    </div>
  )
}
