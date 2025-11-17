"use client"

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, TrendingUp, Users, DollarSign, TrendingDown } from 'lucide-react'

interface AnalyticsData {
  active_subscribers: number
  mrr: number
  churn_rate: number
  mrr_by_plan: Record<string, number>
  timestamp: string
}

export function SubscriptionAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/admin/analytics')

        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`)
        }

        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 60000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!data) {
    return <Alert><AlertDescription>No data available</AlertDescription></Alert>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Subscribers</p>
              <p className="text-3xl font-bold mt-2">{data.active_subscribers}</p>
            </div>
            <Users className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Recurring Revenue</p>
              <p className="text-3xl font-bold mt-2">${data.mrr.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Churn Rate</p>
              <p className="text-3xl font-bold mt-2">{data.churn_rate.toFixed(1)}%</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">ARPU</p>
              <p className="text-3xl font-bold mt-2">
                ${data.active_subscribers > 0 ? (data.mrr / data.active_subscribers).toFixed(2) : '0.00'}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">MRR by Plan</h2>
        <div className="space-y-3">
          {Object.entries(data.mrr_by_plan).map(([plan, amount]) => (
            <div key={plan} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="font-medium capitalize">{plan}</span>
              <span className="text-lg font-bold">${amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Last updated: {new Date(data.timestamp).toLocaleString()}
      </p>
    </div>
  )
}
