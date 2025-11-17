import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { totalValue, totalProfitLoss, profitLossPercentage, topHoldings, isPro } = body

    // Generate OG image using canvas or external service
    // For now, return a placeholder URL
    const imageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://kryptotrac.app"}/api/og/portfolio?value=${totalValue}&pl=${totalProfitLoss}&plp=${profitLossPercentage}&pro=${isPro}`

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error("[v0] Portfolio share error:", error)
    return NextResponse.json({ error: "Failed to generate share card" }, { status: 500 })
  }
}
