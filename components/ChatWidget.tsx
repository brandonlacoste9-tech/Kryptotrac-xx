"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { X, Minimize2, Maximize2 } from 'lucide-react'
import { haptics } from '@/lib/haptics'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState("")

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
      setResponse("Failed to reach ATLAS. Try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true)
          haptics.bbWelcome()
        }}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-red-600 via-red-500 to-orange-500 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
        aria-label="Open ATLAS chat"
      >
        <img 
          src="/images/kryptotrac-logo.svg" 
          alt="KryptoTrac" 
          className="w-10 h-10 group-hover:scale-110 transition-transform"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            e.currentTarget.parentElement!.innerHTML = '<span class="text-2xl">K</span>'
          }}
        />
      </button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] shadow-2xl z-50 overflow-hidden border-2 border-red-500/30 bg-black">
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 p-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <img src="/images/kryptotrac-logo.svg" alt="" className="w-6 h-6" />
          <span className="font-semibold">Ask ATLAS</span>
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
        <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto bg-black">
          <Textarea
            placeholder="Ask ATLAS anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[80px] bg-zinc-900 border-zinc-800"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />

          <Button onClick={handleSubmit} disabled={loading || !query.trim()} className="w-full bg-red-600 hover:bg-red-700" size="sm">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⚡</span>
                ATLAS is thinking...
              </span>
            ) : "Ask ATLAS"}
          </Button>

          {response && (
            <div className="p-3 rounded-lg bg-zinc-900 text-sm border border-red-500/20">
              <p className="whitespace-pre-wrap">{response}</p>
            </div>
          )}

          <p className="text-xs text-center text-muted-foreground">
            Quick ATLAS chat. <a href="/atlas" className="underline hover:text-red-500">Open full ATLAS</a>
          </p>
        </div>
      )}
    </Card>
  )
}
