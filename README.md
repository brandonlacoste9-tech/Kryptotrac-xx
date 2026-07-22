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

## Deploy (Netlify)

This app is configured for **Netlify** via `netlify.toml` + `@netlify/plugin-nextjs`.

### One-time

1. Install CLI: `npm i -g netlify-cli` (or use `npx netlify-cli`)
2. Login: `npx netlify-cli login`
3. Link site: `npx netlify-cli init` (or connect the GitHub repo in the Netlify UI)
4. Set the CoinGecko key (never commit it):

```bash
npx netlify-cli env:set COINGECKO_API_KEY "your-key-here"
```

5. Production deploy:

```bash
npm run netlify:deploy
# or
npx netlify-cli deploy --build --prod
```

### Git-based deploys

In [Netlify](https://app.netlify.com): **Add new site → Import from Git** → `brandonlacoste9-tech/Kryptotrac-xx`.

- Build command: `npm run build` (from `netlify.toml`)
- Publish: handled by the Next.js plugin
- Env: `COINGECKO_API_KEY`

Domain intent: **kryptotrac.com** (Netlify → Domain management).

## Spec

See `docs/superpowers/specs/2026-07-22-kryptotrac-v2-design.md`.
