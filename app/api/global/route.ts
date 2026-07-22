import { NextResponse } from "next/server"
import { cgFetch } from "@/lib/coingecko"

export const dynamic = "force-dynamic"

export type GlobalData = {
  total_market_cap: Record<string, number>
  total_volume: Record<string, number>
  market_cap_percentage: Record<string, number>
  market_cap_change_percentage_24h_usd: number
  active_cryptocurrencies: number
  markets: number
  updated_at: number
}

export async function GET() {
  try {
    const data = await cgFetch<{ data: GlobalData }>("/global")
    return NextResponse.json(data.data)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Global stats failed"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
