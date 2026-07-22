/**
 * Local portfolio total-value history for sparkline (browser only).
 */

const KEY = "kryptotrac-portfolio-history-v1"
const MAX_POINTS = 120
const MIN_GAP_MS = 60_000 // at most one sample per minute

export type HistoryPoint = { t: number; v: number }

export function loadHistory(): HistoryPoint[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as HistoryPoint[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function recordHistoryValue(valueUsd: number): HistoryPoint[] {
  if (typeof window === "undefined" || !Number.isFinite(valueUsd) || valueUsd < 0) {
    return loadHistory()
  }
  const now = Date.now()
  let points = loadHistory()
  const last = points[points.length - 1]
  if (last && now - last.t < MIN_GAP_MS) {
    // update last point in place
    points = [...points.slice(0, -1), { t: now, v: valueUsd }]
  } else {
    points = [...points, { t: now, v: valueUsd }]
  }
  if (points.length > MAX_POINTS) points = points.slice(-MAX_POINTS)
  try {
    localStorage.setItem(KEY, JSON.stringify(points))
  } catch {
    /* ignore */
  }
  return points
}

export function clearHistory() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
