# KryptoTrac v2 — Design Spec

**Date:** 2026-07-22  
**Repo:** `brandonlacoste9-tech/Kryptotrac-xx`  
**Status:** Approved  

## Summary

Rebuild `Kryptotrac-xx` from the Zyeuté social codebase into a focused **browser-only crypto portfolio tracker** with live CoinGecko prices.

## Goals

- Track personal holdings (amount + optional cost basis)
- Live USD valuation and 24h change
- Markets list (top coins) + coin detail
- Watchlist
- No accounts; data in `localStorage`
- Deployable on Vercel as Next.js

## Non-goals (v1)

Auth, Supabase, Stripe, alerts, tax, DeFi, wallet connect, social, bots, Zyeuté remnants

## Architecture

- **Next.js (App Router) + TypeScript + Tailwind**
- **CoinGecko** via Next.js Route Handlers (`/api/*`) to avoid CORS and cache briefly
- **Client state:** React context + `localStorage` for portfolio & watchlist

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Markets — top coins, search, 24h % |
| `/portfolio` | Holdings, totals, allocation |
| `/coin/[id]` | Coin detail, add to portfolio |
| `/watchlist` | Starred coins |
| `/legal/privacy` | Privacy policy |
| `/about` | Product blurb |

## Data model

```ts
type Holding = {
  id: string       // coingecko id
  symbol: string
  name: string
  amount: number
  costBasisUsd?: number  // total cost for this position
}

type PortfolioState = {
  holdings: Holding[]
  watchlist: string[]  // coingecko ids
}
```

Storage key: `kryptotrac-portfolio-v1`

## API routes

- `GET /api/markets?per_page=100` → CoinGecko markets
- `GET /api/coin/[id]` → coin detail (+ market chart sparklines when available)
- `GET /api/prices?ids=bitcoin,ethereum` → simple prices for portfolio valuation

Cache: in-memory ~45s TTL per key on the server.

## UI

- Dark fintech theme, mobile-first
- Brand: **KryptoTrac**
- Clear tables, currency formatting, empty states

## Success criteria

- [ ] Live top markets load
- [ ] Add/edit/remove holdings; totals update
- [ ] Refresh keeps portfolio
- [ ] `npm run build` succeeds
- [ ] No Zyeuté branding in UI

## Repo strategy

Greenfield replace: new Next app at repo root; remove Zyeuté client/server/colony trees in the same effort (or leave untracked dead code only if delete is too large — prefer delete).
