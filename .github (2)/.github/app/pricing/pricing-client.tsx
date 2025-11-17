"use client"

import { useState } from "react"
import { Check, Zap, Shield, CreditCard, Star } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function PricingClient() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  const tiers = {
    free: {
      name: "Free",
      price: { monthly: 0, yearly: 0 },
      description: "No card required",
      tagline: "Perfect for getting started",
      cta: "Start Free",
      ctaVariant: "outline" as const,
      features: [
        "Track up to 5 coins",
        "3 price alerts",
        "Basic market dashboard",
        "Real-time price updates",
        "Community support",
      ],
    },
    starter: {
      name: "Starter",
      price: { monthly: 5, yearly: 50 },
      description: "Perfect for new traders",
      tagline: "Perfect for new traders looking for smarter alerts",
      cta: "Unlock Starter",
      ctaVariant: "default" as const,
      features: [
        "Track 10 coins",
        "10 price alerts",
        "Portfolio tracking",
        "Email notifications",
        "Priority updates",
        "7-day price history",
      ],
    },
    pro: {
      name: "Pro",
      price: { monthly: 9, yearly: 90 },
      description: "Most popular",
      tagline: "Most popular — smarter AI alerts and full analytics",
      cta: "Go Pro",
      ctaVariant: "pro" as const,
      popular: true,
      features: [
        "Everything in Free",
        "Unlimited coins & alerts",
        "AI-generated insights",
        "Full portfolio analytics",
        "Historical performance",
        "Priority support",
        "Ad-free experience",
        "Export portfolio data",
      ],
    },
    elite: {
      name: "Elite",
      price: { monthly: 19, yearly: 190 },
      description: "For serious traders",
      tagline: "For serious traders who want real alpha",
      cta: "Upgrade to Elite",
      ctaVariant: "elite" as const,
      features: [
        "Everything in Pro",
        "Auto wallet import",
        "Tax-ready reports",
        "Whale tracking",
        "Real-time signals",
        "API access",
        "Dedicated support",
        "Early feature access",
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
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4" />
            Start for free • No credit card required • Takes 10 seconds
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Kryptotrac gives you real crypto intelligence WITHOUT forcing you to pay first
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                billingCycle === "yearly"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Yearly
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                Save 2 months
              </span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-16">
          {Object.entries(tiers).map(([key, tier]) => {
            const tierKey = key as keyof typeof tiers
            const price = getPrice(tierKey)
            const savings = getSavings(tierKey)

            return (
              <Card
                key={key}
                className={`relative p-6 backdrop-blur-xl rounded-2xl transition-all ${
                  tier.popular
                    ? "bg-gradient-to-br from-red-950/40 to-black/40 border-2 border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.3)] hover:shadow-[0_0_80px_rgba(239,68,68,0.5)] scale-105 lg:scale-110"
                    : "bg-black/40 border border-white/10 hover:border-white/20"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                      <Zap className="w-4 h-4" />
                      {tier.description}
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold text-white">
                      ${price}
                    </span>
                    {tierKey !== "free" && (
                      <span className="text-gray-400">/mo</span>
                    )}
                  </div>
                  {savings && (
                    <p className="text-sm text-emerald-400">
                      Save ${savings}/year
                    </p>
                  )}
                  {!savings && tierKey !== "free" && (
                    <p className="text-sm text-gray-400 h-5">&nbsp;</p>
                  )}
                  {tierKey === "free" && (
                    <p className="text-sm text-gray-400 h-5">Forever free</p>
                  )}
                  <p className="text-gray-400 text-sm mt-2">{tier.tagline}</p>
                </div>

                <ul className="space-y-3 mb-6 min-h-[240px]">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          tier.popular ? "text-red-500" : "text-emerald-500"
                        }`}
                      />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    tier.popular
                      ? "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-semibold shadow-lg shadow-red-500/50"
                      : tierKey === "free"
                      ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  }`}
                  asChild
                >
                  <Link href={tierKey === "free" ? "/auth/signup" : `/auth/signup?plan=${tierKey}`}>
                    {tier.cta}
                  </Link>
                </Button>
              </Card>
            )
          })}
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 mb-16 text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span>4.8/5 Based on 500+ users</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-500" />
            <span>Secure payments powered by Stripe</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-500" />
            <span>Cancel anytime</span>
          </div>
        </div>

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
