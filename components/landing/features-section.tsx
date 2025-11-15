"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Zap, TrendingUp, Activity } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: "HeatPulse Alerts",
      description: "Get alerted when your coins start moving – volume, price, or buzz. You see the spike before the crowd.",
    },
    {
      icon: TrendingUp,
      title: "Portfolio Auto-Tracker",
      description: "Track your holdings without spreadsheets. A clean view of what you own, what it's worth, and how it's moving.",
    },
    {
      icon: Activity,
      title: "Crypto Pulse Feed",
      description: "See what's hot right now – trending coins and quick context, no 40-tab research required.",
    },
  ]

  return (
    <div className="py-16">
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <Card
              key={index}
              className="bg-black/40 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all"
            >
              <CardHeader>
                <div className="mb-4 w-12 h-12 rounded-lg bg-gradient-to-br from-red-600/20 to-red-500/20 border border-red-500/30 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-red-500" />
                </div>
                <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400 text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
