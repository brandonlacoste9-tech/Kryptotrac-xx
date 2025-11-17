"use client"

import type React from "react"

import { useState, Suspense } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from 'next/navigation'
import Link from "next/link"

function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const refCode = searchParams.get('ref')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createBrowserClient()

    console.log("[v0] Attempting signup with:", { email, hasRefCode: !!refCode })
    
    const redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`
    console.log("[v0] Email redirect URL:", redirectUrl)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          referred_by: refCode || null
        }
      },
    })

    console.log("[v0] Signup result:", { 
      success: !signUpError, 
      userId: data.user?.id,
      emailConfirmed: data.user?.email_confirmed_at,
      error: signUpError?.message 
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)

      if (data.user) {
        fetch("/api/auth/welcome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.user.email }),
        })
        .then(res => {
          if (!res.ok) console.error("[v0] Welcome email failed:", res.statusText)
          else console.log("[v0] Welcome email sent successfully")
        })
        .catch((err) => console.error("[v0] Failed to send welcome email:", err))
        
        if (refCode) {
          fetch("/api/referrals/process-signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              userId: data.user.id,
              refCode 
            }),
          })
          .then(res => {
            if (!res.ok) console.error("[v0] Referral processing failed:", res.statusText)
            else console.log("[v0] Referral processed successfully")
          })
          .catch((err) => console.error("[v0] Failed to process referral:", err))
        }
      }
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 space-y-6 text-center">
            <div className="text-5xl">✉️</div>
            <h1 className="text-2xl font-bold text-white">Check your email</h1>
            <p className="text-white/60">We've sent you a confirmation link. Click it to activate your account.</p>
            {refCode && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 font-medium">Bonus: You'll get $5 credits when you confirm your email!</p>
              </div>
            )}
            <Link href="/auth/login" className="inline-block text-red-400 hover:text-red-300">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">Get Started</h1>
            <p className="text-white/60">Create your KryptoTrac account</p>
            {refCode && (
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg mt-4">
                <p className="text-orange-400 text-sm font-medium">You'll get $5 free credits on signup!</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <p className="text-xs text-white/40 mt-1">Minimum 6 characters</p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 rounded-lg font-medium text-white shadow-lg shadow-red-500/50 hover:shadow-red-500/70 transition-all disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm text-white/60">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-red-400 hover:text-red-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="h-8 w-48 mx-auto bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-64 mx-auto bg-white/5 rounded animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="h-10 bg-white/5 rounded animate-pulse" />
              <div className="h-10 bg-white/5 rounded animate-pulse" />
              <div className="h-12 bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}
