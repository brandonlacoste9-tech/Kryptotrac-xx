import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  sub,
  className,
}: {
  label: string
  value: string
  sub?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card/80 p-4 shadow-sm",
        className
      )}
    >
      <p className="text-[11px] uppercase tracking-wider text-muted font-medium">{label}</p>
      <p className="mt-1 text-xl sm:text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      {sub != null && <div className="mt-1 text-sm">{sub}</div>}
    </div>
  )
}
