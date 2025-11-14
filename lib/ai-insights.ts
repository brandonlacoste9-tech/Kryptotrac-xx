import { generateText } from "ai"
import type { PortfolioMetrics } from "./analytics"

export interface PortfolioInsight {
  summary: string
  riskAssessment: string
  recommendations: string[]
  diversificationAdvice: string
  performanceCommentary: string
  trends: string[]
}

export async function generatePortfolioInsights(
  holdings: {
    coin_name: string
    coin_symbol: string
    current_value: number
    profit_loss: number
    profit_loss_percentage: number
  }[],
  metrics: PortfolioMetrics,
  totalValue: number,
  totalProfitLoss: number,
  totalProfitLossPercentage: number,
): Promise<PortfolioInsight> {
  const totalCost = totalValue - totalProfitLoss

  const holdingsSummary = holdings
    .sort((a, b) => b.current_value - a.current_value)
    .slice(0, 10)
    .map(
      (h) =>
        `${h.coin_name} (${h.coin_symbol.toUpperCase()}): $${h.current_value.toFixed(2)} (${h.profit_loss_percentage >= 0 ? "+" : ""}${h.profit_loss_percentage.toFixed(2)}%)`,
    )
    .join("\n")

  const prompt = `You are a professional crypto investment analyst. Analyze this portfolio and provide actionable insights.

Portfolio Overview:
- Total Value: $${totalValue.toFixed(2)}
- Total Cost Basis: $${totalCost.toFixed(2)}
- Total P&L: $${totalProfitLoss.toFixed(2)} (${totalProfitLossPercentage >= 0 ? "+" : ""}${totalProfitLossPercentage.toFixed(2)}%)
- Number of Holdings: ${holdings.length}

Performance Metrics:
- Sharpe Ratio: ${metrics.sharpeRatio.toFixed(2)}
- Volatility (Annualized): ${metrics.volatility.toFixed(2)}%
- Max Drawdown: ${metrics.maxDrawdown.toFixed(2)}%
- Diversification Score: ${metrics.diversificationScore.toFixed(0)}/100
- Risk Score: ${metrics.riskScore.toFixed(0)}/100

Top Holdings:
${holdingsSummary}

Provide a comprehensive analysis in JSON format with these fields:
{
  "summary": "2-3 sentence overall portfolio summary",
  "riskAssessment": "Detailed risk assessment based on volatility, drawdown, and diversification",
  "recommendations": ["3-5 specific actionable recommendations"],
  "diversificationAdvice": "Specific advice on improving diversification",
  "performanceCommentary": "Analysis of current performance and trends",
  "trends": ["2-3 key trends or patterns identified"]
}

Be specific, data-driven, and actionable. Focus on practical advice.`

  try {
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Invalid response format")
    }

    const insights = JSON.parse(jsonMatch[0]) as PortfolioInsight
    return insights
  } catch (error) {
    console.error("[v0] Error generating AI insights:", error)
    // Return fallback insights
    return {
      summary: `Your portfolio of ${holdings.length} cryptocurrencies has a total value of $${totalValue.toFixed(2)} with a ${totalProfitLossPercentage >= 0 ? "gain" : "loss"} of ${Math.abs(totalProfitLossPercentage).toFixed(2)}%.`,
      riskAssessment: `Your portfolio shows ${metrics.riskScore > 70 ? "high" : metrics.riskScore > 40 ? "moderate" : "low"} risk with ${metrics.volatility.toFixed(0)}% annualized volatility.`,
      recommendations: [
        metrics.diversificationScore < 50
          ? "Consider increasing diversification by adding more holdings"
          : "Maintain your current diversification level",
        metrics.maxDrawdown > 30
          ? "Review stop-loss strategies to limit downside risk"
          : "Continue monitoring positions",
        "Regularly rebalance your portfolio to maintain target allocations",
      ],
      diversificationAdvice:
        metrics.diversificationScore < 50
          ? "Your portfolio concentration is relatively high. Consider spreading investments across more assets."
          : "Your portfolio shows good diversification across multiple holdings.",
      performanceCommentary: `Overall performance is ${totalProfitLossPercentage >= 0 ? "positive" : "negative"} with a ${Math.abs(totalProfitLossPercentage).toFixed(2)}% ${totalProfitLossPercentage >= 0 ? "gain" : "loss"}.`,
      trends: [
        totalProfitLossPercentage > 0 ? "Portfolio showing positive returns" : "Portfolio experiencing drawdown",
        `Sharpe ratio of ${metrics.sharpeRatio.toFixed(2)} indicates ${metrics.sharpeRatio > 1 ? "good" : metrics.sharpeRatio > 0.5 ? "moderate" : "poor"} risk-adjusted returns`,
      ],
    }
  }
}
