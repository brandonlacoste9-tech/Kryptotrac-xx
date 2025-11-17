import { DataSourceBadge, PrivacyBadge } from "@/components/trust/data-source-badge"
import { Gift } from 'lucide-react'
import { createServerClient } from "@/lib/supabase/server"
import Link from "next/link"

export async function Footer() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <footer className="border-t border-border/40 mt-16 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-center gap-6">
          {user && (
            <Link
              href="/referrals"
              className="group flex items-center gap-3 rounded-full border-2 border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-red-600/10 px-6 py-3 transition-all hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20"
            >
              <Gift className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Refer & Earn</span>
                <span className="text-xs text-orange-400">Up to $200/month</span>
              </div>
            </Link>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4">
            <DataSourceBadge />
            <PrivacyBadge />
          </div>

          <div className="flex flex-col items-center gap-4">
            <a
              href="https://v0.dev/chat/ref/BLNPBF"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-full border border-border/40 bg-background/50 px-4 py-2 transition-all hover:border-primary/50 hover:bg-background/80"
            >
              <svg className="h-5 w-5 text-foreground" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Built with</span>
                <span className="font-semibold text-foreground">v0</span>
                <span className="text-xs text-muted-foreground">· Get $5 credit</span>
              </div>
            </a>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>v1.0.0</span>
              <span>·</span>
              <span>© {new Date().getFullYear()} KryptoTrac</span>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground max-w-2xl">
            Not financial advice. Prices for informational purposes only. Cryptocurrency investments carry risk. Always do your own
            research before making investment decisions.
          </p>
        </div>
      </div>
    </footer>
  )
}
