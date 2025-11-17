import { NextRequest, NextResponse } from "next/server"
import { fetchCryptoFeedForSymbols } from "@/lib/x"
import { createServerClient } from "@/lib/supabase/server"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const symbols: string[] = body.symbols ?? []

    const items = await fetchCryptoFeedForSymbols(symbols)
    return NextResponse.json({ items })
  } catch (err) {
    console.error("X feed error", err)
    return NextResponse.json({ error: "Failed to fetch X feed" }, { status: 500 })
  }
}
