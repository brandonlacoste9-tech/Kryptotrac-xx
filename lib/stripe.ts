import "server-only"
import Stripe from "stripe"
import { taintEnvironmentVariables } from "./taint"

// Taint sensitive Stripe secrets to prevent accidental exposure to client
taintEnvironmentVariables([
  { name: 'STRIPE_SECRET_KEY', value: process.env.STRIPE_SECRET_KEY },
  { name: 'STRIPE_WEBHOOK_SECRET', value: process.env.STRIPE_WEBHOOK_SECRET },
])

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

export const STRIPE_PRICE_ID_PRO_MONTHLY = process.env.STRIPE_PRICE_ID_PRO_MONTHLY || "price_pro_monthly"
