import { NextResponse } from "next/server"
import { cgFetch } from "@/lib/coingecko"
import type { MarketCoin } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category") || ""
    const vs = (searchParams.get("vs") || "usd").toLowerCase()
    const vs_currency = vs === "cad" ? "cad" : "usd"
    const per_page = searchParams.get("per_page") || "50"

    if (!category) {
      return NextResponse.json({ coins: [] })
    }

    const coins = await cgFetch<MarketCoin[]>("/coins/markets", {
      vs_currency,
      order: "market_cap_desc",
      per_page,
      page: "1",
      sparkline: "true",
      price_change_percentage: "24h",
      category,
    })
    return NextResponse.json({ coins })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Categories failed"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
