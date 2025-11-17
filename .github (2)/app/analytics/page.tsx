"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Line, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { TrendingUp, TrendingDown, PieChart, Activity } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler)

export default function AnalyticsPage() {
  const [snapshots, setSnapshots] = useState<any[]>([])
  const [holdings, setHoldings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("30d")
  const [user, setUser] = useState<any>(null)

  const supabase = createBrowserClient()

  useEffect(() => {
    loadData()
  }, [timeframe])

  async function loadData() {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    if (!authUser) return

    setUser(authUser)

    const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: snapshotData } = await supabase
      .from("portfolio_snapshots")
      .select("*")
      .eq("user_id", authUser.id)
      .gte("snapshot_date", startDate.toISOString())
      .order("snapshot_date", { ascending: true })

    const { data: holdingsData } = await supabase.from("user_portfolios").select("*").eq("user_id", authUser.id)

    if (snapshotData) setSnapshots(snapshotData)
    if (holdingsData) {
      const holdingsWithPrices = await Promise.all(
        holdingsData.map(async (holding) => {
          try {
            const response = await fetch(
              `https://api.coingecko.com/api/v3/simple/price?ids=${holding.coin_id}&vs_currencies=usd`,
            )
            const priceData = await response.json()
            return {
              ...holding,
              current_price: priceData[holding.coin_id]?.usd || 0,
            }
          } catch {
            return { ...holding, current_price: 0 }
          }
        }),
      )
      setHoldings(holdingsWithPrices)
    }

    setLoading(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Please sign in to view analytics</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse">Loading analytics...</div>
      </div>
    )
  }

  const totalValue = holdings.reduce((sum, h) => sum + (h.current_price || 0) * h.quantity, 0)
  const totalCost = holdings.reduce((sum, h) => sum + h.purchase_price * h.quantity, 0)
  const totalGain = totalValue - totalCost
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0

  const lineChartData = {
    labels: snapshots.map((s) => new Date(s.snapshot_date).toLocaleDateString()),
    datasets: [
      {
        label: "Portfolio Value",
        data: snapshots.map((s) => s.total_value),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const pieChartData = {
    labels: holdings.map((h) => h.coin_name),
    datasets: [
      {
        data: holdings.map((h) => (h.current_price || 0) * h.quantity),
        backgroundColor: [
          "rgba(239, 68, 68, 0.8)",
          "rgba(249, 115, 22, 0.8)",
          "rgba(234, 179, 8, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(168, 85, 247, 0.8)",
        ],
        borderWidth: 0,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "rgba(255, 255, 255, 0.8)",
        },
      },
    },
    scales: {
      y: {
        ticks: { color: "rgba(255, 255, 255, 0.6)" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      x: {
        ticks: { color: "rgba(255, 255, 255, 0.6)" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Portfolio Analytics</h1>
          <div className="flex gap-2">
            {(["7d", "30d", "90d"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  timeframe === tf
                    ? "bg-red-600 text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 text-white/60 mb-2">
              <Activity className="w-5 h-5" />
              <span className="text-sm">Total Value</span>
            </div>
            <div className="text-3xl font-bold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>

          <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 text-white/60 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm">Total Gain/Loss</span>
            </div>
            <div className={`text-3xl font-bold ${totalGain >= 0 ? "text-green-500" : "text-red-500"}`}>
              {totalGain >= 0 ? "+" : ""}${Math.abs(totalGain).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-sm ${totalGain >= 0 ? "text-green-500" : "text-red-500"}`}>
              {totalGainPercent >= 0 ? "+" : ""}{totalGainPercent.toFixed(2)}%
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 text-white/60 mb-2">
              <PieChart className="w-5 h-5" />
              <span className="text-sm">Holdings</span>
            </div>
            <div className="text-3xl font-bold">{holdings.length}</div>
            <div className="text-sm text-white/60">Assets tracked</div>
          </div>
        </div>

        {snapshots.length > 0 ? (
          <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <h2 className="text-xl font-bold mb-4">Portfolio Value Over Time</h2>
            <div className="h-80">
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </div>
        ) : (
          <div className="p-12 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-center">
            <Activity className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <p className="text-white/60">Not enough historical data yet</p>
            <p className="text-sm text-white/40 mt-2">Portfolio snapshots are captured daily</p>
          </div>
        )}

        {holdings.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <h2 className="text-xl font-bold mb-4">Asset Allocation</h2>
              <div className="h-80">
                <Pie
                  data={pieChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "right",
                        labels: {
                          color: "rgba(255, 255, 255, 0.8)",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <h2 className="text-xl font-bold mb-4">Top Holdings</h2>
              <div className="space-y-4">
                {holdings
                  .sort((a, b) => (b.current_price || 0) * b.quantity - (a.current_price || 0) * a.quantity)
                  .slice(0, 5)
                  .map((holding) => {
                    const value = (holding.current_price || 0) * holding.quantity
                    const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0
                    const gain = value - holding.purchase_price * holding.quantity
                    const gainPercent =
                      holding.purchase_price * holding.quantity > 0
                        ? (gain / (holding.purchase_price * holding.quantity)) * 100
                        : 0

                    return (
                      <div key={holding.id} className="flex items-center gap-4">
                        <img src={holding.coin_image || "/placeholder.svg"} alt={holding.coin_name} className="w-10 h-10 rounded-full" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{holding.coin_name}</span>
                            <span className="text-sm">{percentage.toFixed(1)}%</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/60">${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <span className={gain >= 0 ? "text-green-500" : "text-red-500"}>
                              {gain >= 0 ? "+" : ""}{gainPercent.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
