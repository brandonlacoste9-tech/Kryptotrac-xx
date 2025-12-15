# DeFi Tracking Feature

## Overview

The DeFi Tracking feature allows KryptoTrac users to monitor their positions across major DeFi protocols directly from their dashboard. This eliminates the need for separate tools like CoinStats ($60/year value).

## Supported Protocols

1. **Aave V3** - Lending and borrowing positions
2. **Uniswap V3** - Liquidity provider positions
3. **Compound V3** - Supply and borrow positions
4. **Lido** - Staked ETH (stETH) positions
5. **Curve Finance** - Liquidity pool positions (simplified implementation)

## Architecture

### Backend Components

#### 1. Integration Service (`/lib/defi/integrations.ts`)

The core service that connects to DeFi protocols via Ethereum RPC:

- `getAavePositions(walletAddress)` - Fetches Aave lending/borrowing data
- `getUniswapPositions(walletAddress)` - Fetches Uniswap V3 LP positions
- `getCompoundPositions(walletAddress)` - Fetches Compound V3 positions
- `getLidoPosition(walletAddress)` - Fetches Lido staked ETH
- `getCurvePositions(walletAddress)` - Fetches Curve positions (placeholder)
- `getAllDeFiPositions(walletAddress)` - Aggregates all protocol data

#### 2. API Endpoint (`/app/api/defi/positions/route.ts`)

RESTful API endpoint that:
- Authenticates users via Supabase
- Fetches user's saved wallet addresses from database
- Calls integration service for each wallet
- Returns aggregated position data

**Endpoint:** `GET /api/defi/positions`

**Response Format:**
```json
{
  "positions": [
    {
      "wallet": "0x123...",
      "label": "Main Wallet",
      "protocols": {
        "aave": { "totalCollateralETH": "10.5", ... },
        "uniswap": { "totalPositions": 3, ... },
        "compound": { "supplied": "5000", ... },
        "lido": { "stETH": "5.25", ... },
        "curve": { "positions": [], ... }
      },
      "timestamp": "2025-12-15T05:14:05.788Z"
    }
  ],
  "count": 1
}
```

#### 3. Database Schema (`/scripts/016_add_user_wallets_defi.sql`)

**Table: `user_wallets`**

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| address | VARCHAR(42) | Wallet address (e.g., 0x...) |
| chain | VARCHAR(20) | Blockchain network (ethereum, polygon, etc.) |
| label | VARCHAR(100) | User-defined wallet label |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Features:**
- Row Level Security (RLS) enabled
- Unique constraint on (user_id, address, chain)
- Automatic updated_at trigger
- Indexed on user_id and address for performance

### Frontend Components

#### 1. DeFiPositions Component (`/components/dashboard/DeFiPositions.tsx`)

Main React component that:
- Fetches position data from API
- Displays loading states and errors gracefully
- Renders wallet cards with protocol positions
- Shows empty state when no wallets configured

**Features:**
- Responsive grid layout (1/2/3 columns)
- Color-coded health indicators (Aave health factor)
- Wallet address truncation for readability
- Protocol-specific data display

#### 2. ProtocolCard Sub-component

Displays individual protocol positions with:
- Protocol name and icon
- Key metrics (collateral, debt, LP positions, etc.)
- Color-coded values (green for positive, red for negative)
- Badges for position types (e.g., "Staking")

### Dashboard Integration

The DeFiPositions component is integrated into the main dashboard at `/app/dashboard/page.tsx`:

```tsx
<div className="lg:col-span-2 space-y-8">
  <WatchlistSection />
  <PortfolioSection />
  <DeFiPositions /> {/* New DeFi tracking section */}
</div>
```

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
# or
npm install
```

This will install the required `ethers` package (v6.13.0).

### 2. Configure Ethereum RPC

Add an Ethereum RPC URL to your `.env.local`:

```bash
ETH_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY
```

**Recommended RPC Providers:**
- [Alchemy](https://www.alchemy.com/) - 300M compute units/month free
- [Infura](https://infura.io/) - 100k requests/day free

**Fallback:** The system uses `https://eth.llamarpc.com` as a public fallback (with rate limits).

### 3. Run Database Migration

Execute the migration to create the `user_wallets` table:

```bash
psql -h your-supabase-host -U postgres -d postgres -f scripts/016_add_user_wallets_defi.sql
```

