"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useSearchCoins } from "@/hooks/use-search-coins"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AddCoinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddCoin: (coinId: string) => void
}

export function AddCoinDialog({ open, onOpenChange, onAddCoin }: AddCoinDialogProps) {
  const [query, setQuery] = useState("")
  const { results, loading } = useSearchCoins(query)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Cryptocurrency</DialogTitle>
          <DialogDescription>Search for a cryptocurrency to add to your watchlist</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search Bitcoin, Ethereum..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          <ScrollArea className="h-[300px] rounded-md border">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Searching...</div>
            ) : results.length === 0 && query ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No cryptocurrencies found</div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Start typing to search</div>
            ) : (
              <div className="p-2 space-y-1">
                {results.map((coin) => (
                  <button
                    key={coin.id}
                    onClick={() => onAddCoin(coin.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                  >
                    <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-8 h-8" />
                    <div className="flex-1">
                      <p className="font-medium">{coin.name}</p>
                      <p className="text-sm text-muted-foreground uppercase">{coin.symbol}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
