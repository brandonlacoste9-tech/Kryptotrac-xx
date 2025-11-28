# Quick Reference Guide

Essential commands and information for KryptoTrac developers.

## Installation & Setup

```bash
# Clone repository
git clone https://github.com/brandonlacoste9-tech/Kryptotrac-xx.git
cd Kryptotrac-xx

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your keys

# Start development server
npm run dev
```

## Essential Commands

### Development
```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Run production build locally
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint -- --fix # Auto-fix linting issues
```

### Testing
```bash
npm run test                    # Run all tests
npm run test:watch              # Watch mode
npm run test:e2e                # E2E tests only
npm run test:integration        # Integration tests only
npm run test:all                # With coverage report
```

## Project Structure

```
Kryptotrac-xx/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Auth pages (login, signup)
│   ├── dashboard/         # Main app dashboard
│   ├── atlas/             # BB chat interface
│   └── pricing/           # Subscription plans
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── atlas/            # BB-related components
│   └── watchlist/        # Portfolio components
├── lib/                   # Utility functions
│   ├── supabase/         # Database clients
│   ├── coingecko.ts      # Crypto API
│   └── utils.ts          # Helper functions
├── config/                # Configuration files
├── scripts/               # Database migrations
├── tests/                 # Test files
├── public/                # Static assets
└── styles/                # Global styles
```

## Key Files

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout, providers |
| `app/page.tsx` | Landing page |
| `middleware.ts` | Auth middleware |
| `next.config.mjs` | Next.js configuration |
| `tsconfig.json` | TypeScript configuration |
| `.env.local` | Environment variables (local) |
| `.env.example` | Environment template |

## Environment Variables

### Required
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Stripe (optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Optional
```env
COINGECKO_API_KEY=xxx
NEXT_PUBLIC_SENTRY_DSN=xxx
```

## Database Migrations

Run in this order:
1. `PRE_LAUNCH_SECURITY_FIX.sql`
2. `LAUNCH_READY_MIGRATION.sql`
3. `013_add_bb_tips_table.sql`
4. `014_add_onboarding_and_credits.sql`
5. `015_add_referral_rpc.sql`

```bash
# Using Supabase CLI
supabase db execute scripts/PRE_LAUNCH_SECURITY_FIX.sql
supabase db execute scripts/LAUNCH_READY_MIGRATION.sql
# ... etc
```

## Common Tasks

### Add a New Page
```typescript
// app/my-page/page.tsx
export default function MyPage() {
  return <div>My Page Content</div>
}
```

### Add an API Route
```typescript
// app/api/my-route/route.ts
export async function GET(request: Request) {
  return Response.json({ message: "Hello" })
}
```

### Create a Component
```typescript
// components/my-component.tsx
interface MyComponentProps {
  title: string
}

export function MyComponent({ title }: MyComponentProps) {
  return <div>{title}</div>
}
```

### Query Supabase
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('user_id', userId)
```

### Add Stripe Checkout
```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const session = await stripe.checkout.sessions.create({
  // ... checkout config
})
```

## Debugging

### Check Logs
```bash
# Development server logs
# Check terminal where `npm run dev` is running

# Production logs
# Check Vercel Dashboard → Deployments → [deployment] → Logs
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Port 3000 in use | `lsof -ti:3000 \| xargs kill -9` |
| Module not found | `rm -rf node_modules && npm install` |
| Build fails | Check `npm run build` output |
| Tests fail | Check `.env.local` has test keys |
| Hot reload broken | Restart dev server |

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes, commit
git add .
git commit -m "feat: add my feature"

# Push and create PR
git push origin feature/my-feature
```

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Manual Build
```bash
npm run build
npm run start
```

## Testing

### Write a Test
```typescript
// tests/e2e/my-feature.test.ts
import { expect, test } from '@jest/globals'

test('my feature works', () => {
  expect(true).toBe(true)
})
```

### Run Specific Tests
```bash
npm run test -- my-feature.test.ts
npm run test -- --testNamePattern="my test"
```

## Code Style

### TypeScript
```typescript
// Use interfaces for props
interface ComponentProps {
  title: string
  count: number
}

// Use proper types
const fetchData = async (): Promise<Data[]> => {
  // ...
}

// Avoid 'any'
const value: string = "hello" // Good
const value: any = "hello"    // Avoid
```

### Components
```typescript
// Use named exports
export function MyComponent() { }

// Use TypeScript props
export function MyComponent({ title }: { title: string }) { }
```

### API Routes
```typescript
// Use proper HTTP methods
export async function GET() { }
export async function POST() { }

// Return proper responses
return Response.json({ data })
return new Response("Error", { status: 500 })
```

## Useful Links

| Resource | URL |
|----------|-----|
| Live App | https://kryptotrac-xx.vercel.app |
| Supabase Dashboard | https://supabase.com/dashboard |
| Stripe Dashboard | https://dashboard.stripe.com |
| Vercel Dashboard | https://vercel.com/dashboard |
| CoinGecko API Docs | https://www.coingecko.com/en/api/documentation |
| Next.js Docs | https://nextjs.org/docs |
| Radix UI Docs | https://www.radix-ui.com/docs |

## Keyboard Shortcuts (VS Code)

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + P` | Quick file open |
| `Cmd/Ctrl + Shift + P` | Command palette |
| `Cmd/Ctrl + B` | Toggle sidebar |
| `Cmd/Ctrl + J` | Toggle terminal |
| `Cmd/Ctrl + \`` | Open terminal |
| `F2` | Rename symbol |
| `Cmd/Ctrl + D` | Select next occurrence |

## Tips & Tricks

### Fast Iteration
```bash
# Use watch mode for tests
npm run test:watch

# Keep dev server running
npm run dev
# Edit files, save, see changes instantly
```

### Debug API Routes
```typescript
// Add console.logs
console.log('Request:', request)
console.log('Data:', data)

// Check logs in terminal
```

### Check Database
```sql
-- In Supabase SQL Editor
SELECT * FROM profiles LIMIT 10;
SELECT * FROM user_watchlists WHERE user_id = 'xxx';
```

### Test Webhooks Locally
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal, trigger events
stripe trigger payment_intent.succeeded
```

## Performance Tips

1. **Use Next.js Image**: `import Image from 'next/image'`
2. **Lazy load components**: `const Component = lazy(() => import('./Component'))`
3. **Cache API calls**: Use React Query or SWR
4. **Optimize images**: Use WebP format
5. **Add database indexes**: For frequently queried columns

## Security Checklist

- [ ] Never commit `.env.local`
- [ ] Use environment variables for secrets
- [ ] Validate all user input
- [ ] Use RLS policies in Supabase
- [ ] Test with Stripe test keys first
- [ ] Enable HTTPS in production
- [ ] Use `SUPABASE_SERVICE_ROLE_KEY` only server-side

## Need More Help?

- 📖 [Full Documentation](./README.md)
- 🚀 [Getting Started](./GETTING_STARTED.md)
- 🐛 [Troubleshooting](./TROUBLESHOOTING.md)
- 💬 [GitHub Discussions](https://github.com/brandonlacoste9-tech/Kryptotrac-xx/discussions)
- 🐞 [Open an Issue](https://github.com/brandonlacoste9-tech/Kryptotrac-xx/issues)
