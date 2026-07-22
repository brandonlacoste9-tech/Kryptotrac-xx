import { NextResponse } from "next/server"
import { cgFetch } from "@/lib/coingecko"
import type { PriceMap } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const ids = searchParams.get("ids")
    if (!ids?.trim()) {
      return NextResponse.json({})
    }

    const data = await cgFetch<PriceMap>("/simple/price", {
      ids: ids.trim(),
      vs_currencies: "usd",
      include_24hr_change: "true",
    })

    return NextResponse.json(data)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Prices fetch failed"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
