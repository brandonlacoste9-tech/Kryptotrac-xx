"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWatchlist } from "@/hooks/use-watchlist"
import type { PriceAlert } from "@/types/crypto"

interface CreateAlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateAlert: (alert: Omit<PriceAlert, "id" | "createdAt">) => void
}

export function CreateAlertDialog({ open, onOpenChange, onCreateAlert }: CreateAlertDialogProps) {
  const { watchlist } = useWatchlist()
  const [coinId, setCoinId] = useState("")
  const [condition, setCondition] = useState<"above" | "below">("above")
  const [targetPrice, setTargetPrice] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!coinId || !targetPrice) return

    onCreateAlert({
      coinId,
      coinName: coinId.charAt(0).toUpperCase() + coinId.slice(1),
      condition,
      targetPrice: Number.parseFloat(targetPrice),
    })

    setCoinId("")
    setTargetPrice("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Price Alert</DialogTitle>
          <DialogDescription>Set a price threshold to get notified when reached</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coin">Cryptocurrency</Label>
            <Select value={coinId} onValueChange={setCoinId}>
              <SelectTrigger id="coin">
                <SelectValue placeholder="Select coin" />
              </SelectTrigger>
              <SelectContent>
                {watchlist.map((id) => (
                  <SelectItem key={id} value={id} className="capitalize">
                    {id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <Select value={condition} onValueChange={(v: any) => setCondition(v)}>
              <SelectTrigger id="condition">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="above">Price goes above</SelectItem>
                <SelectItem value="below">Price goes below</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Target Price (USD)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="50000"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Create Alert
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
