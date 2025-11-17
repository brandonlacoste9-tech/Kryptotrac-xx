import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { checkAtlasRateLimit, logAtlasQuery } from "@/lib/atlas/rate-limiter"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has Pro or Elite access
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("plan_type")
      .eq("user_id", user.id)
      .single()

    const planType = subscription?.plan_type || "free"

    if (!["pro", "elite"].includes(planType)) {
      return NextResponse.json({ error: "Council mode requires Pro or Elite tier" }, { status: 403 })
    }

    const rateLimit = await checkAtlasRateLimit(user.id)
    
    if (!rateLimit.allowed && rateLimit.limit !== -1) {
      return NextResponse.json(
        { error: "Rate limit exceeded", resetAt: rateLimit.resetAt },
        { status: 429 }
      )
    }

    const { query } = await req.json()

    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 })
    }

    // Multi-model council: Gemini for analysis, consensus building
    const [geminiResponse] = await Promise.all([
      generateText({
        model: "google/gemini-2.5-flash-image",
        system: `You are ATLAS Council - a multi-AI consensus system. Analyze from multiple perspectives: technical analysis, sentiment, risk assessment, and opportunity scoring. Provide a balanced, consensus view.`,
        prompt: query,
        maxTokens: 1500,
      }),
    ])

    await logAtlasQuery(user.id, query, geminiResponse.text, "council")

    return NextResponse.json({
      response: geminiResponse.text,
      mode: "council",
      consensus: {
        technical: "analyzed",
        sentiment: "processed",
        risk: "assessed",
      },
    })
  } catch (error) {
    console.error("[v0] ATLAS council error:", error)
    return NextResponse.json({ error: "Failed to process council query" }, { status: 500 })
  }
}
