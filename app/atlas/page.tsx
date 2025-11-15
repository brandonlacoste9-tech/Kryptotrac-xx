"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Sparkles, MessageSquare, TrendingUp, Shield, Send } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

const modes = [
  { value: "friend", label: "Chill", icon: MessageSquare, color: "text-blue-500" },
  { value: "analysis", label: "Analyst", icon: TrendingUp, color: "text-green-500" },
  { value: "alpha", label: "Alpha Hunter", icon: Sparkles, color: "text-yellow-500" },
  { value: "sentiment", label: "Risk Guardian", icon: Shield, color: "text-red-500" },
]

export default function AtlasPage() {
  const [query, setQuery] = useState("")
  const [mode, setMode] = useState("analysis")
  const [persona, setPersona] = useState("bb") // BB is now default
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState("")
  const [councilMode, setCouncilMode] = useState(false)
  const [vibe, setVibe] = useState<any>(null)
  const [rateLimit, setRateLimit] = useState<any>(null)
  const [xDraft, setXDraft] = useState("")
  const [postingToX, setPostingToX] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!query.trim()) return

    setLoading(true)
    setResponse("")
    setVibe(null)
    setXDraft("")

    try {
      const endpoint = councilMode ? "/api/atlas/council" : "/api/atlas/query"
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, mode, persona }),
      })

      const data = await res.json()

      if (!res.ok) {
        setResponse(`Error: ${data.error}`)
        return
      }

      setResponse(data.response)
      setVibe(data.vibe)
      setRateLimit(data.rateLimit)
      if (data.xDraft) {
        setXDraft(data.xDraft)
      }
    } catch (error) {
      setResponse("Failed to get response from ATLAS. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePostToX = async () => {
    if (!xDraft.trim()) return

    setPostingToX(true)
    try {
      const res = await fetch("/api/social/x/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: xDraft }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          title: "Failed to post",
          description: data.error || "Could not post to X",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Posted to X!",
        description: "Your ATLAS insight has been shared.",
      })
      setXDraft("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post to X. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPostingToX(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          3I/ATLAS Assistant
        </h1>
        <p className="text-muted-foreground">
          Your crypto AI companion. Brutally honest, actually smart.
        </p>
      </div>

      <Card className="p-6 mb-6 bg-card/50 backdrop-blur border-border/50">
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Persona</label>
          <div className="flex gap-2">
            <Button
              variant={persona === "bb" ? "default" : "outline"}
              onClick={() => setPersona("bb")}
              size="sm"
            >
              BB
            </Button>
            <Button
              variant={persona === "satoshi" ? "default" : "outline"}
              onClick={() => setPersona("satoshi")}
              size="sm"
            >
              Satoshi
            </Button>
            <Button
              variant={persona === "default" ? "default" : "outline"}
              onClick={() => setPersona("default")}
              size="sm"
            >
              Default
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {persona === "bb" && "Friendly, simple, emotionally-aware"}
            {persona === "satoshi" && "Smart friend with degen energy"}
            {persona === "default" && "Formal analytical mode"}
          </p>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Select Mode</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {modes.map((m) => (
              <Button
                key={m.value}
                variant={mode === m.value ? "default" : "outline"}
                onClick={() => setMode(m.value)}
                className="flex items-center gap-2"
              >
                <m.icon className={`w-4 h-4 ${mode === m.value ? "" : m.color}`} />
                {m.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Council Mode (Pro/Elite)
          </label>
          <Button
            variant={councilMode ? "default" : "outline"}
            onClick={() => setCouncilMode(!councilMode)}
            size="sm"
          >
            {councilMode ? "Council Active" : "Single Model"}
          </Button>
        </div>

        <Textarea
          placeholder="Ask ATLAS anything... Market analysis, sentiment check, alpha opportunities, risk assessment..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-4 min-h-[120px]"
        />

        <Button onClick={handleSubmit} disabled={loading || !query.trim()} className="w-full">
          {loading ? "ATLAS is thinking..." : "Ask ATLAS"}
        </Button>
      </Card>

      {response && (
        <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20">
              <Sparkles className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold">ATLAS Response</h3>
              <p className="text-xs text-muted-foreground">
                {councilMode ? "Multi-Model Council" : modes.find((m) => m.value === mode)?.label} · {persona === "bb" ? "BB" : persona === "satoshi" ? "Satoshi" : "Default"}
              </p>
            </div>
          </div>
          <div className="prose prose-invert max-w-none mb-4">
            <p className="whitespace-pre-wrap">{response}</p>
          </div>

          {vibe && (
            <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                ATLAS Vibe Engine
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Sentiment:</span>{" "}
                  <span className="font-medium">{vibe.sentiment}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Risk Level:</span>{" "}
                  <span className="font-medium">{vibe.riskLevel}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Signal Strength:</span>{" "}
                  <span className="font-medium">{vibe.signalStrength}%</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {xDraft && (
        <Card className="mt-4 p-6 bg-card/50 backdrop-blur border-orange-500/50">
          <div className="flex items-start gap-3 mb-3">
            <Send className="w-5 h-5 text-orange-500" />
            <div>
              <h3 className="font-semibold">X Draft (Pro/Elite)</h3>
              <p className="text-xs text-muted-foreground">
                ATLAS generated this for you. Edit and post to X.
              </p>
            </div>
          </div>
          <Textarea
            value={xDraft}
            onChange={(e) => setXDraft(e.target.value)}
            className="mb-3"
            rows={4}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {xDraft.length}/280 characters
            </span>
            <Button
              onClick={handlePostToX}
              disabled={postingToX || xDraft.length > 280 || xDraft.length < 10}
              size="sm"
            >
              {postingToX ? "Posting..." : "Post to X"}
            </Button>
          </div>
        </Card>
      )}

      <div className="mt-8 p-4 border border-border/50 rounded-lg bg-muted/20">
        <h4 className="font-semibold mb-2 text-sm">Rate Limits</h4>
        {rateLimit && (
          <div className="mb-3 p-2 bg-card rounded text-sm">
            <span className="text-muted-foreground">Remaining today:</span>{" "}
            <span className="font-bold">
              {rateLimit.limit === -1 ? "Unlimited" : `${rateLimit.remaining}/${rateLimit.limit}`}
            </span>
          </div>
        )}
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>Free: 20 messages/day</li>
          <li>Starter: 200 messages/day</li>
          <li>Pro: Unlimited + Council Mode</li>
          <li>Elite: Unlimited + Council + X Integration</li>
        </ul>
      </div>
    </div>
  )
}
