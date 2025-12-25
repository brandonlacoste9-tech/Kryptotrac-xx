'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { HardwareContainer } from '@/components/shared/hardware-container'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles, Mail, Send } from 'lucide-react'
import Link from 'next/link'

export default function MagicLinkPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        'https://lrjahamjvskjkfbucpdg.supabase.co/functions/v1/magic-link',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        }
      )

      if (response.ok) {
        setSent(true)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to send magic link')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <HardwareContainer>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm"
          >
            <div className="glass-panel p-8 text-center space-y-6 border border-primary/20 bg-primary/5 rounded-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-20">
                  <Sparkles className="w-24 h-24 text-primary" />
               </div>

              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto border border-primary/50 relative z-10">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              
              <div className="space-y-2 relative z-10">
                <h1 className="text-xl font-bold font-mono text-white">LINK_DISPATCHED</h1>
                <p className="text-sm text-muted-foreground font-mono">
                  Target: <span className="text-primary">{email}</span>
                </p>
                <p className="text-xs text-muted-foreground font-mono opacity-70">
                  Time-to-live: 60 minutes.
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full border-primary/20 hover:bg-primary/10 text-primary font-mono text-xs relative z-10"
                onClick={() => {
                  setSent(false)
                  setEmail('')
                }}
              >
                RETRY_TRANSMISSION
              </Button>
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono mb-4">
             <Sparkles className="w-3 h-3" />
             PASSWORDLESS_ENTRY
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-white">MAGIC LINK</h1>
          <p className="text-muted-foreground font-mono text-xs">Secure one-time access token.</p>
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

            <div className="mb-6">
              <Link href="/auth/login" className="inline-flex items-center text-[10px] font-mono text-muted-foreground hover:text-white transition-colors">
                <ArrowLeft className="w-3 h-3 mr-1" />
                ABORT_SEQUENCE
              </Link>
            </div>

            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-primary uppercase tracking-wider">Target // Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 font-mono text-sm"
                  placeholder="ENTER_ID..."
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border-l-2 border-red-500 text-red-500 text-xs font-mono">{error}</div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-bold tracking-wider hover:shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-all group"
              >
                {loading ? "TRANSMITTING..." : (
                  <span className="flex items-center gap-2">
                    SEND_LINK <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </HardwareContainer>
  )
}
