"use client"

export function Sparkline({
  prices,
  positive,
  className = "",
}: {
  prices: number[]
  positive?: boolean
  className?: string
}) {
  if (!prices?.length || prices.length < 2) {
    return <span className="text-xs text-muted">—</span>
  }

  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const w = 96
  const h = 32
  const pts = prices
    .map((p, i) => {
      const x = (i / (prices.length - 1)) * w
      const y = h - ((p - min) / range) * (h - 4) - 2
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")

  const stroke = positive === false ? "var(--danger)" : "var(--success)"

  return (
    <svg
      className={`spark ${className}`}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts}
      />
    </svg>
  )
}
