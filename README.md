# KryptoTrac v2

Browser-only crypto **portfolio tracker** with live [CoinGecko](https://www.coingecko.com) markets.

## Features

- **Markets** — top coins, search, 24h %, 7d sparkline  
- **Portfolio** — holdings in `localStorage`, live valuation, allocation, optional P&L  
- **Watchlist** — star coins  
- **Coin detail** — stats + add to portfolio  

No accounts. No server-side portfolio storage.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS  
- CoinGecko via `/api/markets`, `/api/coin/[id]`, `/api/prices`  

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional higher rate limits:

```bash
# .env.local
COINGECKO_API_KEY=your_demo_or_pro_key
```

## Deploy

Connect the repo to Vercel (framework: Next.js). Domain intent: **kryptotrac.com**.

## Spec

See `docs/superpowers/specs/2026-07-22-kryptotrac-v2-design.md`.
