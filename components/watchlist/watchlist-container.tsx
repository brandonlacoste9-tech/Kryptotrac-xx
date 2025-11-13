"use client"
import { WatchlistHeader } from "./watchlist-header"
import { WatchlistGrid } from "./watchlist-grid"
import { EmptyWatchlist } from "./empty-watchlist"
import { useWatchlist } from "@/hooks/use-watchlist"
import { useCryptoData } from "@/hooks/use-crypto-data"

export function WatchlistContainer() {
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist()
  const { coins, loading, lastUpdated, refresh } = useCryptoData(watchlist)

  return (
    <div className="space-y-6">
      <WatchlistHeader
        onAddCoin={addToWatchlist}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
        isRefreshing={loading}
      />

      {watchlist.length === 0 ? (
        <EmptyWatchlist onAddCoin={addToWatchlist} />
      ) : (
        <WatchlistGrid coins={coins} loading={loading} onRemove={removeFromWatchlist} />
      )}
    </div>
  )
}
