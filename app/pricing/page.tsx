import type { Metadata } from "next"
import { Check, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "KryptoTrac Pro - Pricing",
  description: "Upgrade to KryptoTrac Pro for unlimited alerts and advanced analytics",
}

export default async function PricingPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const features = {
    free: [
      "Track unlimited coins",
      "Real-time price updates",
      "Basic portfolio tracking",
      "Up to 5 price alerts",
      "7-day price charts",
      "Market overview dashboard",
    ],
    pro: [
      "Everything in Free",
      "Unlimited price alerts",
      "Email alert notifications",
      "Advanced portfolio analytics",
      "Historical performance tracking",
      "Priority support",
      "Ad-free experience",
      "Export portfolio data",
    ],
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-gray-400 text-lg">Start free, upgrade when you need more power</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <Card className="relative p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-white/20 transition-all">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-bold text-white">$0</span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="text-gray-400">Perfect for getting started with crypto tracking</p>
            </div>

            <ul className="space-y-4 mb-8">
              {features.free.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20" asChild>
              <Link href={user ? "/portfolio" : "/auth/signup"}>{user ? "Current Plan" : "Get Started Free"}</Link>
            </Button>
          </Card>

          {/* Pro Tier */}
          <Card className="relative p-8 bg-gradient-to-br from-red-950/40 to-black/40 backdrop-blur-xl border-2 border-red-500/50 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.3)] hover:shadow-[0_0_80px_rgba(239,68,68,0.5)] transition-all">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                <Zap className="w-4 h-4" />
                Most Popular
              </div>
            </div>

            <div className="mb-6 mt-2">
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                  $9
                </span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="text-gray-300">For serious crypto investors who need advanced tools</p>
            </div>

            <ul className="space-y-4 mb-8">
              {features.pro.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-200 font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-semibold shadow-lg shadow-red-500/50 hover:shadow-red-500/70 transition-all"
              asChild
            >
              <Link href={user ? "/upgrade" : "/auth/signup?plan=pro"}>
                {user ? "Upgrade to Pro" : "Start Pro Trial"}
              </Link>
            </Button>

            <p className="text-center text-sm text-gray-400 mt-4">Cancel anytime. No questions asked.</p>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 text-white">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10">
              <h3 className="font-semibold text-white mb-2">Can I switch plans anytime?</h3>
              <p className="text-gray-400">
                Yes! Upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </Card>
            <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10">
              <h3 className="font-semibold text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400">
                We accept all major credit cards, debit cards, and digital payment methods through Stripe.
              </p>
            </Card>
            <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10">
              <h3 className="font-semibold text-white mb-2">Is my data secure?</h3>
              <p className="text-gray-400">
                Absolutely. We use bank-level encryption and never store your exchange API keys or private keys.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
