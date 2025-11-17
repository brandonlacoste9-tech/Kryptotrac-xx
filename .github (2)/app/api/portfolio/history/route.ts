import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "30")

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { data: history, error } = await supabase
      .from("portfolio_snapshots")
      .select("total_value, total_pnl, pnl_percentage, snapshot_date")
      .eq("user_id", user.id)
      .order("snapshot_date", { ascending: true })
      .limit(days)

    if (error) throw error

    return NextResponse.json({
      success: true,
      history: history || [],
      count: history?.length || 0,
    })
  } catch (error) {
    console.error("[v0] Error fetching portfolio history:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
