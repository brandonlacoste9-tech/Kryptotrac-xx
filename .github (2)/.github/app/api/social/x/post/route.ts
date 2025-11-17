import { NextRequest, NextResponse } from "next/server"
import { postToX } from "@/lib/x"
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

    // Check subscription tier
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("plan_type")
      .eq("user_id", user.id)
      .single()

    const tier = subscription?.plan_type || "free"

    // Only Pro / Elite can have ATLAS draft or post to X
    if (tier !== "pro" && tier !== "elite") {
      return NextResponse.json(
        { error: "Upgrade to Pro to unlock X autopost" },
        { status: 402 }
      )
    }

    const body = await req.json()
    const text: string = body.text

    if (!text || text.length < 10) {
      return NextResponse.json({ error: "Post is too short" }, { status: 400 })
    }

    if (text.length > 280) {
      return NextResponse.json({ error: "Post exceeds X character limit" }, { status: 400 })
    }

    const result = await postToX({ text })

    return NextResponse.json({
      ok: result.ok,
      id: result.id,
    })
  } catch (err) {
    console.error("X post error", err)
    return NextResponse.json({ error: "Failed to post to X" }, { status: 500 })
  }
}
