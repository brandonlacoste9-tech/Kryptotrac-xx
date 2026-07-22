import { NextResponse } from "next/server"
import { cgFetch } from "@/lib/coingecko"

export const dynamic = "force-dynamic"

export type TrendingItem = {
  item: {
    id: string
    name: string
    symbol: string
    market_cap_rank: number | null
    thumb: string
    small: string
    score: number
  }
}

export async function GET() {
  try {
    const data = await cgFetch<{ coins: TrendingItem[] }>("/search/trending")
    return NextResponse.json({
      coins: (data.coins || []).slice(0, 7).map((c) => c.item),
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Trending failed"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
