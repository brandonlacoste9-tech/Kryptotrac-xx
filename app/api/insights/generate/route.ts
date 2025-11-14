import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { calculateRealMetrics } from "@/lib/analytics"
import { generatePortfolioInsights } from "@/lib/ai-insights"
import { getCoinPrice } from "@/lib/coingecko"

export async function POST() {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check Pro status
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (!subscription || subscription.plan !== "pro") {
      return NextResponse.json({ error: "Pro subscription required" }, { status: 403 })
    }

    // Get holdings
    const { data: holdings, error: holdingsError } = await supabase
      .from("user_portfolios")
      .select("*")
      .eq("user_id", user.id)
      .gt("quantity", 0)

    if (holdingsError || !holdings || holdings.length === 0) {
      return NextResponse.json({ error: "No holdings found" }, { status: 404 })
    }

    // Enrich with current prices
    const enrichedHoldings = await Promise.all(
      holdings.map(async (h) => {
        const currentPrice = await getCoinPrice(h.coin_id)
        const currentValue = Number(h.quantity) * currentPrice
        const costBasis = Number(h.quantity) * Number(h.purchase_price)
        const profitLoss = currentValue - costBasis
        const profitLossPercentage = (profitLoss / costBasis) * 100

        return {
          coin_name: h.coin_name,
          coin_symbol: h.coin_symbol,
          current_value: currentValue,
          profit_loss: profitLoss,
          profit_loss_percentage: profitLossPercentage,
        }
      }),
    )

    // Calculate metrics
    const metrics = await calculateRealMetrics(user.id)
    if (!metrics) {
      return NextResponse.json({ error: "Unable to calculate metrics" }, { status: 500 })
    }

    // Calculate totals
    const totalValue = enrichedHoldings.reduce((sum, h) => sum + h.current_value, 0)
    const totalProfitLoss = enrichedHoldings.reduce((sum, h) => sum + h.profit_loss, 0)
    const totalProfitLossPercentage = totalValue > 0 ? (totalProfitLoss / (totalValue - totalProfitLoss)) * 100 : 0

    // Generate insights
    const insights = await generatePortfolioInsights(
      enrichedHoldings,
      metrics,
      totalValue,
      totalProfitLoss,
      totalProfitLossPercentage,
    )

    // Save insights to database
    await supabase.from("portfolio_insights").insert({
      user_id: user.id,
      insights: insights,
      metrics: metrics,
      generated_at: new Date().toISOString(),
    })

    return NextResponse.json({ insights, metrics })
  } catch (error) {
    console.error("[v0] Error generating insights:", error)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}
