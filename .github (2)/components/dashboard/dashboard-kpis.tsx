import { createServerClient } from "@/lib/supabase/server"
import { fetchCoinPrices } from "@/lib/coingecko"
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react'
import { PortfolioShareCard } from "@/components/share/portfolio-share-card"

interface DashboardKPIsProps {
  userId: string
}

export async function DashboardKPIs({ userId }: DashboardKPIsProps) {
  const supabase = await createServerClient()

  // Fetch user's portfolio
  const { data: holdings } = await supabase
    .from('user_portfolios')
    .select('*')
    .eq('user_id', userId)

  if (!holdings || holdings.length === 0) {
    return null
  }

  // Get coin IDs and fetch current prices
  const coinIds = holdings.map(h => h.coin_id)
  const prices = await fetchCoinPrices(coinIds)

  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('status, plan')
    .eq('user_id', userId)
    .single()

  // Calculate portfolio metrics
  let totalValue = 0
  let totalCost = 0
  let topGainer = { name: '', gain: 0 }
  let topLoser = { name: '', gain: 0 }

  holdings.forEach(holding => {
    const price = prices.find(p => p.id === holding.coin_id)
    if (price) {
      const currentValue = holding.quantity * price.current_price
      const costBasis = holding.quantity * holding.purchase_price
      const gain = ((currentValue - costBasis) / costBasis) * 100

      totalValue += currentValue
      totalCost += costBasis

      if (gain > topGainer.gain) {
        topGainer = { name: price.name, gain }
      }
      if (gain < topLoser.gain) {
        topLoser = { name: price.name, gain }
      }
    }
  })

  const totalGainPercent = ((totalValue - totalCost) / totalCost) * 100
  const totalGainDollar = totalValue - totalCost

  const kpis = [
    {
      label: 'Total Value',
      value: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-white'
    },
    {
      label: '24h Change',
      value: `${totalGainPercent >= 0 ? '+' : ''}${totalGainPercent.toFixed(2)}%`,
      subValue: `$${totalGainDollar >= 0 ? '+' : ''}${totalGainDollar.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: totalGainPercent >= 0 ? TrendingUp : TrendingDown,
      color: totalGainPercent >= 0 ? 'text-green-500' : 'text-red-500'
    },
    {
      label: 'Top Gainer',
      value: topGainer.name,
      subValue: `+${topGainer.gain.toFixed(2)}%`,
      icon: TrendingUp,
      color: 'text-green-500'
    },
    {
      label: 'Top Loser',
      value: topLoser.name,
      subValue: `${topLoser.gain.toFixed(2)}%`,
      icon: TrendingDown,
      color: 'text-red-500'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Portfolio Overview</h2>
        {totalValue > 0 && (
          <PortfolioShareCard
            totalValue={totalValue}
            totalProfitLoss={totalGainDollar}
            profitLossPercentage={totalGainPercent}
            topHoldings={holdings.map(h => {
              const price = prices.find(p => p.id === h.coin_id)
              return {
                coinId: h.coin_id,
                symbol: h.symbol,
                quantity: h.quantity,
                currentPrice: price?.current_price || 0,
                profitLoss: ((price?.current_price || 0) - h.purchase_price) * h.quantity
              }
            })}
            isPro={subscription?.status === 'active'}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">{kpi.label}</span>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
            {kpi.subValue && (
              <div className="text-sm text-muted-foreground mt-1">{kpi.subValue}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
