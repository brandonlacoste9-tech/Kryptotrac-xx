import { NextResponse } from "next/server"
import { cgFetch } from "@/lib/coingecko"

export const dynamic = "force-dynamic"

/** USD→CAD rate from dual-quote bitcoin prices */
export async function GET() {
  try {
    const data = await cgFetch<Record<string, { usd: number; cad: number }>>(
      "/simple/price",
      { ids: "bitcoin", vs_currencies: "usd,cad" }
    )
    const btc = data.bitcoin
    if (!btc?.usd || !btc?.cad) {
      return NextResponse.json({ usdToCad: 1.35, source: "fallback" })
    }
    const usdToCad = btc.cad / btc.usd
    return NextResponse.json({ usdToCad, source: "coingecko" })
  } catch {
    return NextResponse.json({ usdToCad: 1.35, source: "fallback" })
  }
}
