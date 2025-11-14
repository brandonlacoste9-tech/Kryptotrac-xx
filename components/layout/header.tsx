"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { ProBadge } from "@/components/ui/pro-badge"
import { Settings } from 'lucide-react'

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [isPro, setIsPro] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)

      if (data.user) {
        supabase
          .from("subscriptions")
          .select("status")
          .eq("user_id", data.user.id)
          .eq("status", "active")
          .single()
          .then(({ data: sub }) => {
            setIsPro(!!sub)
          })
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        supabase
          .from("subscriptions")
          .select("status")
          .eq("user_id", session.user.id)
          .eq("status", "active")
          .single()
          .then(({ data: sub }) => {
            setIsPro(!!sub)
          })
      } else {
        setIsPro(false)
      }
    })

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const handleSignOut = async () => {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
  }

  return (
    <header
      className={`border-b border-red-500/20 sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/95 backdrop-blur-md shadow-lg shadow-black/50" : "bg-black/80 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="text-2xl font-bold bg-gradient-to-r from-red-500 via-red-400 to-white bg-clip-text text-transparent">
            ⚡ KryptoTrac
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          {user ? (
            <>
              <Link href="/" className="text-sm font-medium text-white/80 hover:text-red-400 transition-colors">
                Portfolio
              </Link>
              <Link href="/market" className="text-sm font-medium text-white/80 hover:text-red-400 transition-colors">
                Market
              </Link>
              <Link href="/alerts" className="text-sm font-medium text-white/80 hover:text-red-400 transition-colors">
                Alerts
              </Link>
              <Link href="/about" className="text-sm font-medium text-white/80 hover:text-red-400 transition-colors">
                About
              </Link>
              {!isPro && (
                <Link
                  href="/pricing"
                  className="text-sm font-medium text-white/80 hover:text-red-400 transition-colors"
                >
                  Pricing
                </Link>
              )}
              {isPro && <ProBadge />}
              <Link href="/settings" className="text-white/80 hover:text-red-400 transition-colors" title="Settings">
                <Settings className="w-5 h-5" />
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm font-medium text-white/80 hover:text-red-400 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/about" className="text-sm font-medium text-white/80 hover:text-red-400 transition-colors">
                About
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-white/80 hover:text-red-400 transition-colors">
                Pricing
              </Link>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-white/80 hover:text-red-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex h-9 items-center justify-center rounded-md bg-gradient-to-r from-red-600 to-red-500 px-6 text-sm font-medium text-white shadow-lg shadow-red-500/50 hover:shadow-red-500/70 transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
