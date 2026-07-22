import { NextResponse } from "next/server"
import { cgFetch } from "@/lib/coingecko"
import type { CoinDetail } from "@/lib/types"

export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const data = await cgFetch<CoinDetail>(`/coins/${encodeURIComponent(id)}`, {
      localization: "false",
      tickers: "false",
      market_data: "true",
      community_data: "false",
      developer_data: "false",
      sparkline: "false",
    })

    return NextResponse.json(data)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Coin fetch failed"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
