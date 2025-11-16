"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, X, Minimize2, Maximize2, Bell } from 'lucide-react'
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
        const data = await res.json()
        if (data.tips && data.tips.length > 0) {
          setUnreadTips(data.tips.length)
          // Show latest tip
          const latestTip = data.tips[0]
          setActiveTip(latestTip)
          // Trigger haptic
          haptics.bbTip()
        }
      } catch (error) {
        console.error('[BB Dock] Failed to check tips:', error)
      }
    }

    checkTips()
    const interval = setInterval(checkTips, 5 * 60 * 1000) // Check every 5 minutes

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
      setResponse("Failed to reach BB. Try again.")
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
      console.error('[BB Dock] Failed to mark tip as read:', error)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true)
          haptics.bbWelcome()
        }}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-lg bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50 bee-trail bb-hover relative flex items-center justify-center group"
        style={{
          clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)"
        }}
        aria-label="Open BB Assistant"
      >
        <span className="text-3xl group-hover:scale-110 transition-transform">🍯</span>
        {unreadTips > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse ring-2 ring-black">
            {unreadTips}
          </span>
        )}
      </button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] shadow-2xl z-50 overflow-hidden bb-cursor border-2 border-yellow-500/30 relative">
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(60deg, transparent, transparent 35px, rgba(255, 140, 0, 0.1) 35px, rgba(255, 140, 0, 0.1) 70px),
            repeating-linear-gradient(120deg, transparent, transparent 35px, rgba(255, 140, 0, 0.1) 35px, rgba(255, 140, 0, 0.1) 70px),
            repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(255, 140, 0, 0.1) 35px, rgba(255, 140, 0, 0.1) 70px)
          `
        }}
      />

      <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 p-3 flex items-center justify-between text-white relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐝</span>
          <span className="font-semibold">BB</span>
          {unreadTips > 0 && (
            <span className="flex items-center gap-1 text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-bold backdrop-blur-sm">
              <Bell className="w-3 h-3" />
              {unreadTips}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 hover:bg-white/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 hover:bg-white/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
          {activeTip && (
            <div className="p-3 rounded-lg bg-yellow-50 border-2 border-yellow-400 text-sm relative">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-yellow-900 mb-1 flex items-center gap-1">
                    <Bell className="w-3 h-3" />
                    BB noticed something 👀
                  </p>
                  <p className="text-yellow-800 whitespace-pre-wrap">{activeTip.message}</p>
                  <p className="text-xs text-yellow-700 mt-2 italic">{activeTip.disclaimer}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => markTipAsRead(activeTip.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <Textarea
            placeholder="Ask BB anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />

          <Button onClick={handleSubmit} disabled={loading || !query.trim()} className="w-full" size="sm">
            {loading ? "BB is thinking..." : "Ask BB"}
          </Button>

          {response && (
            <div className="p-3 rounded-lg bg-muted text-sm">
              <p className="whitespace-pre-wrap">{response}</p>
            </div>
          )}

          <p className="text-xs text-center text-muted-foreground">
            Quick BB assistance. <a href="/atlas" className="underline">Open full BB</a>
          </p>
        </div>
      )}
    </Card>
  )
}
