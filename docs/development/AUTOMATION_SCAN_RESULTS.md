# Codebase Scan Results: Authentication & Payment Logic

## Authentication Implementation (Supabase)

### Client-Side Authentication
**Location:** `lib/supabase/client.ts`
- Uses `@supabase/ssr` for browser client creation
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Location:** `lib/supabase/server.ts`
- Server-side client with cookie-based session management
- Handles session refresh and token validation

**Location:** `lib/supabase/middleware.ts`
- Middleware for automatic session refresh
- Validates user session on each request
- Gracefully handles missing Supabase configuration

### Authentication Pages

#### Signup Flow
**Location:** `app/auth/signup/page.tsx`
- Email/password signup form
- Email confirmation required
- Referral code support (query param: `ref`)
- Welcome email trigger after signup
- Redirects to confirmation message
- Minimum password length: 6 characters

#### Login Flow
**Location:** `app/auth/login/page.tsx`
- Email/password authentication
- Magic link alternative flow
- Error handling with user feedback
- Redirects to `/dashboard` on success

#### Magic Link Flow
**Location:** `app/auth/magic-link/page.tsx`
- Passwordless authentication option

#### Sign Out
**Location:** `app/auth/signout/route.ts`
- Server-side sign out endpoint

#### Error Handling
**Location:** `app/auth/error/page.tsx`
- Centralized error display page

### API Endpoints Related to Auth

**Location:** `app/api/auth/welcome/route.ts`
- Sends welcome email after signup
- Triggered by signup success

**Location:** `app/api/referrals/process-signup/route.ts`
- Processes referral codes
- Awards credits to both referrer and referee

## Payment Implementation (Stripe)

### Stripe Configuration
**Location:** `lib/stripe.ts`
- Stripe SDK initialization with server-only
- API version: `2024-11-20.acacia`
- Environment variable: `STRIPE_SECRET_KEY`
- Price ID for Pro Monthly: `STRIPE_PRICE_ID_PRO_MONTHLY`

### Payment Flows

#### Checkout Session Creation
**Location:** `app/api/create-checkout-session/route.ts`
- Requires authentication (checks Supabase session)
- Creates or retrieves Stripe customer ID
- Creates subscription checkout session
- Pricing: $9.99 CAD/month for KryptoTrac Pro
- Success URL: `/dashboard?success=true`
- Cancel URL: `/pricing`
- Stores user_id in session metadata

**Location:** `app/actions/stripe.ts`
- Server action for creating checkout sessions
- Supports three plans: starter, pro, elite
- Monthly and yearly billing cycles
- Pricing structure:
  - Starter: $5/month, $50/year
  - Pro: $10/month, $100/year
  - Elite: $20/month, $200/year

#### Billing Portal
**Location:** `app/actions/stripe.ts` (function: `createPortalSession`)
- Customer self-service portal
- Requires existing subscription
- Returns to `/dashboard`

#### Webhook Handler
**Location:** `app/api/webhooks/stripe/route.ts`
- Verifies webhook signature using `STRIPE_WEBHOOK_SECRET`
- Handles three event types:
  1. `checkout.session.completed` - Creates subscription record
  2. `customer.subscription.updated` - Updates subscription status
  3. `customer.subscription.deleted` - Cancels subscription

**Database Operations:**
- Updates `user_subscriptions` table with Stripe data
- Updates `profiles` table with plan_type
- Links Stripe customer/subscription IDs to user_id

## Environment Variables Required

### Supabase (Public - Client-side)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

### Supabase (Private - Server-only)
- `SUPABASE_SERVICE_ROLE_KEY` - Admin operations (found in admin routes)

### Stripe (Public - Client-side)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

### Stripe (Private - Server-only)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Webhook signature verification
- `STRIPE_PRICE_ID_PRO_MONTHLY` - Default price ID (optional)

### Application URLs
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` - Development redirect URL
- `NEXT_PUBLIC_SUPABASE_URL` - Used as fallback for redirect URLs

## Database Schema (from webhook logic)

### Tables Used
1. **user_subscriptions**
   - user_id (FK)
   - stripe_customer_id
   - stripe_subscription_id
   - status
   - plan_type
   - current_period_start
   - current_period_end

2. **profiles**
   - id (user_id)
   - plan_type (free, pro, elite, starter)

## Security Findings

### ✅ Good Practices Found
- All API keys use environment variables
- No hardcoded secrets found in code
- Server-only imports for sensitive operations (`server-only` import)
- Webhook signature verification implemented
- Authentication checks before payment operations
- RLS (Row Level Security) policies mentioned in documentation

### ⚠️ Potential Concerns
1. **Missing .env.example** - No template file for required environment variables
2. **Missing .gitignore** - No explicit .gitignore to prevent .env files from being committed
3. **Error Logging** - Console logs may expose sensitive information in production
4. **Rate Limiting** - No visible rate limiting on auth endpoints
5. **Session Timeout** - Session timeout configuration not visible in code
6. **CSRF Protection** - Not explicitly implemented (relies on Next.js defaults)

## Edge Cases to Consider

### Authentication
1. Email already exists scenario
2. Invalid/expired magic links
3. Concurrent login sessions
4. Session expiry during active use
5. Password reset flow (not found in scan)
6. Email verification failure
7. Referral code edge cases (invalid, expired, self-referral)

### Payments
1. Payment failure during checkout
2. Webhook delivery failures/retries
3. Duplicate webhook events
4. Subscription downgrade/upgrade flows
5. Prorated billing scenarios
6. Failed payment retry logic
7. Subscription cancellation timing
8. Multiple concurrent subscriptions
9. Customer with no subscription trying to access portal

## Test Coverage Gaps

### Authentication Tests Needed
- ✅ Valid signup with email/password
- ✅ Invalid signup (weak password, invalid email)
- ✅ Valid login
- ✅ Invalid login (wrong password, non-existent user)
- ✅ Magic link flow
- ✅ Session persistence
- ✅ Logout
- ⚠️ Password reset (flow not found)
- ⚠️ Email verification edge cases
- ⚠️ Rate limiting

### Payment Tests Needed
- ✅ Checkout session creation (authenticated)
- ✅ Checkout session creation (unauthenticated)
- ✅ Successful payment webhook
- ✅ Failed payment handling
- ✅ Subscription update webhook
- ✅ Subscription cancellation webhook
- ⚠️ Duplicate webhook handling
- ⚠️ Invalid webhook signature
- ⚠️ Portal access without subscription

## Recommendations for Owner

1. **Add Password Reset Flow** - No password reset functionality found
2. **Implement Rate Limiting** - Protect auth endpoints from brute force
3. **Add Request Logging** - Structured logging instead of console.log
4. **Error Messages** - Avoid exposing internal details in error messages
5. **Webhook Idempotency** - Add duplicate event handling
6. **Session Management** - Configure appropriate session timeouts
7. **Test Environment** - Separate test mode for Stripe (use test keys)
8. **Monitoring** - Add alerts for failed webhooks and auth errors
9. **Documentation** - Create API documentation for all endpoints
10. **Backup Admin Access** - Service role key usage needs audit trail

## Next Steps
1. Create comprehensive test suites based on findings
2. Generate .env.example with all required variables
3. Add .gitignore to prevent secret leakage
4. Create test automation scripts
5. Document manual verification procedures
