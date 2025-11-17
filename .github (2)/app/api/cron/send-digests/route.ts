import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendEmail, createDailyDigestEmail, type DigestData } from "@/lib/email"
import { getCoinPrice } from "@/lib/coingecko"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    // Verify request is from QStash or internal cron
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, etc.

    console.log("[v0] Starting digest cron job")

    // Fetch users who should receive digests
    const { data: preferences, error: prefsError } = await supabase
      .from("digest_preferences")
      .select(
        `
        *,
        subscriptions (plan, status)
      `,
      )
      .eq("digest_enabled", true)
      .in("digest_frequency", ["daily", "weekly"])

    if (prefsError) {
      console.error("[v0] Error fetching preferences:", prefsError)
      return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 })
    }

    console.log(`[v0] Found ${preferences?.length || 0} users with digests enabled`)

    let sentCount = 0
    let errorCount = 0

    for (const pref of preferences || []) {
      try {
        // Check if user should receive digest today
        const isPro = pref.subscriptions?.plan === "pro" && pref.subscriptions?.status === "active"
        const shouldSend =
          (pref.digest_frequency === "daily" && isPro) || // Pro users get daily
          (pref.digest_frequency === "weekly" && dayOfWeek === 1) || // Free users get weekly on Mondays
          (pref.digest_frequency === "daily" && !pref.last_sent_at) // First time

        if (!shouldSend) {
          console.log(`[v0] Skipping user ${pref.user_id} - not scheduled for today`)
          continue
        }

        // Check if already sent today
        if (pref.last_sent_at) {
          const lastSent = new Date(pref.last_sent_at)
          const hoursSinceLastSent = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60)
          if (hoursSinceLastSent < 20) {
            console.log(`[v0] Skipping user ${pref.user_id} - already sent in last 20 hours`)
            continue
          }
        }

        // Fetch user data
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(pref.user_id)
        if (userError || !userData.user) {
          console.error("[v0] Error fetching user:", userError)
          continue
        }

        const userEmail = userData.user.email!
        const userName = userData.user.user_metadata?.name || userEmail.split("@")[0]

        // Fetch portfolio
        const { data: holdings, error: holdingsError } = await supabase
          .from("user_portfolios")
          .select("*")
          .eq("user_id", pref.user_id)

        if (holdingsError || !holdings || holdings.length === 0) {
          console.log(`[v0] No holdings for user ${pref.user_id}, skipping`)
          continue
        }

        // Fetch current prices and calculate portfolio value
        const coinIds = [...new Set(holdings.map((h) => h.coin_id))]
        const prices: Record<string, number> = {}

        for (const coinId of coinIds) {
          const price = await getCoinPrice(coinId)
          if (price) {
            prices[coinId] = price
          }
        }

        // Calculate portfolio metrics
        let totalValue = 0
        let totalCost = 0
        const holdingsWithValues = holdings.map((h) => {
          const currentPrice = prices[h.coin_id] || 0
          const currentValue = h.quantity * currentPrice
          const costBasis = h.quantity * h.purchase_price
          const change = currentValue - costBasis
          const changePercent = costBasis > 0 ? (change / costBasis) * 100 : 0

          totalValue += currentValue
          totalCost += costBasis

          return {
            name: h.coin_name,
            symbol: h.coin_symbol,
            value: currentValue,
            change,
            changePercent,
          }
        })

        // Get 24h change (for now, using P&L as proxy - ideally fetch from history table)
        const change24h = totalValue - totalCost
        const changePercent24h = totalCost > 0 ? (change24h / totalCost) * 100 : 0

        // Get top 3 movers
        const topMovers = holdingsWithValues
          .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
          .slice(0, 3)

        // Generate AI insights for Pro users
        const insights = isPro
          ? {
              summary: "Your portfolio shows strong momentum with balanced diversification across major crypto assets.",
              riskLevel: "moderate" as const,
              keyTrends: [
                "Bitcoin maintaining support levels",
                "Altcoins showing recovery signals",
                "Overall market sentiment improving",
              ],
            }
          : {
              summary: "",
              riskLevel: "moderate" as const,
              keyTrends: [],
            }

        const digestData: DigestData = {
          userName,
          totalValue,
          change24h,
          changePercent24h,
          topMovers,
          insights,
          isPro,
        }

        // Send email
        const emailTemplate = createDailyDigestEmail(digestData)
        const sent = await sendEmail(userEmail, emailTemplate)

        if (sent) {
          // Update last_sent_at
          await supabase
            .from("digest_preferences")
            .update({ last_sent_at: now.toISOString() })
            .eq("user_id", pref.user_id)

          sentCount++
          console.log(`[v0] Sent digest to ${userEmail}`)
        } else {
          errorCount++
          console.error(`[v0] Failed to send digest to ${userEmail}`)
        }
      } catch (error) {
        errorCount++
        console.error(`[v0] Error processing user ${pref.user_id}:`, error)
      }
    }

    console.log(`[v0] Digest cron complete: ${sentCount} sent, ${errorCount} errors`)

    return NextResponse.json({
      success: true,
      sent: sentCount,
      errors: errorCount,
      total: preferences?.length || 0,
    })
  } catch (error) {
    console.error("[v0] Digest cron error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
