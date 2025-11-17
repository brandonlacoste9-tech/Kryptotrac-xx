export function TableLoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <div className="h-12 w-12 rounded-full bg-white/5 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 bg-white/5 animate-pulse rounded" />
            <div className="h-3 w-1/4 bg-white/5 animate-pulse rounded" />
          </div>
          <div className="h-6 w-24 bg-white/5 animate-pulse rounded" />
        </div>
      ))}
    </div>
  )
}
