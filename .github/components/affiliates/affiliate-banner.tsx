import { ExternalLink } from "lucide-react"

export function AffiliateBanner() {
  const partners = [
    {
      name: "Binance",
      description: "Get 20% fee discount",
      cta: "Join Binance →",
      url: "#",
      gradient: "from-yellow-600 to-yellow-400",
    },
    {
      name: "Coinbase",
      description: "Get $10 in free BTC",
      cta: "Start Trading →",
      url: "#",
      gradient: "from-blue-600 to-blue-400",
    },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold neon-text-white">Trusted Exchanges</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {partners.map((partner) => (
          <a
            key={partner.name}
            href={partner.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="glass-card p-6 group hover:scale-105 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className={`text-xl font-bold bg-gradient-to-r ${partner.gradient} bg-clip-text text-transparent`}>
                  {partner.name}
                </div>
                <p className="text-sm text-muted-foreground">{partner.description}</p>
                <div className="flex items-center gap-2 text-sm font-medium text-white/80 group-hover:text-red-400 transition-colors">
                  {partner.cta}
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Sponsored</div>
          </a>
        ))}
      </div>
    </div>
  )
}
