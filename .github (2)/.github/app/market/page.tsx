import { MarketOverview } from "@/components/market/market-overview"
import { AffiliateBanner } from "@/components/affiliates/affiliate-banner"
import { MarketStatsHeader } from "@/components/market/market-stats-header"

export default function MarketPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent">
          Crypto Market
        </h1>
        <p className="text-white/60">Real-time prices and market data</p>
      </div>

      <MarketStatsHeader />

      <MarketOverview />

      <AffiliateBanner />
    </div>
  )
}
