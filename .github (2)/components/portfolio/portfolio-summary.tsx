import { Card } from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"

interface PortfolioSummaryProps {
  totalValue: number
  totalCost: number
  profitLoss: number
  profitLossPercent: number
}

export function PortfolioSummary({ totalValue, totalCost, profitLoss, profitLossPercent }: PortfolioSummaryProps) {
  const isPositive = profitLoss >= 0

  return (
    <Card className="glass-card p-6 border-white/10">
      <h2 className="text-lg font-semibold mb-4 text-white/90">Total Portfolio Value</h2>

      <div className="space-y-4">
        <div>
          <p className="text-4xl font-bold text-white mb-2">
            ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className={`flex items-center gap-2 text-sm ${isPositive ? "text-green-400" : "text-red-400"}`}>
            {isPositive ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
            <span className="font-medium">
              ${Math.abs(profitLoss).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span>({profitLossPercent.toFixed(2)}%)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-sm text-white/60 mb-1">Total Invested</p>
            <p className="text-lg font-semibold text-white/90">
              ${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-white/60 mb-1">Current Value</p>
            <p className="text-lg font-semibold text-white/90">
              ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
