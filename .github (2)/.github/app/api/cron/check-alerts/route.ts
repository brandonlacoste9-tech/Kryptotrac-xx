import { createServerClient } from "@/lib/supabase/server"
import { getCoinPrice } from "@/lib/coingecko"
import { sendPriceAlertEmail } from "@/lib/email"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    const qstashSignature = request.headers.get("upstash-signature")

    // Allow either Bearer token or QStash signature for local testing and production
    if (!authHeader && !qstashSignature) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createServerClient()

    // Get all active alerts with user email
    const { data: alerts, error } = await supabase
      .from("alerts")
      .select(`
        *,
        users:user_id (
          email
        )
      `)
      .eq("is_triggered", false)

    if (error) {
      console.error("[v0] Failed to fetch alerts:", error)
      throw error
    }

    console.log("[v0] Checking", alerts?.length || 0, "active alerts")

    let triggeredCount = 0

    for (const alert of alerts || []) {
      try {
        const currentPrice = await getCoinPrice(alert.coin_id)

        const shouldTrigger =
          (alert.condition === "above" && currentPrice >= alert.threshold_price) ||
          (alert.condition === "below" && currentPrice <= alert.threshold_price)

        if (shouldTrigger) {
          console.log("[v0] Alert triggered for", alert.coin_name, "at $", currentPrice)

          const userEmail = alert.users?.email
          if (userEmail) {
            const emailResult = await sendPriceAlertEmail({
              to: userEmail,
              coinName: alert.coin_name,
              coinSymbol: alert.coin_symbol,
              condition: alert.condition,
              thresholdPrice: alert.threshold_price,
              currentPrice,
            })

            if (emailResult.success) {
              console.log("[v0] Email sent to", userEmail)

              // Mark as triggered only if email was sent successfully
              await supabase.from("alerts").update({ is_triggered: true }).eq("id", alert.id)

              triggeredCount++
            } else {
              console.error("[v0] Failed to send email:", emailResult.error)
            }
          } else {
            console.error("[v0] No email found for user")
          }
        }
      } catch (err) {
        console.error("[v0] Failed to check alert", alert.id, err)
      }
    }

    return NextResponse.json({
      success: true,
      checked: alerts?.length || 0,
      triggered: triggeredCount,
    })
  } catch (error) {
    console.error("[v0] Cron job failed:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
