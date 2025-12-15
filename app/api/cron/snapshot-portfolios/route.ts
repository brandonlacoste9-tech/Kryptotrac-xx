import { createClient } from "@/lib/supabase/server"
import { getCoinPrice } from "@/lib/coingecko"
import { NextResponse } from "next/server"
import { taintUniqueValue } from "@/lib/taint"

// Taint cron secret to prevent accidental exposure to client
if (process.env.CRON_SECRET) {
  taintUniqueValue('CRON_SECRET must not be sent to the client', process.env.CRON_SECRET)
}

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// This endpoint should be called daily by a cron job (e.g., Upstash QStash)
// Schedule: 0 0 * * * (midnight UTC daily)

export async function POST(request: Request) {
  try {
    // Verify the request is from your cron service
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const supabase = await createClient()

    // Get all users with portfolios
    const { data: users, error: usersError } = await supabase
      .from("user_portfolios")
      .select("user_id")
      .neq("quantity", 0)

    if (usersError) throw usersError

    const uniqueUserIds = [...new Set(users?.map((u) => u.user_id) || [])]
    console.log(`[v0] Processing snapshots for ${uniqueUserIds.length} users`)

    let snapshotsCreated = 0
    const today = new Date().toISOString().split("T")[0]

    for (const userId of uniqueUserIds) {
      try {
        // Get user's holdings
        const { data: holdings, error: holdingsError } = await supabase
          .from("user_portfolios")
          .select("*")
          .eq("user_id", userId)
          .gt("quantity", 0)

        if (holdingsError || !holdings?.length) continue

        // Fetch current prices for all coins
        const prices = await Promise.all(
          holdings.map(async (h) => ({
            coin_id: h.coin_id,
            price: await getCoinPrice(h.coin_id),
          })),
        )

        const priceMap = Object.fromEntries(prices.map((p) => [p.coin_id, p.price]))

        // Calculate portfolio totals
        let totalValue = 0
        let totalCost = 0

        const holdingSnapshots = holdings.map((h) => {
          const currentPrice = priceMap[h.coin_id] || 0
          const value = h.quantity * currentPrice
          const costBasis = h.quantity * h.purchase_price
          const pnl = value - costBasis

          totalValue += value
          totalCost += costBasis

          return {
            coin_id: h.coin_id,
            coin_symbol: h.coin_symbol,
            quantity: h.quantity,
            price: currentPrice,
            value,
            cost_basis: costBasis,
            pnl,
          }
        })

        const totalPnl = totalValue - totalCost
        const pnlPercentage = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0

        const { data: existingSnapshot } = await supabase
          .from("portfolio_snapshots")
          .select("id")
          .eq("user_id", userId)
          .eq("snapshot_date", today)
          .single()

        if (existingSnapshot) {
          console.log(`[v0] Snapshot already exists for user ${userId} on ${today}, skipping`)
          continue
        }

        const { error: snapshotError } = await supabase
          .from("portfolio_snapshots")
          .insert({
            user_id: userId,
            total_value: totalValue,
            total_cost: totalCost,
            total_pnl: totalPnl,
            pnl_percentage: pnlPercentage,
            snapshot_date: today,
          })

        if (snapshotError) {
          console.error(`[v0] Error creating snapshot for user ${userId}:`, snapshotError)
          continue
        }

        snapshotsCreated++
        console.log(`[v0] Created snapshot for user ${userId}: $${totalValue.toFixed(2)}`)
      } catch (error) {
        console.error(`[v0] Error processing user ${userId}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${snapshotsCreated} portfolio snapshots`,
      date: today,
    })
  } catch (error) {
    console.error("[v0] Snapshot cron error:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
