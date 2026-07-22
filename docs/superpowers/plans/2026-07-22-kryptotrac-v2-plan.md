# KryptoTrac v2 Implementation Plan

> **For agentic workers:** Inline execution of approved design.

**Goal:** Ship a browser-only crypto portfolio tracker with CoinGecko prices on Next.js.

**Architecture:** Next.js App Router; API routes proxy CoinGecko; portfolio/watchlist in localStorage.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, CoinGecko API

---

## Tasks

1. Scaffold package.json, configs, globals
2. lib: types, format, coingecko client, portfolio store
3. API routes: markets, coin, prices
4. UI shell: layout, nav, providers
5. Pages: markets, portfolio, coin, watchlist, privacy, about
6. Verify build
