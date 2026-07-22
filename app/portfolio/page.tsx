import type { Metadata } from "next"
import PortfolioPage from "@/components/portfolio-page"
import { siteUrl } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Crypto portfolio tracker (private browser storage)",
  description:
    "Manage crypto holdings with cost basis, P&L, allocation, transaction history, and sell tools. Data stays in your browser — free and private.",
  alternates: { canonical: `${siteUrl()}/portfolio` },
  openGraph: {
    title: "Private crypto portfolio · KryptoTrac",
    description:
      "Holdings, cost basis, allocation, and history — stored only on your device.",
    url: `${siteUrl()}/portfolio`,
  },
}

export default function Page() {
  return <PortfolioPage />
}
