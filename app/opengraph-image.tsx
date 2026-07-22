import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "KryptoTrac — Private crypto portfolio tracker"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(145deg, #070b12 0%, #0d1f2d 50%, #0a2a24 100%)",
          padding: 64,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "rgba(34, 211, 166, 0.15)",
              border: "2px solid rgba(34, 211, 166, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#22d3a6",
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            K
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 48, fontWeight: 700, color: "#e8eef7" }}>
              Krypto<span style={{ color: "#22d3a6" }}>Trac</span>
            </div>
            <div style={{ fontSize: 22, color: "#8b9bb3", marginTop: 4 }}>
              Live markets · private portfolio
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 40, fontWeight: 600, color: "#e8eef7", maxWidth: 900 }}>
            Track holdings with live prices. No account. Data stays in your browser.
          </div>
          <div style={{ fontSize: 22, color: "#22d3a6" }}>
            USD · CAD · watchlist · export backup
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
