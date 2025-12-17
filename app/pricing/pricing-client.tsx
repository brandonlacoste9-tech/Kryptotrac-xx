"use client"

import { useState } from "react"
import { Check, Zap, Shield, CreditCard, Star, TrendingUp, Bell, Bot, BarChart3, Download } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function PricingClient() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  const tiers = {
    free: {
      name: "Free",
      price: { monthly: 0, yearly: 0 },
      description: "Perfect for getting started",
      cta: "Start Free",
      features: [
        "Track up to 5 coins",
        "3 price alerts",
        "1 DeFi wallet",
        "20 BB AI queries per day",
        "Basic portfolio dashboard",
        "Real-time price updates",
        "Community support",
      ],
    },
    pro: {
      name: "Pro",
      price: { monthly: 12, yearly: 120 },
      description: "Best Value - Everything Unlimited",
      popular: true,
      cta: "Upgrade to Pro",
      features: [
        "Unlimited coins & price alerts",
        "10 DeFi wallets tracked",
        "Unlimited BB AI queries",
        "Council Mode (multi-AI perspectives)",
        "AI-generated insights (daily/weekly)",
        "Email digests & notifications",
        "Full analytics dashboard",
        "Portfolio snapshots & history",
        "Export data (CSV, PDF)",
        "Priority support (24h response)",
        "Ad-free experience",
        "Early access to new features",
      ],
    },
  }

  const getPrice = (tier: keyof typeof tiers) => {
    return billingCycle === "yearly"
      ? Math.floor(tiers[tier].price.yearly / 12)
      : tiers[tier].price.monthly
  }

  const getSavings = (tier: keyof typeof tiers) => {
    if (billingCycle === "monthly" || tier === "free") return null
    const monthlyCost = tiers[tier].price.monthly * 12
    const yearlyCost = tiers[tier].price.yearly
    return monthlyCost - yearlyCost
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4 fill-emerald-400" />
            60% cheaper than competitors • No credit card required
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
            Simple Pricing. Powerful Features.
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Get AI-powered crypto insights without the enterprise pricing.
            <br />
            <span className="text-white font-semibold">Start free, upgrade when you're ready.</span>
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-full font-medium transition-all ${billingCycle === "monthly"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white"
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${billingCycle === "yearly"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white"
                }`}
            >
              Yearly
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                Save $24/year
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {Object.entries(tiers).map(([key, tier]) => {
            const tierKey = key as keyof typeof tiers
            const price = getPrice(tierKey)
            const savings = getSavings(tierKey)

            return (
              <Card
                key={key}
                className={`relative p-8 backdrop-blur-xl rounded-2xl transition-all ${tier.popular
                    ? "bg-gradient-to-br from-red-950/40 to-black/40 border-2 border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.3)] hover:shadow-[0_0_80px_rgba(239,68,68,0.5)] scale-105"
                    : "bg-black/40 border border-white/10 hover:border-white/20"
                  }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 shadow-lg">
                      <Zap className="w-4 h-4" />
                      {tier.description}
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-3">{tier.name}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-bold text-white">
                      ${price}
                    </span>
                    {tierKey !== "free" && (
                      <span className="text-gray-400 text-lg">/month</span>
                    )}
                  </div>
                  {savings && (
                    <p className="text-sm text-emerald-400 font-medium">
                      💰 Save ${savings} per year
                    </p>
                  )}
                  {tierKey === "free" && (
                    <p className="text-sm text-gray-400">Forever free, no card required</p>
                  )}
                  {billingCycle === "yearly" && tierKey === "pro" && (
                    <p className="text-sm text-gray-300 mt-1">
                      Billed ${tiers.pro.price.yearly} annually
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 min-h-[420px]">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${tier.popular ? "text-red-500" : "text-emerald-500"
                          }`}
                      />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full py-6 text-lg font-semibold ${tier.popular
                      ? "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/50 hover:shadow-red-500/70"
                      : "bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30"
                    }`}
                  asChild
                >
                  <Link href={tierKey === "free" ? "/auth/signup" : `/auth/signup?plan=pro&cycle=${billingCycle}`}>
                    {tier.cta}
                  </Link>
                </Button>
              </Card>
            )
          })}
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center items-center gap-8 mb-16 text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span>Trusted by 10,000+ crypto traders</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-500" />
            <span>Bank-level encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-500" />
            <span>Cancel anytime, no questions asked</span>
          </div>
        </div>

        {/* Competitive Comparison */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">
            Why KryptoTrac Beats The Competition
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10">
              <Bot className="w-10 h-10 text-red-500 mb-4" />
              <h3 className="font-bold text-white mb-2">AI-Powered Insights</h3>
              <p className="text-gray-400 text-sm">
                BB AI gives you daily insights competitors charge $49/mo for. Ours is included at $12/mo.
              </p>
            </Card>
            <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10">
              <TrendingUp className="w-10 h-10 text-emerald-500 mb-4" />
              <h3 className="font-bold text-white mb-2">DeFi Tracking</h3>
              <p className="text-gray-400 text-sm">
                Track Aave, Uniswap, Lido positions. Others charge $99/mo for this.
              </p>
            </Card>
            <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10">
              <BarChart3 className="w-10 h-10 text-blue-500 mb-4" />
              <h3 className="font-bold text-white mb-2">Full Analytics</h3>
              <p className="text-gray-400 text-sm">
                Portfolio snapshots, P&L tracking, export data. Usually $29/mo elsewhere.
              </p>
            </Card>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 text-white">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10">
              <h3 className="font-semibold text-white mb-2">Can I switch between monthly and yearly billing?</h3>
              <p className="text-gray-400">
                Yes! Upgrade to yearly anytime to save $24/year. You'll be credited for time left on your monthly plan.
              </p>
            </Card>
            <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10">
              <h3 className="font-semibold text-white mb-2">What happens if I downgrade from Pro to Free?</h3>
              <p className="text-gray-400">
                Your data is never deleted. You'll keep access to unlimited coins/alerts through the end of your billing period, then revert to Free limits.
              </p>
            </Card>
            <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10">
              <h3 className="font-semibold text-white mb-2">Do you offer refunds?</h3>
              <p className="text-gray-400">
                Yes! We offer a 14-day money-back guarantee. If you're not satisfied, email us for a full refund, no questions asked.
              </p>
            </Card>
            <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10">
              <h3 className="font-semibold text-white mb-2">Is my data secure with KryptoTrac?</h3>
              <p className="text-gray-400">
                Absolutely. We use bank-level encryption (AES-256), never store exchange API keys with write access, and never see your private keys. Your portfolio data is stored securely via Supabase with Row Level Security.
              </p>
            </Card>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-20 text-center">
          <div className="inline-block bg-gradient-to-br from-red-950/40 to-black/40 border-2 border-red-500/50 rounded-2xl p-8 backdrop-blur-xl">
            <h3 className="text-2xl font-bold text-white mb-3">Ready to track smarter?</h3>
            <p className="text-gray-300 mb-6">Join 10,000+ traders using KryptoTrac</p>
            <div className="flex gap-4 justify-center">
              <Button
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                asChild
              >
                <Link href="/auth/signup">Start Free</Link>
              </Button>
              <Button
                className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/50"
                asChild
              >
                <Link href="/auth/signup?plan=pro">Go Pro - $12/month</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
