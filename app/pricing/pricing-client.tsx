"use client"

import { useState, useEffect } from "react"
import { Check, Star, Zap, Bot, BarChart3, TrendingUp, Shield, CreditCard, Lock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { HardwareContainer } from "@/components/shared/hardware-container"
import { Badge } from "@/components/ui/badge"
import { trackEvent } from "@/lib/analytics"

export default function PricingClient() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  useEffect(() => {
    trackEvent("upgrade_view", { 
        source: document.referrer, 
        timestamp: new Date().toISOString() 
    })
  }, [])

  const tiers = {
    free: {
      name: "CORE_OS",
      price: { monthly: 0, yearly: 0 },
      description: "Essential Telemetry",
      cta: "INITIALIZE SYSTEM",
      features: [
        "Track 5 Assets",
        "3 Signal Alerts",
        "1 DeFi Protocol",
        "20 AI Queries/Day",
        "Basic Telemetry",
        "Community Comms",
      ],
    },
    pro: {
      name: "PRO_FIRMWARE",
      price: { monthly: 4.99, yearly: 49.99 },
      description: "Unrestricted Hardware Access",
      popular: true,
      cta: "INSTALL UPGRADE",
      features: [
        "Unlimited Asset Tracking",
        "Unlimited DeFi Protocols",
        "Unlimited AI Neural Net",
        "Council Mode (Multi-Agent)",
        "Deep Chain Analysis",
        "Priority Support Channel",
        "Ad-Blocker Enabled",
        "Early Beta Access",
      ],
    },
  }

  const getPrice = (tier: keyof typeof tiers) => {
    return billingCycle === "yearly"
      ? (tiers[tier].price.yearly / 12).toFixed(2)
      : tiers[tier].price.monthly
  }

  const handleTierSelect = (tierKey: string) => {
    trackEvent("begin_checkout", {
        tier: tierKey,
        billing_cycle: billingCycle,
        price: tierKey === 'pro' ? getPrice('pro') : 0
    })
  }

  return (
    <HardwareContainer>
      <div className="space-y-8 pb-20">
        
        {/* Header */}
        <div className="text-center space-y-4 pt-10">
          <Badge variant="outline" className="text-cyan-400 border-cyan-500/50 bg-cyan-500/10 animate-pulse font-mono tracking-widest">
            <Zap className="w-3 h-3 mr-1" />
            SYSTEM UPDATE AVAILABLE
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white glitch-text" data-text="SELECT CONFIGURATION">
            SELECT CONFIGURATION
          </h1>
          <p className="text-gray-400 font-mono text-sm max-w-md mx-auto">
            Upgrade your KryptoTrac firmware for maximum performance and AI throughput.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 p-1 rounded-full border border-white/10 bg-black/40 backdrop-blur glass-panel">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all ${
                billingCycle === "monthly" ? "bg-cyan-500 text-black font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)]" : "text-gray-400 hover:text-white"
              }`}
            >
              MONTHLY
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-2 ${
                billingCycle === "yearly" ? "bg-cyan-500 text-black font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)]" : "text-gray-400 hover:text-white"
              }`}
            >
              YEARLY
              <span className="text-[10px] bg-black/30 text-white px-1.5 py-0.5 rounded ml-1 border border-white/10">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {Object.entries(tiers).map(([key, tier]) => {
            const tierKey = key as keyof typeof tiers
            const price = getPrice(tierKey)
            
            return (
              <Card 
                key={key}
                className={`relative p-8 overflow-hidden flex flex-col group transition-all duration-500 ${
                  tier.popular 
                    ? "bg-black/80 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.15)] hover:shadow-[0_0_80px_rgba(6,182,212,0.25)] scale-105 z-10 block ring-1 ring-cyan-400/30" 
                    : "bg-black/40 border-white/10 hover:border-white/30 hover:bg-black/60 scale-100 z-0 border-dashed"
                }`}
              >
                {/* Visual Effects Layer */}
                {tier.popular ? (
                    <>
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEiIGZpbGw9InJnYmEoNiwgMTgyLCAyMTIsIDAuMSkiLz48L3N2Zz4=')] opacity-30 pointer-events-none" />
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/20 blur-[60px] rounded-full pointer-events-none group-hover:bg-cyan-400/30 transition-all duration-500" />
                        <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[10px] font-bold px-4 py-1.5 rounded-bl-xl font-mono flex items-center gap-1 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                        <Star className="w-3 h-3 fill-current animate-pulse" />
                        RECOMMENDED_BUILD
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:10px_10px] opacity-20 pointer-events-none" />
                )}

                <div className="mb-8 space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                     <h3 className={`text-xl font-bold font-mono tracking-wider flex items-center gap-2 ${tier.popular ? "text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" : "text-gray-400"}`}>
                        {tierKey === 'pro' && <Zap className="w-5 h-5" />}
                        {tier.name}
                     </h3>
                     {tierKey === 'free' && <div className="text-[10px] uppercase border border-white/20 px-2 py-0.5 rounded text-white/40 font-mono">Starter Kit</div>}
                  </div>
                  
                  <div className="flex items-baseline gap-1">
                    <span className={`text-5xl font-bold tracking-tighter ${tier.popular ? "text-white text-shadow-neon" : "text-gray-300"}`}>
                      ${price}
                    </span>
                    {tierKey !== "free" && <span className="text-gray-500 text-sm font-mono uppercase">/month</span>}
                  </div>
                  <p className="text-xs text-gray-500 font-mono border-l-2 border-white/10 pl-3">{tier.description}</p>
                </div>

                <div className="flex-1 mb-8 relative z-10">
                    <div className="text-[10px] uppercase text-gray-600 font-mono mb-4 flex items-center gap-2">
                        <div className="h-px bg-gray-800 flex-1" />
                        SYSTEM_CAPABILITIES
                        <div className="h-px bg-gray-800 flex-1" />
                    </div>
                    <ul className="space-y-4">
                    {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm font-mono group/item">
                        <div className={`mt-0.5 p-0.5 rounded-full transition-colors ${
                            tier.popular 
                            ? "bg-cyan-950 text-cyan-400 group-hover/item:bg-cyan-400 group-hover/item:text-black shadow-[0_0_10px_rgba(6,182,212,0.2)]" 
                            : "bg-white/5 text-gray-500 group-hover/item:text-gray-300"
                        }`}>
                            <Check className="w-3 h-3" />
                        </div>
                        <span className={tier.popular ? "text-gray-200" : "text-gray-400"}>{feature}</span>
                        </li>
                    ))}
                    </ul>
                </div>

                <Button 
                  onClick={() => handleTierSelect(key)}
                  className={`w-full font-mono font-bold tracking-widest relative overflow-hidden h-12 transition-all duration-300 ${
                     tier.popular 
                     ? "bg-cyan-600 hover:bg-cyan-500 text-black border-none hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]" 
                     : "bg-transparent hover:bg-white/5 border border-white/20 text-gray-400 hover:text-white hover:border-white/40"
                  }`}
                  asChild
                >
                  <Link href={tierKey === "free" ? "/auth/signup" : `/auth/signup?plan=pro&cycle=${billingCycle}`}>
                    {tier.popular && (
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] animate-shimmer skew-x-12" />
                    )}
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {tier.cta} 
                        <span className="text-lg leading-none">&rsaquo;</span>
                    </span>
                  </Link>
                </Button>
              </Card>
            )
          })}
        </div>

        {/* Feature Comparison / Why */}
        <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto pt-8 border-t border-white/5">
             <div className="text-center space-y-2 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/20 transition-colors group">
               <Bot className="w-6 h-6 mx-auto text-cyan-400 group-hover:scale-110 transition-transform" />
               <h4 className="text-xs font-bold text-white font-mono">NEURAL_NET</h4>
               <p className="text-[10px] text-gray-500 font-mono">Competitors charge $49/mo.</p>
             </div>
             <div className="text-center space-y-2 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/20 transition-colors group">
               <TrendingUp className="w-6 h-6 mx-auto text-cyan-400 group-hover:scale-110 transition-transform" />
               <h4 className="text-xs font-bold text-white font-mono">DEFI_OPS</h4>
               <p className="text-[10px] text-gray-500 font-mono">Competitors charge $99/mo.</p>
             </div>
             <div className="text-center space-y-2 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/20 transition-colors group">
               <BarChart3 className="w-6 h-6 mx-auto text-cyan-400 group-hover:scale-110 transition-transform" />
               <h4 className="text-xs font-bold text-white font-mono">ANALYTICS</h4>
               <p className="text-[10px] text-gray-500 font-mono">Included in Firmware.</p>
             </div>
        </div>

      </div>
    </HardwareContainer>
  )
}
