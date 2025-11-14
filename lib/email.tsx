export interface DigestData {
  userName: string
  totalValue: number
  change24h: number
  changePercent24h: number
  topMovers: Array<{
    name: string
    symbol: string
    value: number
    change: number
    changePercent: number
  }>
  insights: {
    summary: string
    riskLevel: "low" | "moderate" | "high"
    keyTrends: string[]
  }
  isPro: boolean
}

interface EmailTemplate {
  subject: string
  html: string
}

export async function sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
  // Check if we're in development
  const isDev = process.env.NODE_ENV === "development"

  if (!process.env.RESEND_API_KEY) {
    console.log("[v0] Email would be sent in production:", { to, subject: template.subject })
    return true
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "KryptoTrac <noreply@kryptotrac.app>",
        to: [to],
        subject: template.subject,
        html: template.html,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] Failed to send email:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("[v0] Error sending email:", error)
    return false
  }
}

export function createDailyDigestEmail(data: DigestData): EmailTemplate {
  const isPositive = data.change24h >= 0
  const changeColor = isPositive ? "#22c55e" : "#ef4444"
  const changeSymbol = isPositive ? "+" : ""
  const changeIcon = isPositive ? "📈" : "📉"

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #000000;
            color: #ffffff;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .header {
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(0, 0, 0, 0.8));
            border-radius: 12px;
            border: 2px solid rgba(239, 68, 68, 0.3);
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            background: linear-gradient(to right, #ef4444, #dc2626);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
          }
          .stats {
            background: rgba(20, 20, 20, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 20px;
            margin-top: 20px;
          }
          .mover {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            background: rgba(30, 30, 30, 0.6);
            border-radius: 8px;
            margin-bottom: 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 32px;
            background: linear-gradient(to right, #dc2626, #ef4444);
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin-top: 20px;
          }
          .insight-box {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(0, 0, 0, 0.6));
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 12px;
            padding: 20px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚡ KryptoTrac</div>
            <p style="margin: 0; color: rgba(255, 255, 255, 0.8);">Your ${data.isPro ? "Daily" : "Weekly"} Portfolio Snapshot</p>
          </div>
          
          <div style="padding: 20px; text-align: center;">
            <p style="font-size: 18px; color: rgba(255, 255, 255, 0.8); margin: 0;">
              Hey ${data.userName}, here's how your portfolio is performing:
            </p>
          </div>

          <div class="stats">
            <h3 style="margin-top: 0; color: rgba(255, 255, 255, 0.9);">Portfolio Value</h3>
            <div style="font-size: 36px; font-weight: bold; margin: 15px 0;">
              $${data.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style="font-size: 22px; color: ${changeColor}; font-weight: 600;">
              ${changeSymbol}$${Math.abs(data.change24h).toFixed(2)} (${changeSymbol}${data.changePercent24h.toFixed(2)}%) 24h
            </div>
          </div>

          ${
            data.topMovers.length > 0
              ? `
            <div class="stats">
              <h3 style="margin-top: 0; color: rgba(255, 255, 255, 0.9);">Top Movers in Your Portfolio</h3>
              ${data.topMovers
                .map(
                  (mover) => `
                <div class="mover">
                  <div>
                    <div style="font-weight: 600; font-size: 16px;">${mover.name}</div>
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 14px;">${mover.symbol.toUpperCase()}</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="color: ${mover.changePercent >= 0 ? "#22c55e" : "#ef4444"}; font-weight: 600; font-size: 18px;">
                      ${mover.changePercent >= 0 ? "+" : ""}${mover.changePercent.toFixed(2)}%
                    </div>
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 14px;">
                      $${mover.value.toFixed(2)}
                    </div>
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
          `
              : ""
          }

          ${
            data.isPro && data.insights.summary
              ? `
            <div class="insight-box">
              <h3 style="margin-top: 0; color: rgba(255, 255, 255, 0.9);">💡 AI Insight ${data.isPro ? "(Pro)" : ""}</h3>
              <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 10px 0;">
                ${data.insights.summary}
              </p>
              ${
                data.insights.keyTrends.length > 0
                  ? `
                <div style="margin-top: 15px;">
                  <div style="font-weight: 600; margin-bottom: 8px; color: rgba(255, 255, 255, 0.9);">Key Trends:</div>
                  ${data.insights.keyTrends
                    .map(
                      (trend) => `
                    <div style="padding: 6px 0; color: rgba(255, 255, 255, 0.7);">• ${trend}</div>
                  `,
                    )
                    .join("")}
                </div>
              `
                  : ""
              }
            </div>
          `
              : !data.isPro
                ? `
            <div class="insight-box">
              <h3 style="margin-top: 0; color: rgba(255, 255, 255, 0.9);">💡 Unlock AI Insights with Pro</h3>
              <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 10px 0;">
                Upgrade to Pro for daily digests with personalized AI-powered portfolio analysis, risk assessment, and actionable recommendations.
              </p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://kryptotrac.app"}/pricing" class="button" style="display: inline-block; margin-top: 10px;">Upgrade to Pro</a>
            </div>
          `
                : ""
          }

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://kryptotrac.app"}" class="button">View Full Dashboard</a>
          </div>
          
          <div style="text-align: center; padding: 30px 20px 20px; color: rgba(255, 255, 255, 0.5); font-size: 14px; border-top: 1px solid rgba(255, 255, 255, 0.1); margin-top: 30px;">
            <p style="margin: 5px 0;">KryptoTrac - Track your crypto portfolio with real-time insights</p>
            <p style="margin: 5px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://kryptotrac.app"}/settings" style="color: #ef4444; text-decoration: none;">Manage Email Preferences</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  return {
    subject: `${changeIcon} Your Portfolio: ${changeSymbol}${data.changePercent24h.toFixed(2)}% (${data.isPro ? "Daily" : "Weekly"} Update)`,
    html,
  }
}

export async function sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #000000;
            color: #ffffff;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .header {
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(0, 0, 0, 0.8));
            border-radius: 12px;
            border: 2px solid rgba(239, 68, 68, 0.3);
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            background: linear-gradient(to right, #ef4444, #dc2626);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
          }
          .content {
            padding: 30px 20px;
            background: rgba(20, 20, 20, 0.6);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            margin-top: 20px;
          }
          .button {
            display: inline-block;
            padding: 12px 32px;
            background: linear-gradient(to right, #dc2626, #ef4444);
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: rgba(255, 255, 255, 0.5);
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚡ KryptoTrac</div>
            <p style="margin: 0; color: rgba(255, 255, 255, 0.8);">Welcome to the future of crypto tracking</p>
          </div>
          
          <div class="content">
            <h2 style="margin-top: 0;">Welcome${name ? `, ${name}` : ""}!</h2>
            <p>Thanks for signing up for KryptoTrac. You're now ready to track your crypto portfolio with real-time insights and advanced analytics.</p>
            
            <p><strong>Get started by:</strong></p>
            <ul>
              <li>Adding coins to your watchlist</li>
              <li>Creating your first portfolio</li>
              <li>Setting up price alerts</li>
              <li>Exploring advanced analytics (Pro)</li>
            </ul>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://kryptotrac.app"}" class="button">Go to Dashboard</a>
          </div>
          
          <div class="footer">
            <p>KryptoTrac - Track your crypto portfolio with real-time insights</p>
            <p>You're receiving this email because you signed up for KryptoTrac.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail(email, {
    subject: "Welcome to KryptoTrac!",
    html,
  })
}

export async function sendPriceAlertEmail(
  email: string,
  coinName: string,
  coinSymbol: string,
  currentPrice: number,
  targetPrice: number,
  condition: "above" | "below",
): Promise<boolean> {
  const direction = condition === "above" ? "risen above" : "fallen below"

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #000000;
            color: #ffffff;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .alert-box {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(0, 0, 0, 0.8));
            border: 2px solid rgba(239, 68, 68, 0.5);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
          }
          .coin-name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .price {
            font-size: 36px;
            font-weight: bold;
            color: #ef4444;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 32px;
            background: linear-gradient(to right, #dc2626, #ef4444);
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="alert-box">
            <div style="font-size: 48px; margin-bottom: 20px;">🔔</div>
            <h2 style="margin: 0;">Price Alert Triggered!</h2>
            
            <div class="coin-name">${coinName} (${coinSymbol.toUpperCase()})</div>
            <div class="price">$${currentPrice.toFixed(2)}</div>
            
            <p style="font-size: 18px; color: rgba(255, 255, 255, 0.8);">
              has ${direction} your target price of <strong>$${targetPrice.toFixed(2)}</strong>
            </p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://kryptotrac.app"}/market" class="button">View Market</a>
          </div>
          
          <div style="text-align: center; padding: 20px; color: rgba(255, 255, 255, 0.5); font-size: 14px;">
            <p>KryptoTrac Price Alerts</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail(email, {
    subject: `🔔 ${coinName} Alert: Price ${direction} $${targetPrice}`,
    html,
  })
}
