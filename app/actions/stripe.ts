"use server"
import { createServerClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"

export async function createCheckoutSession(plan: "starter" | "pro" | "elite", billingCycle: "monthly" | "yearly" = "monthly") {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Not authenticated" }
    }

    const pricing = {
      starter: { monthly: 500, yearly: 5000, name: "KryptoTrac Starter" },
      pro: { monthly: 1000, yearly: 10000, name: "KryptoTrac Pro" },
      elite: { monthly: 2000, yearly: 20000, name: "KryptoTrac Elite" },
    }

    const selectedPlan = pricing[plan]
    const amount = billingCycle === "yearly" ? selectedPlan.yearly : selectedPlan.monthly

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: selectedPlan.name,
              description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} plan with ${billingCycle} billing`,
            },
            unit_amount: amount,
            recurring: {
              interval: billingCycle === "yearly" ? "year" : "month",
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
        plan,
        billing_cycle: billingCycle,
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

    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single()

    if (!subscription?.stripe_customer_id) {
      return { error: "No active subscription found" }
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || process.env.NEXT_PUBLIC_SUPABASE_URL}/dashboard`,
    })

    return { url: session.url }
  } catch (error) {
    console.error("[v0] Portal session error:", error)
    return { error: "Failed to create portal session" }
  }
}
