import { cn, formatPct } from "@/lib/utils"

export function ChangeBadge({ value, className }: { value: number | null | undefined; className?: string }) {
  if (value == null) {
    return <span className={cn("text-muted text-sm", className)}>—</span>
  }
  const up = value >= 0
  return (
    <span
      className={cn(
        "inline-flex font-mono text-sm tabular-nums",
        up ? "text-success" : "text-danger",
        className
      )}
    >
      {formatPct(value)}
    </span>
  )
}
