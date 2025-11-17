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

    // Check Pro status
    const { data: subscription } = await supabase.from("subscriptions").select("plan").eq("user_id", user.id).single()

    if (subscription?.plan !== "pro") {
      return NextResponse.json({ error: "Pro subscription required" }, { status: 403 })
    }

    const body = await request.json()
    const { sharpeRatio, volatility, riskScore, diversificationScore } = body

    const imageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://kryptotrac.app"}/api/og/analytics?sharpe=${sharpeRatio}&vol=${volatility}&risk=${riskScore}&div=${diversificationScore}`

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error("[v0] Analytics share error:", error)
    return NextResponse.json({ error: "Failed to generate share card" }, { status: 500 })
  }
}
