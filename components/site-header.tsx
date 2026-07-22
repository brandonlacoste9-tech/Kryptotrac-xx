"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, Briefcase, Star, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { CurrencyToggle } from "@/components/currency-toggle"

const links = [
  { href: "/", label: "Markets", icon: Activity },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/about", label: "About", icon: Info },
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent ring-1 ring-accent/30 font-bold text-sm">
            K
          </span>
          <span className="font-semibold tracking-tight">
            Krypto<span className="text-accent">Trac</span>
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs sm:text-sm font-medium transition-colors",
                  active
                    ? "bg-accent/15 text-accent"
                    : "text-muted hover:text-foreground hover:bg-white/5"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        <CurrencyToggle className="shrink-0" />
      </div>
    </header>
  )
}
