import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Welcome to Pro - KryptoTrac",
  description: "Your upgrade to KryptoTrac Pro is complete",
}

export default function UpgradeSuccessPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 md:p-12 bg-gradient-to-br from-red-950/40 to-black/40 backdrop-blur-xl border-2 border-red-500/50 rounded-2xl shadow-[0_0_80px_rgba(239,68,68,0.4)]">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3 text-white">Welcome to KryptoTrac Pro!</h1>
            <p className="text-gray-300 text-lg">Your upgrade is complete. All Pro features are now unlocked.</p>
          </div>

          {/* Pro Features Unlocked */}
          <div className="mb-8 p-6 bg-black/40 rounded-xl border border-red-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-semibold text-white">What's Unlocked</h2>
            </div>
            <ul className="space-y-2 text-gray-300">
              <li>✅ Unlimited price alerts with email notifications</li>
              <li>✅ Advanced portfolio analytics and tracking</li>
              <li>✅ Ad-free experience across the platform</li>
              <li>✅ Priority customer support</li>
              <li>✅ Early access to new features</li>
            </ul>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Button
              asChild
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/50"
            >
              <Link href="/portfolio">Go to Portfolio</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full h-12 text-base font-medium border-white/20 hover:bg-white/10 text-white bg-transparent"
            >
              <Link href="/alerts">Create Your First Alert</Link>
            </Button>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            Need help? Check your email for a receipt and getting started guide.
          </p>
        </Card>
      </div>
    </div>
  )
}
