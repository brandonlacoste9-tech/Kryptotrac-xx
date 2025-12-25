export interface Product {
  id: string
  name: string
  description: string
  priceId: string
  priceInCents: number
  features: string[]
}

export const PRODUCTS: Product[] = [
  {
    id: "pro",
    name: "PRO_FIRMWARE",
    description: "Full hardware acceleration and AI access",
    priceId: process.env.STRIPE_PRICE_ID_PRO_MONTHLY || "price_pro_monthly",
    priceInCents: 499, // $4.99
    features: [
      "Unlimited price alerts",
      "Email notifications",
      "Advanced portfolio analytics",
      "Historical performance tracking",
      "Ad-free experience",
      "Priority support",
      "Export portfolio data",
      "Early access to new features",
    ],
  },
]
