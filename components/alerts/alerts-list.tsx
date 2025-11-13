"use client"

import { Bell, TrendingUp, TrendingDown, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { PriceAlert } from "@/types/crypto"

interface AlertsListProps {
  alerts: PriceAlert[]
  onRemove: (id: string) => void
}

export function AlertsList({ alerts, onRemove }: AlertsListProps) {
  if (alerts.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No alerts yet</h3>
          <p className="text-muted-foreground">Create your first price alert to get notified</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Card key={alert.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {alert.condition === "above" ? (
                  <TrendingUp className="w-5 h-5 text-primary" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-destructive" />
                )}
                <div>
                  <p className="font-medium">{alert.coinName}</p>
                  <p className="text-sm text-muted-foreground">
                    Alert when price goes {alert.condition} ${alert.targetPrice.toLocaleString()}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onRemove(alert.id)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
