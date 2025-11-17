"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Mail, CheckCircle } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

export function EmailPreferences({ userId, userEmail, isPro }: { userId: string; userEmail: string; isPro: boolean }) {
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [digestEnabled, setDigestEnabled] = useState(true)
  const [digestFrequency, setDigestFrequency] = useState<"daily" | "weekly">("weekly")
  const [timezone, setTimezone] = useState("America/New_York")
  const [testEmailSent, setTestEmailSent] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient()

  useEffect(() => {
    loadPreferences()
  }, [])

  async function loadPreferences() {
    try {
      const { data, error } = await supabase.from("digest_preferences").select("*").eq("user_id", userId).single()

      if (error && error.code !== "PGRST116") {
        console.error("[v0] Error loading preferences:", error)
        return
      }

      if (data) {
        setDigestEnabled(data.digest_enabled)
        setDigestFrequency(data.digest_frequency === "daily" ? "daily" : "weekly")
        setTimezone(data.timezone || "America/New_York")
      } else {
        // Create default preferences
        await supabase.from("digest_preferences").insert({
          user_id: userId,
          digest_enabled: true,
          digest_frequency: "weekly",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        })
      }
    } catch (error) {
      console.error("[v0] Error loading preferences:", error)
    } finally {
      setLoading(false)
    }
  }

  async function updateDigestEnabled(enabled: boolean) {
    setDigestEnabled(enabled)
    await supabase.from("digest_preferences").upsert(
      {
        user_id: userId,
        digest_enabled: enabled,
        digest_frequency: digestFrequency,
        timezone,
      },
      { onConflict: "user_id" },
    )
  }

  async function updateDigestFrequency(frequency: "daily" | "weekly") {
    if (frequency === "daily" && !isPro) {
      alert("Daily digests are only available for Pro users. Upgrade to enable!")
      return
    }
    setDigestFrequency(frequency)
    await supabase.from("digest_preferences").upsert(
      {
        user_id: userId,
        digest_enabled: digestEnabled,
        digest_frequency: frequency,
        timezone,
      },
      { onConflict: "user_id" },
    )
  }

  async function sendTestEmail() {
    setSendingTest(true)
    try {
      await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      })
      setTestEmailSent(true)
      setTimeout(() => setTestEmailSent(false), 3000)
    } catch (error) {
      console.error("Failed to send test email:", error)
    } finally {
      setSendingTest(false)
    }
  }

  if (loading) {
    return <div className="glass-card p-6">Loading preferences...</div>
  }

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Email Notifications</h2>
        <p className="text-white/60 text-sm">Configure how you receive notifications</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-white/10">
          <div className="space-y-1">
            <div className="font-medium text-white">Price Alerts</div>
            <div className="text-sm text-white/60">Receive email when your price alerts are triggered</div>
          </div>
          <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-white/10">
          <div className="space-y-1">
            <div className="font-medium text-white">Portfolio Digest</div>
            <div className="text-sm text-white/60">AI-powered daily or weekly portfolio summary</div>
          </div>
          <Switch checked={digestEnabled} onCheckedChange={updateDigestEnabled} />
        </div>

        {digestEnabled && (
          <div className="pl-4 space-y-3 border-l-2 border-red-500/30">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Frequency</label>
              <div className="flex gap-3">
                <Button
                  variant={digestFrequency === "weekly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateDigestFrequency("weekly")}
                  className={digestFrequency === "weekly" ? "bg-red-600" : "border-white/20"}
                >
                  Weekly (Free)
                </Button>
                <Button
                  variant={digestFrequency === "daily" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateDigestFrequency("daily")}
                  className={digestFrequency === "daily" ? "bg-red-600" : "border-white/20"}
                  disabled={!isPro}
                >
                  Daily {!isPro && "⭐ Pro"}
                </Button>
              </div>
              {!isPro && <p className="text-xs text-white/50">Daily digests require a Pro subscription</p>}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between py-3 border-b border-white/10">
          <div className="space-y-1">
            <div className="font-medium text-white">Product Updates</div>
            <div className="text-sm text-white/60">News about KryptoTrac features and updates</div>
          </div>
          <Switch checked={true} onCheckedChange={() => {}} />
        </div>
      </div>

      <div className="pt-4 border-t border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="font-medium text-white text-sm">Test Email Delivery</div>
            <div className="text-xs text-white/60">Send a test email to {userEmail}</div>
          </div>
          <Button
            onClick={sendTestEmail}
            disabled={sendingTest || testEmailSent}
            variant="outline"
            size="sm"
            className="border-white/20 bg-transparent"
          >
            {testEmailSent ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Sent!
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                {sendingTest ? "Sending..." : "Send Test"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
