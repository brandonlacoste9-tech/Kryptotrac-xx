"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Flame } from 'lucide-react'
import { Card } from "@/components/ui/card"

export function StreakTracker() {
  const [streak, setStreak] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStreak() {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("streak_count, last_active_date")
        .eq("user_id", user.id)
        .single()

      if (profile) {
        const today = new Date().toISOString().split("T")[0]
        const lastActive = profile.last_active_date

        if (lastActive === today) {
          setStreak(profile.streak_count || 0)
        } else {
          // Update streak logic
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().split("T")[0]

          if (lastActive === yesterdayStr) {
            // Continue streak
            const newStreak = (profile.streak_count || 0) + 1
            setStreak(newStreak)
            await supabase
              .from("profiles")
              .update({ streak_count: newStreak, last_active_date: today })
              .eq("user_id", user.id)
          } else {
            // Reset streak
            setStreak(1)
            await supabase
              .from("profiles")
              .update({ streak_count: 1, last_active_date: today })
              .eq("user_id", user.id)
          }
        }
      }

      setLoading(false)
    }

    fetchStreak()
  }, [])

  if (loading || streak === 0) return null

  return (
    <Card className="border-orange-500/20 bg-gradient-to-br from-orange-950/20 to-black p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500">
          <Flame className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Daily Streak</p>
          <p className="text-2xl font-bold text-white">
            {streak} {streak === 1 ? "day" : "days"}
          </p>
        </div>
      </div>
      {streak >= 7 && (
        <div className="mt-3 rounded-md bg-orange-500/10 border border-orange-500/20 px-3 py-2 text-xs text-orange-300">
          🔥 On fire! Keep it up to unlock rewards
        </div>
      )}
    </Card>
  )
}
