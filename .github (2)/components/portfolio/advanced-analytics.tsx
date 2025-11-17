"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Activity, AlertTriangle, PieChart, Target, BarChart3 } from "lucide-react"
import {
  calculateSharpeRatio,
  calculateVolatility,
  calculateMaxDrawdown,
  calculateDiversificationScore,
  calculateRiskScore,
  generateDailyReturns,
} from "@/lib/analytics"
import { Badge } from "@/components/ui/badge"

interface HoldingWithPrice {
  quantity: number
  purchase_price: number
  current_price: number
  current_value: number
  coin_name: string
}

interface AdvancedAnalyticsProps {
  holdings: HoldingWithPrice[]
  isPro: boolean
}

export function AdvancedAnalytics({ holdings, isPro }: AdvancedAnalyticsProps) {
  if (!isPro) {
    return (
      <Card className="glass-card border-primary/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Advanced Analytics
            </CardTitle>
            <Badge variant="default" className="bg-primary text-white">
              PRO ONLY
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mb-4 text-muted-foreground">Unlock advanced portfolio analytics with KryptoTrac Pro</div>
            <ul className="text-sm text-left max-w-md mx-auto space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
                <span>Sharpe Ratio & Risk-Adjusted Returns</span>
              </li>
              <li className="flex items-start gap-2">
                <Activity className="h-4 w-4 text-primary mt-0.5" />
                <span>Portfolio Volatility Analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-primary mt-0.5" />
                <span>Maximum Drawdown Tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <PieChart className="h-4 w-4 text-primary mt-0.5" />
                <span>Diversification Score</span>
              </li>
              <li className="flex items-start gap-2">
                <Target className="h-4 w-4 text-primary mt-0.5" />
                <span>Risk Score & Recommendations</span>
              </li>
            </ul>
            <a
              href="/pricing"
              className="inline-flex items-center justify-center px-6 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors"
            >
              Upgrade to Pro
            </a>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate metrics
  const returns = generateDailyReturns(holdings)
  const values = holdings.map((h) => h.current_value)

  const sharpeRatio = calculateSharpeRatio(returns)
  const volatility = calculateVolatility(returns)
  const maxDrawdown = calculateMaxDrawdown(values)
  const diversificationScore = calculateDiversificationScore(holdings)
  const riskScore = calculateRiskScore(volatility, maxDrawdown)

  const getRiskLevel = (score: number): { label: string; color: string } => {
    if (score < 30) return { label: "Low Risk", color: "text-green-400" }
    if (score < 60) return { label: "Moderate Risk", color: "text-yellow-400" }
    return { label: "High Risk", color: "text-red-400" }
  }

  const getDiversificationLevel = (score: number): { label: string; color: string } => {
    if (score > 70) return { label: "Well Diversified", color: "text-green-400" }
    if (score > 40) return { label: "Moderately Diversified", color: "text-yellow-400" }
    return { label: "Concentrated", color: "text-red-400" }
  }

  const risk = getRiskLevel(riskScore)
  const diversification = getDiversificationLevel(diversificationScore)

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Advanced Analytics
          </CardTitle>
          <Badge variant="default" className="bg-primary text-white">
            PRO
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Sharpe Ratio */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Sharpe Ratio
            </div>
            <div className="text-2xl font-bold text-white">{sharpeRatio.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {sharpeRatio > 1 ? "Excellent" : sharpeRatio > 0.5 ? "Good" : "Poor"} risk-adjusted returns
            </p>
          </div>

          {/* Volatility */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              Annual Volatility
            </div>
            <div className="text-2xl font-bold text-white">{volatility.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {volatility > 100 ? "Very high" : volatility > 50 ? "High" : "Moderate"} price swings
            </p>
          </div>

          {/* Max Drawdown */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              Max Drawdown
            </div>
            <div className="text-2xl font-bold text-red-400">-{maxDrawdown.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Largest peak-to-trough decline</p>
          </div>

          {/* Diversification Score */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <PieChart className="h-4 w-4" />
              Diversification
            </div>
            <div className={`text-2xl font-bold ${diversification.color}`}>{diversificationScore.toFixed(0)}/100</div>
            <p className="text-xs text-muted-foreground">{diversification.label}</p>
          </div>

          {/* Risk Score */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              Overall Risk
            </div>
            <div className={`text-2xl font-bold ${risk.color}`}>{riskScore.toFixed(0)}/100</div>
            <p className="text-xs text-muted-foreground">{risk.label}</p>
          </div>

          {/* Holdings Count */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              Total Assets
            </div>
            <div className="text-2xl font-bold text-white">{holdings.length}</div>
            <p className="text-xs text-muted-foreground">
              {holdings.length > 10 ? "Highly" : holdings.length > 5 ? "Well" : "Minimally"} diversified
            </p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <h4 className="text-sm font-semibold text-white mb-2">Portfolio Insights</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {riskScore > 70 && <li>Your portfolio has high volatility. Consider adding more stable assets.</li>}
            {diversificationScore < 50 && <li>Portfolio is concentrated. Adding more assets could reduce risk.</li>}
            {sharpeRatio < 0.5 && <li>Risk-adjusted returns are low. Review underperforming positions.</li>}
            {maxDrawdown > 30 && <li>High drawdown detected. Consider setting stop-loss alerts.</li>}
            {diversificationScore > 70 && sharpeRatio > 1 && (
              <li>Excellent diversification and risk-adjusted returns. Keep it up!</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
