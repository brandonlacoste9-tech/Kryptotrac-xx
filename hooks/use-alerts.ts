"use client"

import { useState, useEffect } from "react"
import type { PriceAlert } from "@/types/crypto"

const STORAGE_KEY = "kryptotrac_alerts"

export function useAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setAlerts(JSON.parse(stored))
    }
  }, [])

  const addAlert = (alert: Omit<PriceAlert, "id" | "createdAt">) => {
    const newAlert: PriceAlert = {
      ...alert,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    }
    setAlerts((prev) => {
      const updated = [...prev, newAlert]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const removeAlert = (id: string) => {
    setAlerts((prev) => {
      const updated = prev.filter((alert) => alert.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  return { alerts, addAlert, removeAlert }
}
