"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { X, Minimize2, Maximize2 } from 'lucide-react'
import { haptics } from '@/lib/haptics'
import { motion, AnimatePresence } from "framer-motion"

const BeeIcon = ({ className, isThinking }: { className?: string, isThinking?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Wings - Flapping Animation */}
    <motion.g
      initial={{ rotate: 0, originX: 0.5, originY: 0.5 }}
      animate={{
        rotate: isThinking ? [0, 15, -15, 0] : [0, 5, -5, 0],
      }}
      transition={{
        duration: isThinking ? 0.2 : 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <path d="M19.5,8C19.5,8 21.5,5 21.5,5C21.5,5 18,5.5 18,5.5C17.5,3 15,2 12,2C9,2 6.5,3 6,5.5C6,5.5 2.5,5 2.5,5C2.5,5 4.5,8 4.5,8C2.5,9.5 2.5,12 2.5,12C2.5,12 4.5,13.5 4.5,15C2.5,16.5 2.5,19 2.5,19C2.5,19 6,18.5 6,18.5C6.5,21 9,22 12,22C15,22 17.5,21 18,18.5C18,18.5 21.5,19 21.5,19C21.5,19 21.5,16.5 19.5,15C21.5,13.5 23.5,12 23.5,12C23.5,12 21.5,9.5 19.5,8Z" fillOpacity="0.3" />
    </motion.g>

    {/* Body */}
    <path d="M8,10.5C7.2,10.5 6.5,9.8 6.5,9C6.5,8.2 7.2,7.5 8,7.5C8.8,7.5 9.5,8.2 9.5,9C9.5,9.8 8.8,10.5 8,10.5ZM12,19C10.5,19 9,18 9,16H15C15,18 13.5,19 12,19ZM16,10.5C15.2,10.5 14.5,9.8 14.5,9C14.5,8.2 15.2,7.5 16,7.5C16.8,7.5 17.5,8.2 17.5,9C17.5,9.8 16.8,10.5 16,10.5Z" />

    {/* Stripes */}
    <path d="M9,12H15V14H9V12Z" fillOpacity="0.8" />
    <path d="M10,2 H14 V4 H10 V2Z" fillOpacity="0.8" />
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

  return (
    <AnimatePresence>
      {!isOpen ? (
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setIsOpen(true)
            haptics.bbWelcome()
          }}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 text-black shadow-lg z-50 flex items-center justify-center group focus:outline-none ring-2 ring-yellow-500/50"
          style={{
            boxShadow: "0 0 20px rgba(245, 158, 11, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.4)"
          }}
          aria-label="Open Bee chat"
        >
          <BeeIcon className="w-10 h-10 drop-shadow-md text-black" />
          {/* Pulse Effect */}
          <span className="absolute inset-0 rounded-full bg-yellow-400 opacity-20 animate-ping"></span>
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] z-50"
        >
          <Card className="shadow-2xl overflow-hidden border-2 border-yellow-500/50 bg-black backdrop-blur-sm shadow-yellow-500/20">
            <div className={`bg-gradient-to-r from-yellow-500 to-amber-600 p-3 flex items-center justify-between text-black font-bold border-b border-yellow-600/50 ${loading ? 'animate-pulse' : ''}`}>
              <div className="flex items-center gap-2">
                <BeeIcon className="w-6 h-6" isThinking={loading} />
                <span>Ask Bee</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 hover:bg-black/10 text-black"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 hover:bg-black/10 text-black"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto bg-black/95">
                <Textarea
                  placeholder="Ask Bee anything..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-[80px] bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
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
                  className={`w-full font-bold transition-all duration-300 ${loading
                      ? "bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.6)]"
                      : "bg-yellow-500 hover:bg-yellow-400 text-black"
                    }`}
                  size="sm"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <BeeIcon className="w-5 h-5 animate-spin" isThinking={true} />
                      Thinking...
                    </span>
                  ) : "Ask Bee"}
                </Button>

                {response && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-zinc-900/80 text-sm border border-yellow-500/20 text-gray-200 shadow-inner"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <BeeIcon className="w-5 h-5 mt-1 text-yellow-500" />
                      <span className="font-bold text-yellow-500 text-xs uppercase tracking-wider">Bee says:</span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed">{response}</p>
                  </motion.div>
                )}

                <p className="text-xs text-center text-muted-foreground flex justify-center items-center gap-1">
                  Powered by <span className="font-mono text-yellow-500/80">KryptoTrac Bee</span>
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
