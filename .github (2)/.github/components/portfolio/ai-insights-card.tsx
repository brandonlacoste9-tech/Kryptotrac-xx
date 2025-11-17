"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, RefreshCw, TrendingUp, AlertTriangle, Target, Info } from "lucide-react"
import type { PortfolioInsight } from "@/lib/ai-insights"
import type { PortfolioMetrics } from "@/lib/analytics"

interface AIInsightsCardProps {
  isPro: boolean
}

export function AIInsightsCard({ isPro }: AIInsightsCardProps) {
  const [loading, setLoading] = useState(false)
  const [insights, setInsights] = useState<PortfolioInsight | null>(null)
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateInsights = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/insights/generate", {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to generate insights")
      }

      const data = await response.json()
      setInsights(data.insights)
      setMetrics(data.metrics)
    } catch (err: any) {
      console.error("[v0] Error generating insights:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isPro) {
    return (
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>AI Portfolio Insights</CardTitle>
            </div>
            <Badge variant="default" className="bg-primary">
              PRO
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">
              Get AI-powered portfolio analysis with personalized insights and recommendations
            </p>
            <Button asChild className="bg-primary hover:bg-primary/80">
              <a href="/upgrade">Upgrade to Pro</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>AI Portfolio Insights</CardTitle>
          </div>
          <Button onClick={generateInsights} disabled={loading} size="sm" className="bg-primary hover:bg-primary/80">
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Insights
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {!insights && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Click "Generate Insights" to get AI-powered analysis of your portfolio</p>
          </div>
        )}

        {insights && (
          <div className="space-y-6">
            {/* Summary */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Summary</h3>
              </div>
              <p className="text-sm text-muted-foreground">{insights.summary}</p>
            </div>

            {/* Risk Assessment */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <h3 className="font-semibold">Risk Assessment</h3>
              </div>
              <p className="text-sm text-muted-foreground">{insights.riskAssessment}</p>
            </div>

            {/* Recommendations */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-500" />
                <h3 className="font-semibold">Recommendations</h3>
              </div>
              <ul className="space-y-2">
                {insights.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trends */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <h3 className="font-semibold">Key Trends</h3>
              </div>
              <ul className="space-y-2">
                {insights.trends.map((trend, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{trend}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Diversification */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-purple-500" />
                <h3 className="font-semibold">Diversification</h3>
              </div>
              <p className="text-sm text-muted-foreground">{insights.diversificationAdvice}</p>
            </div>

            {/* Performance Commentary */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-cyan-500" />
                <h3 className="font-semibold">Performance</h3>
              </div>
              <p className="text-sm text-muted-foreground">{insights.performanceCommentary}</p>
            </div>

            <p className="text-xs text-muted-foreground pt-4 border-t border-white/10">
              Insights generated using AI. Not financial advice.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
