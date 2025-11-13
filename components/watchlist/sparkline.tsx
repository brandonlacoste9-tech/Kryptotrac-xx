"use client"

interface SparklineProps {
  data: number[]
  isPositive: boolean
}

export function Sparkline({ data, isPositive }: SparklineProps) {
  if (!data || data.length === 0) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = range > 0 ? ((max - value) / range) * 100 : 50
      return `${x},${y}`
    })
    .join(" ")

  return (
    <div className="h-12 w-full">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? "oklch(0.75 0.15 142)" : "oklch(0.65 0.2 27)"}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}
