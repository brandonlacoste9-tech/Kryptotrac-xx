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

    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("plan_type, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (!subscription || subscription.plan_type !== "pro") {
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

    const { error: insertError } = await supabase.from("insights_history").insert({
      user_id: user.id,
      insights: insights,
      metrics: metrics,
      generated_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("[v0] Error saving insights:", insertError)
    }

    const { data: allInsights } = await supabase
      .from("insights_history")
      .select("id, generated_at")
      .eq("user_id", user.id)
      .order("generated_at", { ascending: false })

    if (allInsights && allInsights.length > 30) {
      const idsToDelete = allInsights.slice(30).map((i) => i.id)
      await supabase.from("insights_history").delete().in("id", idsToDelete)
      console.log(`[v0] Cleaned up ${idsToDelete.length} old insights for user ${user.id}`)
    }

    return NextResponse.json({ insights, metrics })
  } catch (error) {
    console.error("[v0] Error generating insights:", error)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}
