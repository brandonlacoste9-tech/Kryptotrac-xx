import { NextResponse } from "next/server"
import { cgFetch } from "@/lib/coingecko"
import type { MarketCoin } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const perPage = searchParams.get("per_page") || "100"
    const page = searchParams.get("page") || "1"
    const sparkline = searchParams.get("sparkline") || "true"
    const vs = (searchParams.get("vs") || "usd").toLowerCase()
    const vs_currency = vs === "cad" ? "cad" : "usd"

    const data = await cgFetch<MarketCoin[]>("/coins/markets", {
      vs_currency,
      order: "market_cap_desc",
      per_page: perPage,
      page,
      sparkline,
      price_change_percentage: "24h",
    })

    return NextResponse.json(data)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Markets fetch failed"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
