"use client"

import type React from "react"

import { useState, Suspense } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from 'next/navigation'
import Link from "next/link"
import { logger } from "@/lib/logger"
import { HardwareContainer } from "@/components/shared/hardware-container"
import { motion } from "framer-motion"
import { KeyRound, Radio, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

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

    logger.debug("Attempting signup", { email, hasRefCode: !!refCode })

    const redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`
    logger.debug("Email redirect URL", { redirectUrl })

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

    logger.debug("Signup result", {
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
            if (!res.ok) logger.error("Welcome email failed", { status: res.statusText })
            else logger.info("Welcome email sent successfully", { email: data.user.email })
          })
          .catch((err) => logger.error("Failed to send welcome email", { error: err }))

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
              if (!res.ok) logger.error("Referral processing failed", { status: res.statusText, refCode })
              else logger.info("Referral processed successfully", { userId: data.user.id, refCode })
            })
            .catch((err) => logger.error("Failed to process referral", { error: err, refCode }))
        }
      }
    }
  }

  async function handleGoogleSignup() {
    setLoading(true)
    setError("")

    const supabase = createBrowserClient()
    const redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`

    const { error: signUpError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <HardwareContainer>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm"
          >
            <div className="glass-panel p-8 text-center space-y-6 border border-primary/20 bg-primary/5 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto border border-primary/50 relative">
                <div className="absolute inset-0 rounded-full animate-ping bg-primary/20 opacity-75" />
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h1 className="text-xl font-bold font-mono text-white">CONFIRM_LINK_SENT</h1>
                <p className="text-sm text-muted-foreground font-mono">
                  Decrypt your email inbox to verify digital signature.
                </p>
              </div>
              
              {refCode && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded font-mono text-xs">
                  <p className="text-green-400">CREDIT_BONUS_PENDING :: $5.00</p>
                </div>
              )}
              
              <Link href="/auth/login" className="inline-block text-primary text-xs font-mono hover:underline underline-offset-4 decoration-primary/50">
                &lt;&lt; RETURN_TO_LOGIN
              </Link>
            </div>
          </motion.div>
        </div>
      </HardwareContainer>
    )
  }

  return (
    <HardwareContainer>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-mono mb-4">
             <KeyRound className="w-3 h-3" />
             NEW_USER_REGISTRATION
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-white">SYSTEM INIT</h1>
          <p className="text-muted-foreground font-mono text-xs">Establish new neural link identity.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-sm"
        >
          <div className="glass-panel p-6 border border-white/10 rounded-xl relative overflow-hidden">
             {/* Corner Accents - Accent Color */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-accent/50" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-accent/50" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-accent/50" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-accent/50" />

            {refCode && (
              <div className="mb-6 p-2 bg-orange-500/10 border border-orange-500/20 rounded flex items-center gap-2 justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                <p className="text-orange-400 text-[10px] font-mono tracking-wider">REFERRAL_DETECTED :: $5.00 CREDIT</p>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white font-mono text-xs h-10 mb-6"
            >
              <Radio className="w-4 h-4 mr-2 text-white/50" />
              REGISTER_WITH_GOOGLE
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs font-mono">
                <span className="px-2 bg-black text-muted-foreground">OR_MANUAL_ENTRY</span>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-accent uppercase tracking-wider">Identity // Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 font-mono text-sm"
                  placeholder="NEW_ID..."
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-accent uppercase tracking-wider">Key // Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 font-mono text-sm"
                  placeholder="MIN_6_CHARS"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border-l-2 border-red-500 text-red-500 text-xs font-mono">{error}</div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-accent/10 hover:bg-accent/20 border border-accent/20 text-accent font-bold tracking-wider hover:shadow-[0_0_15px_rgba(var(--accent),0.3)] transition-all"
              >
                {loading ? "INITIALIZING..." : "CREATE_IDENTITY"}
              </Button>
            </form>

            <div className="mt-6 text-center">
               <Link href="/auth/login" className="text-[10px] text-muted-foreground hover:text-white transition-colors font-mono">
                 EXISTING_USER? <span className="text-accent hover:underline decoration-accent/50 underline-offset-4">LOGIN_HERE</span>
               </Link>
            </div>

          </div>
        </motion.div>
      </div>
    </HardwareContainer>
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
