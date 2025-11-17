"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw } from "lucide-react"
import { AddHoldingDialog } from "./add-holding-dialog"
import { HoldingsTable } from "./holdings-table"
import { createBrowserClient } from "@/lib/supabase/client"
import { getCoinPrice } from "@/lib/coingecko"
import { PortfolioSummary } from "./portfolio-summary"
import { PortfolioAllocationChart } from "./portfolio-allocation-chart"
import { PortfolioPerformanceChart } from "./portfolio-performance-chart"
import { AdvancedAnalytics } from "./advanced-analytics"
import { ExportMenu } from "./export-menu"
import { AIInsightsCard } from "./ai-insights-card"
import {
  calculateSharpeRatio,
  calculateVolatility,
  calculateMaxDrawdown,
  calculateDiversificationScore,
  calculateRiskScore,
  generateDailyReturns,
} from "@/lib/analytics"

interface Holding {
  id: string
  coin_id: string
  coin_name: string
  coin_symbol: string
  coin_image: string | null
  quantity: number
  purchase_price: number
  purchase_date: string
}

interface HoldingWithPrice extends Holding {
  current_price: number
  current_value: number
  profit_loss: number
  profit_loss_percentage: number
}

export function PortfolioContainer() {
  const [holdings, setHoldings] = useState<HoldingWithPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const supabase = createBrowserClient()

  const fetchHoldings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("plan")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single()

      setIsPro(subscription?.plan === "pro")

      const { data, error } = await supabase
        .from("user_portfolios")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      if (data && data.length > 0) {
        const holdingsWithPrices = await Promise.all(
          data.map(async (holding) => {
            const currentPrice = await getCoinPrice(holding.coin_id)
            const currentValue = holding.quantity * currentPrice
            const costBasis = holding.quantity * holding.purchase_price
            const profitLoss = currentValue - costBasis
            const profitLossPercentage = (profitLoss / costBasis) * 100

            return {
              ...holding,
              quantity: Number(holding.quantity),
              purchase_price: Number(holding.purchase_price),
              current_price: currentPrice,
              current_value: currentValue,
              profit_loss: profitLoss,
              profit_loss_percentage: profitLossPercentage,
            }
          }),
        )
        setHoldings(holdingsWithPrices)
      } else {
        setHoldings([])
      }
    } catch (error) {
      console.error("[v0] Error fetching holdings:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchHoldings()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchHoldings()
  }

  const handleHoldingAdded = () => {
    fetchHoldings()
  }

  const handleDeleteHolding = async (id: string) => {
    try {
      const { error } = await supabase.from("user_portfolios").delete().eq("id", id)

      if (error) throw error
      fetchHoldings()
    } catch (error) {
      console.error("[v0] Error deleting holding:", error)
    }
  }

  const totalValue = holdings.reduce((sum, h) => sum + h.current_value, 0)
  const totalCost = holdings.reduce((sum, h) => sum + h.quantity * h.purchase_price, 0)
  const totalProfitLoss = totalValue - totalCost
  const totalProfitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0

  const analytics =
    holdings.length > 0
      ? {
          sharpeRatio: calculateSharpeRatio(generateDailyReturns(holdings)),
          volatility: calculateVolatility(generateDailyReturns(holdings)),
          maxDrawdown: calculateMaxDrawdown(holdings.map((h) => h.current_value)),
          diversificationScore: calculateDiversificationScore(holdings),
          riskScore: calculateRiskScore(
            calculateVolatility(generateDailyReturns(holdings)),
            calculateMaxDrawdown(holdings.map((h) => h.current_value)),
          ),
        }
      : undefined

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold neon-text-white">My Portfolio</h1>
        <div className="flex gap-2">
          <ExportMenu
            holdings={holdings}
            totalValue={totalValue}
            totalCost={totalCost}
            totalProfitLoss={totalProfitLoss}
            totalProfitLossPercentage={totalProfitLossPercentage}
            isPro={isPro}
            analytics={analytics}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-white/20 hover:border-white/40 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => setAddDialogOpen(true)} className="bg-primary hover:bg-primary/80">
            <Plus className="h-4 w-4 mr-2" />
            Add Holding
          </Button>
        </div>
      </div>

      {holdings.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <PortfolioSummary
            totalValue={totalValue}
            totalCost={totalCost}
            profitLoss={totalProfitLoss}
            profitLossPercent={totalProfitLossPercentage}
          />
          <PortfolioAllocationChart holdings={holdings} />
        </div>
      )}

      {holdings.length > 0 && <PortfolioPerformanceChart holdings={holdings} totalValue={totalValue} />}

      {holdings.length > 0 && <AdvancedAnalytics holdings={holdings} isPro={isPro} />}

      {holdings.length > 0 && isPro && <AIInsightsCard isPro={isPro} />}

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading your portfolio...</p>
            </div>
          ) : holdings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No holdings yet. Add your first crypto holding to get started.</p>
              <Button onClick={() => setAddDialogOpen(true)} className="mt-4 bg-primary hover:bg-primary/80">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Holding
              </Button>
            </div>
          ) : (
            <HoldingsTable holdings={holdings} onDelete={handleDeleteHolding} />
          )}
        </CardContent>
      </Card>

      <AddHoldingDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onHoldingAdded={handleHoldingAdded} />
    </div>
  )
}
