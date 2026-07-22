import type { Metadata } from "next"
import AlertsPage from "@/components/alerts-page"
import { siteUrl } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Crypto price alerts in your browser",
  description:
    "Set above/below price alerts for any coin. Browser notifications while KryptoTrac is open — no account required.",
  alternates: { canonical: `${siteUrl()}/alerts` },
  openGraph: {
    title: "Price alerts · KryptoTrac",
    description: "Local crypto price alerts with browser notifications.",
    url: `${siteUrl()}/alerts`,
  },
}

export default function Page() {
  return <AlertsPage />
}
