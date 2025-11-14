"use server"
import { createServerClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"
import { PRODUCTS } from "@/lib/products"

export async function createCheckoutSession(productId: string) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Not authenticated" }
    }

    const product = PRODUCTS.find((p) => p.id === productId)
    if (!product) {
      return { error: "Product not found" }
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: product.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/upgrade`,
      metadata: {
        user_id: user.id,
      },
    })

    return { url: session.url }
  } catch (error) {
    console.error("[v0] Stripe checkout error:", error)
    return { error: "Failed to create checkout session" }
  }
}

export async function createPortalSession() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Not authenticated" }
    }

    // Get customer ID from subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single()

    if (!subscription?.stripe_customer_id) {
      return { error: "No active subscription found" }
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/portfolio`,
    })

    return { url: session.url }
  } catch (error) {
    console.error("[v0] Portal session error:", error)
    return { error: "Failed to create portal session" }
  }
}
