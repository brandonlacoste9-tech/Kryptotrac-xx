"use client"

import { ExternalLink } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function RecommendedExchanges() {
  const exchanges = [
    {
      name: "Kraken",
      description: "Top-rated Canadian exchange with low fees",
      badge: "Popular",
      logo: "https://cryptologos.cc/logos/kraken-kraken-logo.png",
      link: "#", // Replace with your Kraken affiliate link
    },
    {
      name: "Coinbase",
      description: "Get $10 in Bitcoin on your first $100 trade",
      badge: "New User Bonus",
      logo: "https://cryptologos.cc/logos/coinbase-coin-logo.png",
      link: "#", // Replace with your Coinbase affiliate link
    },
    {
      name: "Binance",
      description: "World's largest crypto exchange",
      badge: "Global",
      logo: "https://cryptologos.cc/logos/binance-coin-bnb-logo.png",
      link: "#", // Replace with your Binance affiliate link
    },
  ]

  return (
    <Card className="border-border/40 bg-background/50 p-6 backdrop-blur-sm">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recommended Exchanges</h3>
          <p className="text-sm text-muted-foreground">Trusted platforms to buy and trade crypto</p>
        </div>

        <div className="space-y-3">
          {exchanges.map((exchange) => (
            <div
              key={exchange.name}
              className="group flex items-center justify-between rounded-lg border border-border/40 bg-background/50 p-4 transition-all hover:border-primary/50 hover:bg-background/80"
            >
              <div className="flex items-center gap-4">
                <img src={exchange.logo || "/placeholder.svg"} alt={`${exchange.name} logo`} className="h-10 w-10 rounded-full object-contain" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{exchange.name}</h4>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {exchange.badge}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{exchange.description}</p>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <a href={exchange.link} target="_blank" rel="noopener noreferrer">
                  Visit
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border/40">
          We may earn a commission from partner links. Always do your own research.
        </p>
      </div>
    </Card>
  )
}
