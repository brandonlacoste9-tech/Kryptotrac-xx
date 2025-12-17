"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { X, Minimize2, Maximize2 } from 'lucide-react'
import { haptics } from '@/lib/haptics'

const BeeIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.5,8C19.5,8 21.5,5 21.5,5C21.5,5 18,5.5 18,5.5C17.5,3 15,2 12,2C9,2 6.5,3 6,5.5C6,5.5 2.5,5 2.5,5C2.5,5 4.5,8 4.5,8C2.5,9.5 2.5,12 2.5,12C2.5,12 4.5,13.5 4.5,15C2.5,16.5 2.5,19 2.5,19C2.5,19 6,18.5 6,18.5C6.5,21 9,22 12,22C15,22 17.5,21 18,18.5C18,18.5 21.5,19 21.5,19C21.5,19 21.5,16.5 19.5,15C21.5,13.5 23.5,12 23.5,12C23.5,12 21.5,9.5 19.5,8ZM8,10.5C7.2,10.5 6.5,9.8 6.5,9C6.5,8.2 7.2,7.5 8,7.5C8.8,7.5 9.5,8.2 9.5,9C9.5,9.8 8.8,10.5 8,10.5ZM12,19C10.5,19 9,18 9,16H15C15,18 13.5,19 12,19ZM16,10.5C15.2,10.5 14.5,9.8 14.5,9C14.5,8.2 15.2,7.5 16,7.5C16.8,7.5 17.5,8.2 17.5,9C17.5,9.8 16.8,10.5 16,10.5Z" />
    <path d="M9,12H15V14H9V12Z" fillOpacity="0.5" />
  </svg>
)

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
      setResponse("Bee is having trouble connecting. Try again.")
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
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-black"
        aria-label="Open Bee chat"
      >
        <BeeIcon className="w-10 h-10 group-hover:rotate-12 transition-transform drop-shadow-sm" />
      </button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] shadow-2xl z-50 overflow-hidden border-2 border-yellow-500/30 bg-black">
      <div className="bg-gradient-to-r from-yellow-500 to-amber-600 p-3 flex items-center justify-between text-black font-bold">
        <div className="flex items-center gap-2">
          <BeeIcon className="w-6 h-6" />
          <span>Ask Bee</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 hover:bg-black/10 text-black placeholder-black"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 hover:bg-black/10 text-black placeholder-black"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto bg-black">
          <Textarea
            placeholder="Ask Bee anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[80px] bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-yellow-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />

          <Button
            onClick={handleSubmit}
            disabled={loading || !query.trim()}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
            size="sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">🐝</span>
                Bee is thinking...
              </span>
            ) : "Ask Bee"}
          </Button>

          {response && (
            <div className="p-3 rounded-lg bg-zinc-900 text-sm border border-yellow-500/20 text-gray-200">
              <p className="whitespace-pre-wrap">{response}</p>
            </div>
          )}

          <p className="text-xs text-center text-muted-foreground">
            Bee helps you trade smarter. <a href="/atlas" className="underline hover:text-yellow-500">Full Dashboard</a>
          </p>
        </div>
      )}
    </Card>
  )
}
