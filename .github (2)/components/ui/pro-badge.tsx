import { Zap } from "lucide-react"

export function ProBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-semibold shadow-lg shadow-red-500/50">
      <Zap className="w-3 h-3" />
      PRO
    </span>
  )
}
