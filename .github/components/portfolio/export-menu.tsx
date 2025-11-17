"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react"
import { exportToCSV, exportToPDF } from "@/lib/export"
import { Badge } from "@/components/ui/badge"

interface HoldingWithPrice {
  coin_name: string
  coin_symbol: string
  quantity: number
  purchase_price: number
  current_price: number
  current_value: number
  profit_loss: number
  profit_loss_percentage: number
  purchase_date: string
}

interface ExportMenuProps {
  holdings: HoldingWithPrice[]
  totalValue: number
  totalCost: number
  totalProfitLoss: number
  totalProfitLossPercentage: number
  isPro: boolean
  analytics?: {
    sharpeRatio: number
    volatility: number
    maxDrawdown: number
    diversificationScore: number
    riskScore: number
  }
}

export function ExportMenu({
  holdings,
  totalValue,
  totalCost,
  totalProfitLoss,
  totalProfitLossPercentage,
  isPro,
  analytics,
}: ExportMenuProps) {
  const [exporting, setExporting] = useState(false)

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      exportToCSV(holdings, totalValue, totalProfitLoss)
    } catch (error) {
      console.error("[v0] CSV export error:", error)
    } finally {
      setExporting(false)
    }
  }

  const handleExportPDF = async () => {
    if (!isPro) {
      window.location.href = "/pricing"
      return
    }

    setExporting(true)
    try {
      exportToPDF(holdings, totalValue, totalCost, totalProfitLoss, totalProfitLossPercentage, analytics)
    } catch (error) {
      console.error("[v0] PDF export error:", error)
    } finally {
      setExporting(false)
    }
  }

  if (holdings.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-white/20 hover:border-white/40 bg-transparent" disabled={exporting}>
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 glass-card border-white/20">
        <DropdownMenuLabel>Export Portfolio</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          <span>Export as CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer" disabled={!isPro}>
          <FileText className="h-4 w-4 mr-2" />
          <div className="flex items-center justify-between flex-1">
            <span>Export as PDF</span>
            {!isPro && (
              <Badge variant="default" className="bg-primary text-white text-xs ml-2">
                PRO
              </Badge>
            )}
          </div>
        </DropdownMenuItem>
        {!isPro && (
          <>
            <DropdownMenuSeparator className="bg-white/10" />
            <div className="px-2 py-1.5 text-xs text-muted-foreground">PDF exports include analytics</div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
