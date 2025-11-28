# BB Tips System - Complete Implementation

## Overview
BB's proactive tips feature watches markets and alerts users when opportunities or risks are detected.

## Features Implemented

### 1. Tip Detection Logic (`lib/bb-tips.ts`)
- Whale movements (>$1M transfers)
- Sentiment spikes (>200% social volume increase)
- Price breakouts (>5% moves)
- Unusual volume (>150% average)
- Flash crashes (>10% drops in minutes)
- Accumulation patterns (7+ days of consistent buying)

### 2. Tier-Based Limits
- **Free**: 2 tips/week, low priority
- **Starter**: 5 tips/week, medium priority
- **Pro**: 10 tips/week, high priority, instant delivery
- **Elite**: Unlimited tips, instant delivery

### 3. Database Schema (`scripts/013_add_bb_tips_table.sql`)
- `bb_tips` table with RLS policies
- Tracks trigger type, severity, message, coin, read status
- Weekly tip count function for rate limiting

### 4. API Endpoints (`app/api/bb/tips/route.ts`)
- `GET /api/bb/tips` - Fetch unread tips
- `POST /api/bb/tips` - Generate tips from watchlist
- `PATCH /api/bb/tips` - Mark tip as read

### 5. UI Integration
- BB dock shows tip badge with count
- Active tip displayed in yellow notification box
- Haptic feedback on new tips (`[50, 30, 100]` pattern)
- Dismissible notifications

### 6. BB Voice Templates
All tips use BB's signature friendly, cautious tone:
- "Psst... Bee. Just saw..."
- "Yo hold up. [COIN] just..."
- "Not financial advice, just FYI"
- Always ends with "I got you. 👀"

## Legal Compliance
- All tips include "Not financial advice" disclaimer
- Never uses "buy" or "sell" language
- Educational positioning only
- "Just FYI" / "Worth watching" framing

## Next Steps
1. Run `scripts/013_add_bb_tips_table.sql` in Supabase SQL Editor
2. Test tip generation with `/api/bb/tips` POST endpoint
3. Monitor tip delivery and user engagement
4. Integrate with real-time market data feed (CoinGecko WebSocket)

## Monetization Hook
Free users hit 2-tip limit quickly → upgrade prompt → "Get unlimited BB tips with Pro"
