import { NextResponse } from "next/server"
import { cgFetch } from "@/lib/coingecko"
import type { ChartPoint } from "@/lib/types"

export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }
    const { searchParams } = new URL(req.url)
    const days = searchParams.get("days") || "7"
    const vs = (searchParams.get("vs") || "usd").toLowerCase()
    const vs_currency = vs === "cad" ? "cad" : "usd"

    const data = await cgFetch<{ prices: ChartPoint[] }>(
      `/coins/${encodeURIComponent(id)}/market_chart`,
      {
        vs_currency,
        days,
      }
    )

    return NextResponse.json({
      prices: data.prices ?? [],
      days,
      vs: vs_currency,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Chart fetch failed"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
