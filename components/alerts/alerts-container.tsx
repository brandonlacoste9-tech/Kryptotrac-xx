"use client"

import { useState } from "react"
import { AlertsList } from "./alerts-list"
import { CreateAlertDialog } from "./create-alert-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useAlerts } from "@/hooks/use-alerts"

export function AlertsContainer() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { alerts, addAlert, removeAlert } = useAlerts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Price Alerts</h1>
          <p className="text-muted-foreground mt-1">Get notified when prices hit your targets</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Alert
        </Button>
      </div>

      <AlertsList alerts={alerts} onRemove={removeAlert} />

      <CreateAlertDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreateAlert={(alert) => {
          addAlert(alert)
          setDialogOpen(false)
        }}
      />
    </div>
  )
}
