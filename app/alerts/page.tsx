import { AlertsContainer } from "@/components/alerts/alerts-container"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Price Alerts - KryptoTrac",
  description: "Manage your cryptocurrency price alerts",
}

export default function AlertsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 lg:py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Watchlist
            </Link>
          </Button>
        </div>
        <AlertsContainer />
      </main>
    </div>
  )
}
