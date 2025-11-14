"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Plus, Bell, Trash2 } from 'lucide-react'
import { AddAlertDialog } from "./add-alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

type Alert = {
  id: string
  coin_id: string
  coin_name: string
  coin_symbol: string
  target_price: number
  condition: "above" | "below"
  is_triggered: boolean
  created_at: string
}

export function AlertsContainer({ userId, isPro }: { userId: string; isPro: boolean }) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const supabase = createBrowserClient()

  const alertLimit = isPro ? 999 : 5

  async function loadAlerts() {
    const { data, error } = await supabase
      .from("price_alerts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setAlerts(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadAlerts()
  }, [])

  async function deleteAlert(id: string) {
    await supabase.from("price_alerts").delete().eq("id", id)
    setAlerts(alerts.filter((a) => a.id !== id))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/60">
          {alerts.length} / {isPro ? "Unlimited" : alertLimit} alerts
          {!isPro && alerts.length >= alertLimit && <span className="ml-2 text-red-500">(Limit reached)</span>}
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          disabled={!isPro && alerts.length >= alertLimit}
          className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Alert
        </Button>
      </div>

      {!isPro && alerts.length >= alertLimit && (
        <div className="glass-card-red p-4 text-center space-y-2">
          <p className="text-white/80">You've reached the free alert limit</p>
          <Link href="/pricing">
            <Button variant="outline" size="sm">
              Upgrade to Pro
            </Button>
          </Link>
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4">
          <Bell className="w-16 h-16 mx-auto text-white/40" />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">No alerts yet</h3>
            <p className="text-white/60">Create your first price alert to get notified via email</p>
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Alert
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${alert.is_triggered ? "bg-green-500" : "bg-red-500"}`} />
                <div>
                  <div className="font-semibold">
                    {alert.coin_name} ({alert.coin_symbol.toUpperCase()})
                  </div>
                  <div className="text-sm text-white/60">
                    Alert when price goes {alert.condition} ${alert.target_price.toLocaleString()}
                  </div>
                  {alert.is_triggered && <div className="text-xs text-green-500 mt-1">✓ Alert triggered</div>}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteAlert(alert.id)}
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <AddAlertDialog open={showAddDialog} onOpenChange={setShowAddDialog} userId={userId} onAlertAdded={loadAlerts} />
    </div>
  )
}
