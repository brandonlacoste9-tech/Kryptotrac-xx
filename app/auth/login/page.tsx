"use client"

import type React from "react"

import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { HardwareContainer } from "@/components/shared/hardware-container"
import { motion } from "framer-motion"
import { Lock, Cpu, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createBrowserClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  async function handleGoogleLogin() {
    setLoading(true)
    setError("")

    const supabase = createBrowserClient()
    const redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`
    
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      }
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
    }
  }

  return (
    <HardwareContainer>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono mb-4">
             <Lock className="w-3 h-3" />
             SECURE_GATEWAY_V1
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-white">AUTHENTICATE</h1>
          <p className="text-muted-foreground font-mono text-xs">Enter credentials to access neural net.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-sm"
        >
          <div className="glass-panel p-6 border border-white/10 rounded-xl relative overflow-hidden">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/50" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/50" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/50" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/50" />

            <form onSubmit={handleLogin} className="space-y-4 relative z-10">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-primary uppercase tracking-wider">Identity // Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 font-mono text-sm"
                  placeholder="OPTIONAL_ID..."
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-primary uppercase tracking-wider">Key // Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 font-mono text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border-l-2 border-red-500 text-red-500 text-xs font-mono">{error}</div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-bold tracking-wider hover:shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-all"
              >
                {loading ? "DECRYPTING..." : "INIT_SESSION"}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px bg-white/5 flex-1" />
              <span className="text-[10px] text-muted-foreground font-mono">ALT_ACCESS</span>
              <div className="h-px bg-white/5 flex-1" />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white font-mono text-xs h-10"
            >
              <Cpu className="w-4 h-4 mr-2 text-white/50" />
              AUTH_GOOGLE
            </Button>

            <div className="mt-6 text-center">
              <Link 
                href="/auth/magic-link"
                className="text-[10px] text-muted-foreground hover:text-primary transition-colors font-mono border-b border-transparent hover:border-primary/50 pb-0.5"
              >
                USE_MAGIC_LINK_PROTOCOL
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center">
             <Link href="/auth/signup" className="group inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-white transition-colors">
               <span>NO_CREDENTIALS_FOUND</span>
               <span className="text-primary group-hover:underline decoration-primary/50 underline-offset-4">REGISTER_NEW_ID</span>
               <ArrowRight className="w-3 h-3 text-primary group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>

        </motion.div>
      </div>
    </HardwareContainer>
  )
}
