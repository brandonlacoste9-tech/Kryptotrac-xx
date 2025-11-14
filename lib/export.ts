import { jsPDF } from "jspdf"
import { createBrowserClient } from "@/lib/supabase/client"

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

async function logExport(type: "csv" | "pdf", fileSize?: number) {
  try {
    const supabase = createBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from("export_history").insert({
      user_id: user.id,
      export_type: type,
      file_size: fileSize,
    })
  } catch (error) {
    console.error("[v0] Error logging export:", error)
  }
}

export function exportToCSV(holdings: HoldingWithPrice[], totalValue: number, totalProfitLoss: number) {
  const headers = [
    "Asset",
    "Symbol",
    "Quantity",
    "Purchase Price",
    "Current Price",
    "Current Value",
    "Profit/Loss",
    "P/L %",
    "Purchase Date",
  ]

  const rows = holdings.map((h) => [
    h.coin_name,
    h.coin_symbol.toUpperCase(),
    h.quantity.toFixed(8),
    `$${h.purchase_price.toFixed(2)}`,
    `$${h.current_price.toFixed(2)}`,
    `$${h.current_value.toFixed(2)}`,
    `$${h.profit_loss.toFixed(2)}`,
    `${h.profit_loss_percentage.toFixed(2)}%`,
    new Date(h.purchase_date).toLocaleDateString(),
  ])

  // Add summary row
  rows.push([])
  rows.push(["Total Portfolio Value", "", "", "", "", `$${totalValue.toFixed(2)}`, "", "", ""])
  rows.push(["Total Profit/Loss", "", "", "", "", `$${totalProfitLoss.toFixed(2)}`, "", "", ""])

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

  // Log export
  logExport("csv", blob.size)

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `kryptotrac-portfolio-${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToPDF(
  holdings: HoldingWithPrice[],
  totalValue: number,
  totalCost: number,
  totalProfitLoss: number,
  totalProfitLossPercentage: number,
  analytics?: {
    sharpeRatio: number
    volatility: number
    maxDrawdown: number
    diversificationScore: number
    riskScore: number
  },
) {
  const doc = new jsPDF()

  // Header
  doc.setFillColor(220, 38, 38) // Red
  doc.rect(0, 0, 210, 40, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.text("KryptoTrac", 15, 20)
  doc.setFontSize(12)
  doc.text("Portfolio Report", 15, 30)
  doc.setFontSize(10)
  doc.text(new Date().toLocaleDateString(), 160, 30)

  // Portfolio Summary
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(16)
  doc.text("Portfolio Summary", 15, 55)

  doc.setFontSize(10)
  let yPos = 65

  doc.text(`Total Value: $${totalValue.toFixed(2)}`, 15, yPos)
  yPos += 7
  doc.text(`Total Cost: $${totalCost.toFixed(2)}`, 15, yPos)
  yPos += 7

  const plColor = totalProfitLoss >= 0 ? [34, 197, 94] : [239, 68, 68]
  doc.setTextColor(plColor[0], plColor[1], plColor[2])
  doc.text(
    `Profit/Loss: $${totalProfitLoss.toFixed(2)} (${totalProfitLossPercentage >= 0 ? "+" : ""}${totalProfitLossPercentage.toFixed(2)}%)`,
    15,
    yPos,
  )
  doc.setTextColor(0, 0, 0)
  yPos += 7

  doc.text(`Total Holdings: ${holdings.length}`, 15, yPos)
  yPos += 15

  // Holdings Table
  doc.setFontSize(14)
  doc.text("Holdings", 15, yPos)
  yPos += 10

  doc.setFontSize(8)
  const tableHeaders = ["Asset", "Quantity", "Buy Price", "Current", "Value", "P/L", "P/L %"]
  const colWidths = [35, 25, 25, 25, 30, 25, 20]
  let xPos = 15

  // Table header
  doc.setFillColor(240, 240, 240)
  doc.rect(15, yPos - 5, 185, 8, "F")
  tableHeaders.forEach((header, i) => {
    doc.text(header, xPos, yPos)
    xPos += colWidths[i]
  })
  yPos += 8

  // Table rows
  holdings.forEach((holding, index) => {
    if (yPos > 270) {
      doc.addPage()
      yPos = 20
    }

    xPos = 15
    const rowData = [
      holding.coin_symbol.toUpperCase(),
      holding.quantity.toFixed(4),
      `$${holding.purchase_price.toFixed(2)}`,
      `$${holding.current_price.toFixed(2)}`,
      `$${holding.current_value.toFixed(2)}`,
      `$${holding.profit_loss.toFixed(2)}`,
      `${holding.profit_loss_percentage.toFixed(1)}%`,
    ]

    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250)
      doc.rect(15, yPos - 5, 185, 7, "F")
    }

    rowData.forEach((cell, i) => {
      doc.text(cell, xPos, yPos)
      xPos += colWidths[i]
    })
    yPos += 7
  })

  // Analytics Section (Pro only)
  if (analytics) {
    yPos += 15
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(14)
    doc.text("Advanced Analytics", 15, yPos)
    yPos += 10

    doc.setFontSize(10)
    doc.text(`Sharpe Ratio: ${analytics.sharpeRatio.toFixed(2)}`, 15, yPos)
    yPos += 7
    doc.text(`Annual Volatility: ${analytics.volatility.toFixed(1)}%`, 15, yPos)
    yPos += 7
    doc.text(`Max Drawdown: -${analytics.maxDrawdown.toFixed(1)}%`, 15, yPos)
    yPos += 7
    doc.text(`Diversification Score: ${analytics.diversificationScore.toFixed(0)}/100`, 15, yPos)
    yPos += 7
    doc.text(`Risk Score: ${analytics.riskScore.toFixed(0)}/100`, 15, yPos)
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(`Generated by KryptoTrac - Page ${i} of ${pageCount}`, 15, 290)
    doc.text("Not financial advice", 160, 290)
  }

  // Get PDF as blob for size calculation
  const pdfBlob = doc.output("blob")
  logExport("pdf", pdfBlob.size)

  doc.save(`kryptotrac-portfolio-${new Date().toISOString().split("T")[0]}.pdf`)
}
