import { Metadata } from "next"
import PricingClient from "./pricing-client"

export const metadata: Metadata = {
  title: "KryptoTrac Pro - Pricing",
  description: "Upgrade to KryptoTrac Pro for unlimited alerts and advanced analytics",
}

export default function PricingPage() {
  return <PricingClient />
}