Or run it directly in the Supabase SQL Editor.

### 4. Add Wallet Addresses

Users need to add their Ethereum wallet addresses via the "Add Wallet" button in the UI (to be implemented).

Alternatively, insert directly into the database:

```sql
INSERT INTO user_wallets (user_id, address, chain, label)
VALUES (
  'user-uuid-here',
  '0x1234567890123456789012345678901234567890',
  'ethereum',
  'Main Wallet'
);
```

## Usage

1. Navigate to the Dashboard
2. Scroll to the "DeFi Positions" section
3. View aggregated positions across all configured wallets
4. Click "Add Wallet" to track additional addresses

## Data Flow

```
User Dashboard
    ↓
DeFiPositions Component (fetches data)
    ↓
GET /api/defi/positions
    ↓
Supabase Auth (verify user)
    ↓
Query user_wallets table
    ↓
getAllDeFiPositions() for each wallet
    ↓
Ethereum RPC calls to protocol contracts
    ↓
Aggregate & return position data
    ↓
Display in UI
```

## Performance Considerations

1. **RPC Rate Limits**: Use a paid RPC provider for production to avoid rate limiting
2. **Caching**: Consider implementing Redis cache for position data (5-10 min TTL)
3. **Parallel Fetching**: Positions are fetched in parallel using `Promise.all()`
4. **Error Handling**: Each protocol fetch is wrapped in try-catch to prevent cascade failures

## Security Considerations

1. **RLS Policies**: Users can only access their own wallet addresses
2. **Read-Only Contracts**: All contract interactions are read-only (view functions)
3. **No Private Keys**: System never stores or requests private keys
4. **Environment Variables**: RPC URLs are server-side only (not exposed to browser)

## Future Enhancements

1. **Wallet Management UI**: Add/edit/delete wallet addresses
2. **Multi-Chain Support**: Polygon, Arbitrum, Optimism, etc.
3. **More Protocols**: Maker, Balancer, Yearn, etc.
4. **Historical Data**: Track position changes over time
5. **Alerts**: Notify users of health factor drops or impermanent loss
6. **USD Values**: Convert positions to USD using price oracles
7. **Transaction History**: Show recent deposits/withdrawals
8. **APY Tracking**: Display current yield rates

## Troubleshooting

### "No wallets configured" message

**Solution:** Add wallet addresses to the `user_wallets` table.

### "Failed to fetch positions" error

**Possible causes:**
1. RPC provider rate limit exceeded → Use paid plan or add delay between requests
2. Invalid wallet address → Verify address format (must start with 0x and be 42 characters)
3. RPC endpoint down → Check `ETH_RPC_URL` and provider status
4. Network connectivity → Verify server can reach Ethereum mainnet

### Protocol positions showing zero

**Possible causes:**
1. Wallet has no positions in that protocol (expected behavior)
2. Contract addresses outdated → Verify protocol contract addresses in `integrations.ts`
3. RPC node out of sync → Try different RPC provider

### TypeScript errors

**Solution:** Ensure `ethers` is installed:
```bash
pnpm add ethers@^6.13.0
```

## API Reference

### GET /api/defi/positions

Fetches DeFi positions for authenticated user's wallets.

**Authentication:** Required (Supabase session)

**Response:** 200 OK
```json
{
  "positions": WalletPositions[],
  "count": number
}
```

**Response:** 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

**Response:** 500 Internal Server Error
```json
{
  "error": "Failed to fetch positions"
}
```

## Contract Addresses

All addresses are for **Ethereum Mainnet**:

- **Aave V3 Pool**: `0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2`
- **Uniswap V3 NFT Positions**: `0xC36442b4a4522E871399CD717aBDD847Ab11FE88`
- **Compound V3 (cUSDCv3)**: `0xc3d688B66703497DAA19211EEdff47f25384cdc3`
- **Lido stETH**: `0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84`
- **Curve Registry**: `0x90E00ACe148ca3b23Ac1bC8C240C2a7Dd9c2d7f5`

## Contributing

When adding support for new protocols:

1. Add integration function to `/lib/defi/integrations.ts`
2. Update `getAllDeFiPositions()` to include new protocol
3. Add display logic to `ProtocolCard` component
4. Update this documentation
5. Add contract addresses to reference section
6. Test with real wallet addresses before deploying

## License

This feature is part of KryptoTrac and follows the project's main license.
