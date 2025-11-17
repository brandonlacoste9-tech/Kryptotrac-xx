"use client"

import { useState } from "react"
import { MessageCircle, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"

export function FeedbackPrompt() {
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!feedback.trim()) return

    try {
      // TODO: Send to analytics or feedback collection endpoint
      console.log("[v0] Feedback submitted:", feedback)
      setSubmitted(true)
      setTimeout(() => {
        setIsOpen(false)
        setSubmitted(false)
        setFeedback("")
      }, 2000)
    } catch (error) {
      console.error("[v0] Failed to submit feedback:", error)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/50 hover:shadow-red-500/70 flex items-center justify-center transition-all hover:scale-110 z-50"
        aria-label="Provide feedback"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 p-4 bg-black/95 border-red-500/20 shadow-2xl z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white">Quick Feedback</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {submitted ? (
        <div className="text-center py-4">
          <p className="text-green-400 font-medium">Thanks for your feedback!</p>
          <p className="text-sm text-gray-400 mt-1">We'll use it to improve KryptoTrac</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-3">What would you improve?</p>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts..."
            className="mb-3 bg-black/50 border-white/10 text-white placeholder:text-gray-500"
            rows={4}
          />
          <Button
            onClick={handleSubmit}
            disabled={!feedback.trim()}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            Send Feedback
          </Button>
        </>
      )}
    </Card>
  )
}
