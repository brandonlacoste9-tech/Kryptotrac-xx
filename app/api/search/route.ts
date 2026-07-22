import { NextResponse } from "next/server"
import { cgFetch } from "@/lib/coingecko"

export const dynamic = "force-dynamic"

export type SearchCoin = {
  id: string
  name: string
  symbol: string
  market_cap_rank: number | null
  thumb: string
  large: string
}

export async function GET(req: Request) {
  try {
    const q = new URL(req.url).searchParams.get("q")?.trim()
    if (!q || q.length < 1) {
      return NextResponse.json({ coins: [] })
    }

    const data = await cgFetch<{ coins: SearchCoin[] }>("/search", {
      query: q,
    })

    return NextResponse.json({
      coins: (data.coins || []).slice(0, 12),
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Search failed"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
