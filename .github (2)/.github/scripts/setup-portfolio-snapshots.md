# Portfolio Snapshot Setup

## Overview
Automated daily snapshots of portfolio values to enable historical performance tracking and accurate analytics.

## Database Setup

1. Run the migration:
\`\`\`bash
# Execute scripts/003_add_portfolio_history.sql in your Supabase SQL editor
\`\`\`

## Cron Job Setup (Upstash QStash)

1. Add environment variable:
\`\`\`bash
CRON_SECRET=your-secure-random-string
\`\`\`

2. Create QStash schedule:
\`\`\`bash
curl -X POST https://qstash.upstash.io/v2/schedules \
  -H "Authorization: Bearer YOUR_QSTASH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "https://your-app.vercel.app/api/cron/snapshot-portfolios",
    "cron": "0 0 * * *",
    "body": "",
    "headers": {
      "Authorization": "Bearer YOUR_CRON_SECRET"
    }
  }'
\`\`\`

## Features Enabled

- Daily portfolio value snapshots
- Historical performance charts (7d, 30d, 90d)
- Accurate Sharpe ratio calculations
- Real volatility and drawdown metrics
- Time-series analysis for exports and reports

## Manual Trigger (Testing)

\`\`\`bash
curl -X POST https://your-app.vercel.app/api/cron/snapshot-portfolios \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
