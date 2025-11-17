import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const totalValue = searchParams.get("value") || "0"
    const profitLoss = searchParams.get("pl") || "0"
    const profitLossPercentage = searchParams.get("plp") || "0"
    const isPro = searchParams.get("pro") === "true"

    const isPositive = Number.parseFloat(profitLoss) >= 0

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
          backgroundImage: "linear-gradient(135deg, rgba(139, 0, 0, 0.1) 0%, rgba(0, 0, 0, 1) 100%)",
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 10 0 L 0 0 0 10' fill='none' stroke='rgba(255,0,0,0.1)' strokeWidth='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
            opacity: 0.3,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px",
            border: "2px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "24px",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 0 60px rgba(239, 68, 68, 0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="#ef4444" />
            </svg>
            <div style={{ fontSize: "48px", fontWeight: "bold", color: "white" }}>KryptoTrac</div>
            {isPro && (
              <div
                style={{
                  padding: "8px 16px",
                  borderRadius: "9999px",
                  background: "linear-gradient(90deg, #ef4444 0%, #f97316 100%)",
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                PRO
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <div style={{ fontSize: "24px", color: "#9ca3af" }}>Portfolio Value</div>
            <div style={{ fontSize: "72px", fontWeight: "bold", color: "white" }}>
              $
              {Number.parseFloat(totalValue).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div
              style={{
                fontSize: "36px",
                fontWeight: "600",
                color: isPositive ? "#10b981" : "#ef4444",
              }}
            >
              {isPositive ? "+" : ""}$
              {Math.abs(Number.parseFloat(profitLoss)).toLocaleString("en-US", { minimumFractionDigits: 2 })} (
              {isPositive ? "+" : ""}
              {Number.parseFloat(profitLossPercentage).toFixed(2)}%)
            </div>
          </div>

          <div
            style={{
              marginTop: "40px",
              paddingTop: "24px",
              borderTop: "1px solid rgba(239, 68, 68, 0.2)",
              fontSize: "18px",
              color: "#6b7280",
            }}
          >
            Track your crypto portfolio at kryptotrac.app
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (error) {
    console.error("[v0] OG image generation error:", error)
    return new Response("Failed to generate image", { status: 500 })
  }
}
