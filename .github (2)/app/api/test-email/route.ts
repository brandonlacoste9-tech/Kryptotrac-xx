import { sendPriceAlertEmail } from "@/lib/email"
import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Send a test alert email
    const result = await sendPriceAlertEmail({
      to: email,
      coinName: "Bitcoin",
      coinSymbol: "BTC",
      condition: "above",
      thresholdPrice: 100000,
      currentPrice: 100500,
    })

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Failed to send test email" }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] Test email API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
