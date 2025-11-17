"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface HistoricalData {
  date: string
  value: number
}

interface PortfolioPerformanceChartProps {
  userId: string
  totalValue: number
}

export function PortfolioPerformanceChart({ userId, totalValue }: PortfolioPerformanceChartProps) {
  const [chartData, setChartData] = useState<HistoricalData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("7d")

  useEffect(() => {
    async function fetchHistoricalData() {
      try {
        setLoading(true)
        const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90

        const response = await fetch(`/api/portfolio/history?days=${days}`)
        const data = await response.json()

        if (data.success && data.history.length > 0) {
          setChartData(
            data.history.map((h: any) => ({
              date: new Date(h.snapshot_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              value: Number(h.total_value),
            })),
          )
        } else {
          // No historical data yet - show just current value
          setChartData([
            {
              date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              value: totalValue,
            },
          ])
        }
      } catch (error) {
        console.error("[v0] Error fetching historical data:", error)
        setChartData([
          {
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            value: totalValue,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchHistoricalData()
  }, [userId, totalValue, timeframe])

  // Calculate chart dimensions and scales
  const width = 600
  const height = 200
  const padding = { top: 20, right: 20, bottom: 30, left: 50 }

  const maxValue = Math.max(...chartData.map((d) => d.value))
  const minValue = Math.min(...chartData.map((d) => d.value))
  const valueRange = maxValue - minValue

  // Create SVG path for the line
  const linePath = chartData
    .map((point, index) => {
      const x = padding.left + (index / (chartData.length - 1)) * (width - padding.left - padding.right)
      const y = padding.top + (1 - (point.value - minValue) / valueRange) * (height - padding.top - padding.bottom)
      return `${index === 0 ? "M" : "L"} ${x} ${y}`
    })
    .join(" ")

  // Create area path for gradient fill
  const areaPath = `${linePath} L ${width - padding.right} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`

  const isPositive = chartData.length > 1 && chartData[chartData.length - 1].value >= chartData[0].value

  if (loading || chartData.length === 0) {
    return (
      <Card className="glass-card p-6 border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white/90">Portfolio Performance</h2>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">
              ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-white/60">Loading history...</p>
          </div>
        </div>
        <div className="h-48 flex items-center justify-center text-white/40">
          <p>Loading historical data...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="glass-card p-6 border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white/90">Portfolio Performance</h2>
        <div className="flex items-center gap-4">
          <div className="flex gap-1 bg-black/40 rounded-lg p-1">
            {(["7d", "30d", "90d"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  timeframe === tf ? "bg-red-600 text-white" : "text-white/60 hover:text-white/90"
                }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">
              ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-white/60">
              {timeframe === "7d" ? "Past 7 Days" : timeframe === "30d" ? "Past 30 Days" : "Past 90 Days"}
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity="0.3" />
              <stop offset="100%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = padding.top + (i / 4) * (height - padding.top - padding.bottom)
            return (
              <line
                key={i}
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            )
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#chartGradient)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={isPositive ? "#22c55e" : "#ef4444"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {chartData.map((point, index) => {
            const x = padding.left + (index / (chartData.length - 1)) * (width - padding.left - padding.right)
            const y =
              padding.top + (1 - (point.value - minValue) / valueRange) * (height - padding.top - padding.bottom)
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={isPositive ? "#22c55e" : "#ef4444"}
                className="transition-all hover:r-5"
              />
            )
          })}

          {/* X-axis labels */}
          {chartData.map((point, index) => {
            if (index % 2 === 0) {
              const x = padding.left + (index / (chartData.length - 1)) * (width - padding.left - padding.right)
              return (
                <text key={index} x={x} y={height - 10} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">
                  {point.date}
                </text>
              )
            }
            return null
          })}
        </svg>
      </div>
    </Card>
  )
}
