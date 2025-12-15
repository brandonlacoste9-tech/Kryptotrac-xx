import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    // Validate Stripe credentials are available
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("[v0] Missing STRIPE_SECRET_KEY environment variable")
      return NextResponse.json(
        { error: "Payment system not configured. Please contact support." },
        { status: 503 }
      )
    }

    const supabase = await createServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get or create Stripe customer
    let customerId: string | undefined

    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single()

    if (subscription?.stripe_customer_id) {
      customerId = subscription.stripe_customer_id
    } else {
      // Create new Stripe customer
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            supabase_user_id: user.id,
          },
        })
        customerId = customer.id
      } catch (stripeError) {
        console.error("[v0] Failed to create Stripe customer:", stripeError)
        return NextResponse.json(
          { error: "Failed to initialize payment account" },
          { status: 500 }
        )
      }
    }

    // Create checkout session
    let session
    try {
      session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: "KryptoTrac Pro",
              description: "Unlimited alerts, AI insights, advanced analytics, and priority support",
            },
            unit_amount: 999, // $9.99 CAD
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || process.env.NEXT_PUBLIC_SUPABASE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || process.env.NEXT_PUBLIC_SUPABASE_URL}/pricing`,
      metadata: {
        user_id: user.id,
      },
    })
    } catch (stripeError) {
      console.error("[v0] Failed to create checkout session:", stripeError)
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("[v0] Checkout session error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
