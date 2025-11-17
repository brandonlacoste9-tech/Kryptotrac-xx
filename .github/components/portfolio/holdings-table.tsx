"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, TrendingUp, TrendingDown } from "lucide-react"

interface Holding {
  id: string
  coin_name: string
  coin_symbol: string
  coin_image: string | null
  quantity: number
  purchase_price: number
  current_price: number
  current_value: number
  profit_loss: number
  profit_loss_percentage: number
  purchase_date: string
}

interface HoldingsTableProps {
  holdings: Holding[]
  onDelete: (id: string) => void
}

export function HoldingsTable({ holdings, onDelete }: HoldingsTableProps) {
  return (
    <div className="rounded-lg border border-white/10 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-white/5">
            <TableHead>Asset</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Avg Buy Price</TableHead>
            <TableHead className="text-right">Current Price</TableHead>
            <TableHead className="text-right">Current Value</TableHead>
            <TableHead className="text-right">P&L</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {holdings.map((holding) => (
            <TableRow key={holding.id} className="border-white/10 hover:bg-white/5">
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {holding.coin_image && (
                    <img src={holding.coin_image || "/placeholder.svg"} alt={holding.coin_name} className="w-8 h-8" />
                  )}
                  <div>
                    <div className="font-semibold">{holding.coin_name}</div>
                    <div className="text-sm text-muted-foreground">{holding.coin_symbol}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {holding.quantity.toLocaleString("en-US", { maximumFractionDigits: 8 })}
              </TableCell>
              <TableCell className="text-right">
                $
                {holding.purchase_price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-right">
                ${holding.current_price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-right font-semibold">
                ${holding.current_value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-right">
                <div
                  className={`flex items-center justify-end gap-1 ${
                    holding.profit_loss >= 0 ? "text-positive" : "text-negative"
                  }`}
                >
                  {holding.profit_loss >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <div>
                    <div className="font-semibold">
                      $
                      {Math.abs(holding.profit_loss).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-xs">
                      {holding.profit_loss >= 0 ? "+" : ""}
                      {holding.profit_loss_percentage.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(holding.id)}
                  className="hover:bg-destructive/20 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
