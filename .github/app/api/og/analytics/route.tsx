import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sharpeRatio = Number.parseFloat(searchParams.get("sharpe") || "0")
    const volatility = Number.parseFloat(searchParams.get("vol") || "0")
    const riskScore = Number.parseFloat(searchParams.get("risk") || "0")
    const diversificationScore = Number.parseFloat(searchParams.get("div") || "0")

    const getRiskColor = (score: number) => {
      if (score <= 3) return "#10b981"
      if (score <= 6) return "#eab308"
      return "#ef4444"
    }

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
            <div style={{ fontSize: "48px", fontWeight: "bold", color: "white" }}>Portfolio Analytics</div>
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
          </div>

          <div style={{ display: "flex", gap: "40px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{ fontSize: "20px", color: "#9ca3af" }}>Sharpe Ratio</div>
              <div style={{ fontSize: "56px", fontWeight: "bold", color: "white" }}>{sharpeRatio.toFixed(2)}</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{ fontSize: "20px", color: "#9ca3af" }}>Risk Score</div>
              <div style={{ fontSize: "56px", fontWeight: "bold", color: getRiskColor(riskScore) }}>
                {riskScore.toFixed(1)}/10
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{ fontSize: "20px", color: "#9ca3af" }}>Volatility</div>
              <div style={{ fontSize: "56px", fontWeight: "bold", color: "white" }}>{volatility.toFixed(1)}%</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{ fontSize: "20px", color: "#9ca3af" }}>Diversification</div>
              <div style={{ fontSize: "56px", fontWeight: "bold", color: "white" }}>
                {diversificationScore.toFixed(1)}/10
              </div>
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
            Powered by KryptoTrac Pro • kryptotrac.app
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (error) {
    console.error("[v0] OG analytics image error:", error)
    return new Response("Failed to generate image", { status: 500 })
  }
}
