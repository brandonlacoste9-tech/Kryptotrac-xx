import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { checkAtlasRateLimit, logAtlasQuery, updateAtlasMemory } from "@/lib/atlas/rate-limiter"
import { fetchCryptoFeedForSymbols } from "@/lib/x"
import { summarizeXFeedForLLM } from "@/lib/atlas-social"
import { getSystemPrompt } from "@/lib/persona"
import { personas } from "@/config/personas"
import { deepseekModel } from "@/lib/deepseek"

type AtlasMode = "analysis" | "sentiment" | "alpha" | "friend"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { query, mode = "analysis", persona = "bb" } = await req.json()

    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 })
    }

    const rateLimit = await checkAtlasRateLimit(user.id)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          limit: rateLimit.limit,
          resetAt: rateLimit.resetAt
        },
        { status: 429 }
      )
    }

    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("plan_type")
      .eq("user_id", user.id)
      .single()

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const planType = subscription?.plan_type || "free"

    const { data: watchlist } = await supabase
      .from("user_watchlists")
      .select("coin_symbol")
      .eq("user_id", user.id)
      .limit(10)

    const watchlistSymbols = watchlist?.map((w) => w.coin_symbol) || []

    let socialSummary = ""
    try {
      if (watchlistSymbols.length > 0) {
        const feed = await fetchCryptoFeedForSymbols(watchlistSymbols, 20)
        socialSummary = summarizeXFeedForLLM(feed)
      }
    } catch (e) {
      console.error("[v0] Failed to fetch social feed", e)
    }

    const systemPrompt = getSystemPrompt(persona)

    const userPrompt = `
User question:
${query}

User watchlist symbols: ${watchlistSymbols.join(", ") || "none"}

${socialSummary ? `Recent social sentiment (X):\n${socialSummary}\n` : ""}

When you give any "tips", ALWAYS:
- Label risk (low / medium / high).
- Point out liquidity & volatility if relevant.
- Suggest position sizing discipline instead of absolute amounts.

If this is about sharing or posting to X, provide a draft tweet in your response labeled as "X DRAFT:".
`

    const start = Date.now()

    const { text } = await generateText({
      model: deepseekModel,
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: 1000,
    })

    const personaConfig = personas[persona as keyof typeof personas] || personas.default
    console.log(personaConfig.test_log_tag, {
      user_id: user.id,
      input: query,
      output: text,
      latency_ms: Date.now() - start,
    })

    await logAtlasQuery(user.id, query, text, mode)
    await updateAtlasMemory(user.id, query)

    const xDraftMatch = text.match(/X DRAFT:\s*(.+?)(?:\n\n|$)/s)
    const xDraft = xDraftMatch ? xDraftMatch[1].trim() : null

    const vibe = {
      sentiment: text.toLowerCase().includes("bullish") ? "Bullish" : text.toLowerCase().includes("bearish") ? "Bearish" : "Neutral",
      riskLevel: text.toLowerCase().includes("caution") || text.toLowerCase().includes("risk") ? "High" : "Medium",
      signalStrength: Math.floor(Math.random() * 30 + 60),
    }

    return NextResponse.json({
      response: text,
      mode,
      persona,
      model: "deepseek-v3",
      vibe,
      xDraft,
      rateLimit: {
        remaining: rateLimit.remaining,
        limit: rateLimit.limit,
      },
    })
  } catch (error) {
    console.error("[v0] ATLAS query error:", error)
    return NextResponse.json({ error: "Failed to process query" }, { status: 500 })
  }
}
