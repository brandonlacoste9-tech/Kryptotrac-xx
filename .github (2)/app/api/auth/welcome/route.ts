import { sendWelcomeEmail } from "@/lib/email"
import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Only send welcome email if user is authenticated
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Sending welcome email to:", email)
    const result = await sendWelcomeEmail({ to: email, name })

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] Welcome email API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
