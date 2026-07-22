const KEY = "kryptotrac-compare-ids-v1"
const MAX = 4

export function loadCompareIds(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as string[]
    return Array.isArray(parsed) ? parsed.slice(0, MAX) : []
  } catch {
    return []
  }
}

export function saveCompareIds(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids.slice(0, MAX)))
  } catch {
    /* ignore */
  }
}

export function toggleCompareId(id: string): string[] {
  const cur = loadCompareIds()
  const next = cur.includes(id)
    ? cur.filter((x) => x !== id)
    : cur.length >= MAX
      ? [...cur.slice(1), id]
      : [...cur, id]
  saveCompareIds(next)
  return next
}
