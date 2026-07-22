import { NextResponse } from "next/server"
import { cgFetch } from "@/lib/coingecko"
import type { MarketCoin } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const ids = new URL(req.url).searchParams.get("ids")?.trim()
    const vs = (new URL(req.url).searchParams.get("vs") || "usd").toLowerCase()
    const vs_currency = vs === "cad" ? "cad" : "usd"
    if (!ids) {
      return NextResponse.json({ coins: [] })
    }

    // CoinGecko markets supports ids=bitcoin,ethereum
    const coins = await cgFetch<MarketCoin[]>("/coins/markets", {
      vs_currency,
      ids: ids.split(",").slice(0, 4).join(","),
      order: "market_cap_desc",
      per_page: "4",
      page: "1",
      sparkline: "true",
      price_change_percentage: "24h,7d,30d",
    })

    return NextResponse.json({ coins })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Compare failed"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
