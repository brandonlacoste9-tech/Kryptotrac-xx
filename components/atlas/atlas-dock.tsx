"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { X, Minimize2, Maximize2, Bell, Zap, Cpu } from 'lucide-react'
import { haptics } from '@/lib/haptics'

export function AtlasDock() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState("")
  const [unreadTips, setUnreadTips] = useState(0)
  const [activeTip, setActiveTip] = useState<any>(null)

  useEffect(() => {
    const checkTips = async () => {
      try {
        const res = await fetch('/api/bb/tips')

        // Silently handle unauthorized (guest) or other non-ok states
        if (!res.ok) {
          if (res.status === 401) return
          // eslint-disable-next-line no-console
          console.warn('[APEX Dock] Failed to fetch tips:', res.status)
          return
        }

        const data = await res.json()
        if (data.tips && data.tips.length > 0) {
          setUnreadTips(data.tips.length)
          const latestTip = data.tips[0]
          setActiveTip(latestTip)
          haptics.bbTip()
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[APEX Dock] Error checking tips:', error)
      }
    }

    checkTips()
    const interval = setInterval(checkTips, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async () => {
    if (!query.trim()) return

    setLoading(true)
    setResponse("")

    try {
      const res = await fetch("/api/atlas/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, mode: "friend", persona: "bb" }),
      })

      const data = await res.json()
      setResponse(data.error || data.response)
    } catch (error) {
      setResponse("Failed to reach APEX. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const markTipAsRead = async (tipId: string) => {
    try {
      await fetch('/api/bb/tips', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipId }),
      })
      setUnreadTips((prev) => Math.max(0, prev - 1))
      setActiveTip(null)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[APEX Dock] Failed to mark tip as read:', error)
    }
  }

  const Screw = ({ className }: { className?: string }) => (
    <div className={`absolute w-3 h-3 rounded-full bg-neutral-700 shadow-inner flex items-center justify-center border border-neutral-600 z-20 ${className}`}>
      <div className="w-full h-[1px] bg-neutral-900 rotate-45" />
      <div className="w-full h-[1px] bg-neutral-900 -rotate-45 absolute" />
    </div>
  )

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true)
          haptics.bbWelcome()
        }}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-[#0a0b1e]/90 backdrop-blur-md text-[#00f3ff] shadow-[0_0_20px_rgba(0,243,255,0.3)] border-2 border-[#00f3ff]/50 transition-all hover:scale-110 z-50 relative flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-[#00f3ff] focus:ring-offset-2 focus:ring-offset-black overflow-hidden"
        aria-label="Open APEX Assistant"
        title="Open APEX Assistant"
      >
        <div className="absolute inset-0 opacity-20 animate-[spin_10s_linear_infinite]"
             style={{ backgroundImage: 'repeating-conic-gradient(transparent 0deg, transparent 10deg, #00f3ff 10deg, #00f3ff 11deg)' }}></div>
        <Zap className="w-8 h-8 relative z-10 group-hover:drop-shadow-[0_0_8px_#00f3ff]" />
        {unreadTips > 0 && (
          <span className="absolute top-0 right-0 bg-[#ff0055] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse ring-2 ring-black font-mono z-20">
            {unreadTips}
          </span>
        )}
      </button>
    )
  }

  return (
    <Card
      className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] shadow-[0_0_30px_rgba(0,243,255,0.15)] z-50 overflow-hidden border-2 border-[#333] bg-[#0a0b1e]/85 backdrop-blur-xl text-[#00f3ff] font-mono rounded-3xl"
    >
      {/* Decorative Screws */}
      <Screw className="top-3 left-3" />
      <Screw className="top-3 right-3" />
      <Screw className="bottom-3 left-3" />
      <Screw className="bottom-3 right-3" />

      {/* Internal "Circuit" Background Layer */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, #00f3ff 1px, transparent 1px),
            linear-gradient(0deg, transparent 24%, rgba(0, 243, 255, .3) 25%, rgba(0, 243, 255, .3) 26%, transparent 27%, transparent 74%, rgba(0, 243, 255, .3) 75%, rgba(0, 243, 255, .3) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(0, 243, 255, .3) 25%, rgba(0, 243, 255, .3) 26%, transparent 27%, transparent 74%, rgba(0, 243, 255, .3) 75%, rgba(0, 243, 255, .3) 76%, transparent 77%, transparent)
          `,
          backgroundSize: '30px 30px, 60px 60px, 60px 60px'
        }}
      />

      {/* Header Display */}
      <div className="flex items-center justify-between border-b border-[#00f3ff]/30 pb-3 mb-2 p-5 pt-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
             <div className="w-3 h-3 bg-[#00f3ff] rounded-full shadow-[0_0_10px_#00f3ff] animate-pulse" />
             <div className="absolute -inset-1 border border-[#00f3ff]/50 rounded-full animate-[spin_4s_linear_infinite]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-[2px] text-xs text-white">APEX<span className="text-[#00f3ff]">.OS</span></span>
            <span className="text-[9px] text-[#00f3ff]/60">SYSTEM ONLINE</span>
          </div>
          {unreadTips > 0 && (
            <span className="flex items-center gap-1 text-[9px] bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/50 px-1.5 py-0.5 rounded ml-2">
              <Bell className="w-3 h-3" />
              {unreadTips}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1 border border-[#00f3ff]/20">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-[#00f3ff]/20 text-[#00f3ff]/70 hover:text-[#00f3ff]"
            onClick={() => setIsMinimized(!isMinimized)}
            aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
            title={isMinimized ? "Maximize chat" : "Minimize chat"}
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-[#ff0055]/20 text-[#00f3ff]/70 hover:text-[#ff0055]"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
            title="Close chat"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-5 pt-0 space-y-4 max-h-[500px] overflow-y-auto relative z-10 pb-8">

          {/* Status Bar */}
          <div className="flex justify-between text-[9px] text-[#00f3ff]/40 uppercase tracking-widest border-b border-dashed border-[#00f3ff]/20 pb-2">
            <span>Mem: 64TB</span>
            <span>Net: Secure</span>
            <span>Bat: 100%</span>
          </div>

          {activeTip && (
            <div className="p-3 rounded bg-[#ff0055]/5 border border-[#ff0055]/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-[#ff0055]/20 to-transparent" />
              <div className="flex items-start justify-between gap-2 relative z-10">
                <div className="flex-1">
                  <p className="font-bold text-[#ff0055] mb-1 flex items-center gap-1 text-[10px] tracking-widest uppercase">
                    <Bell className="w-3 h-3" />
                    Priority Alert
                  </p>
                  <p className="text-[#ff0055]/90 text-xs leading-relaxed">{activeTip.message}</p>
                  {activeTip.disclaimer && (
                    <p className="text-[9px] text-[#ff0055]/60 mt-2 italic">{activeTip.disclaimer}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0 hover:bg-[#ff0055]/20 text-[#ff0055]"
                  onClick={() => markTipAsRead(activeTip.id)}
                  aria-label="Dismiss tip"
                  title="Dismiss tip"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-1 relative">
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#00f3ff]/30 rounded-r" />
            <Textarea
              placeholder="Input command..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[80px] bg-[#000]/30 border-[#00f3ff]/30 focus:border-[#00f3ff] text-[#00f3ff] placeholder:text-[#00f3ff]/20 rounded-lg focus-visible:ring-1 focus-visible:ring-[#00f3ff] text-xs resize-none backdrop-blur-sm"
              aria-label="Chat with APEX"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || !query.trim()}
            className="w-full bg-[#00f3ff]/10 hover:bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/50 rounded-lg hover:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all font-bold tracking-[2px] text-xs h-9"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Cpu className="w-3 h-3 animate-spin" />
                PROCESSING
              </span>
            ) : "EXECUTE"}
          </Button>

          {response && (
            <div className="space-y-1 animate-in slide-in-from-bottom-2 duration-300">
               <p className="text-[9px] opacity-60 tracking-widest uppercase pl-1">Output Stream</p>
              <div className="p-3 bg-[#00f3ff]/5 border border-[#00f3ff]/20 rounded-lg text-xs relative">
                {/* Scanline effect */}
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,243,255,0.05)_50%)] bg-[length:100%_4px] pointer-events-none rounded-lg" />
                <p className="whitespace-pre-wrap text-[#00f3ff]/90 leading-relaxed relative z-10">{response}</p>
              </div>
            </div>
          )}

          <div className="text-center pt-2">
            <a
              href="/atlas"
              className="text-[9px] text-[#00f3ff]/40 hover:text-[#00f3ff] uppercase tracking-widest transition-colors hover:underline decoration-dashed underline-offset-4"
              aria-label="Open full APEX interface"
            >
              [ ACCESS MAINFRAME ]
            </a>
          </div>
        </div>
      )}
    </Card>
  )
}
