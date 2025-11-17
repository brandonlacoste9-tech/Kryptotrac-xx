"use client"

import { Card } from "@/components/ui/card"
import { useMemo } from "react"

interface Holding {
  coin_id: string
  coin_name: string
  coin_symbol: string
  quantity: number
  purchase_price: number
  current_price?: number
}

interface PortfolioAllocationChartProps {
  holdings: Holding[]
}

export function PortfolioAllocationChart({ holdings }: PortfolioAllocationChartProps) {
  const allocationData = useMemo(() => {
    const total = holdings.reduce((sum, h) => sum + (h.current_price || h.purchase_price) * h.quantity, 0)

    return holdings
      .map((h) => ({
        name: h.coin_symbol.toUpperCase(),
        value: (h.current_price || h.purchase_price) * h.quantity,
        percentage: (((h.current_price || h.purchase_price) * h.quantity) / total) * 100,
        color: getColorForIndex(holdings.indexOf(h)),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // Top 5 holdings
  }, [holdings])

  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"]

  function getColorForIndex(index: number) {
    return colors[index % colors.length]
  }

  // Calculate donut chart segments
  let currentAngle = 0
  const segments = allocationData.map((item) => {
    const angle = (item.percentage / 100) * 360
    const segment = {
      ...item,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
    }
    currentAngle += angle
    return segment
  })

  return (
    <Card className="glass-card p-6 border-white/10">
      <h2 className="text-lg font-semibold mb-6 text-white/90">Portfolio Allocation</h2>

      <div className="flex items-center justify-center gap-8">
        {/* Donut Chart */}
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {segments.map((segment, index) => {
              const startAngle = (segment.startAngle * Math.PI) / 180
              const endAngle = (segment.endAngle * Math.PI) / 180
              const largeArc = segment.endAngle - segment.startAngle > 180 ? 1 : 0

              const x1 = 50 + 40 * Math.cos(startAngle)
              const y1 = 50 + 40 * Math.sin(startAngle)
              const x2 = 50 + 40 * Math.cos(endAngle)
              const y2 = 50 + 40 * Math.sin(endAngle)

              const innerX1 = 50 + 25 * Math.cos(startAngle)
              const innerY1 = 50 + 25 * Math.sin(startAngle)
              const innerX2 = 50 + 25 * Math.cos(endAngle)
              const innerY2 = 50 + 25 * Math.sin(endAngle)

              return (
                <path
                  key={index}
                  d={`M ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} L ${innerX2} ${innerY2} A 25 25 0 ${largeArc} 0 ${innerX1} ${innerY1} Z`}
                  fill={segment.color}
                  className="transition-opacity hover:opacity-80"
                />
              )
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {allocationData.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/90">{item.name}</p>
                <p className="text-xs text-white/60">{item.percentage.toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
