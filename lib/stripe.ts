import "server-only"
import Stripe from "stripe"
import { taintEnvironmentVariables } from "./taint"

// Taint sensitive Stripe secrets to prevent accidental exposure to client
taintEnvironmentVariables([
  { name: 'STRIPE_SECRET_KEY', value: process.env.STRIPE_SECRET_KEY },
  { name: 'STRIPE_WEBHOOK_SECRET', value: process.env.STRIPE_WEBHOOK_SECRET },
])

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: "2025-10-29.clover",
  typescript: true,
})

// Optimized Pricing Structure - 2 Tier Model
// Pro tier: $12/mo (competitive vs $29-59 competitors)
export const STRIPE_PRICE_ID_PRO_MONTHLY = process.env.STRIPE_PRICE_ID_PRO_MONTHLY || "price_pro_monthly"
export const STRIPE_PRICE_ID_PRO_YEARLY = process.env.STRIPE_PRICE_ID_PRO_YEARLY || "price_pro_yearly"

// Legacy support (will be migrated)
export const STRIPE_PRICE_ID_ELITE_MONTHLY = process.env.STRIPE_PRICE_ID_ELITE_MONTHLY
export const STRIPE_PRICE_ID_ELITE_YEARLY = process.env.STRIPE_PRICE_ID_ELITE_YEARLY
