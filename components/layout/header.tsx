import { TrendingUp, Bell, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">KryptoTrac</h1>
          </Link>

          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/alerts">
                <Bell className="w-5 h-5" />
                <span className="sr-only">Alerts</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
