# Testing Guide for KryptoTrac

This directory contains comprehensive test suites for authentication, payment flows, and wallet management.

## Test Structure

```
tests/
├── e2e/                    # End-to-end tests (full user journeys)
│   ├── auth.test.ts       # Authentication flows
│   └── stripe.test.ts     # Payment flows
├── integration/            # Integration tests (API endpoints)
│   ├── auth-api.test.ts   # Auth API endpoints
│   ├── stripe-api.test.ts # Stripe API endpoints
│   └── wallet-api.test.ts # Wallet CRUD operations
├── unit/                   # Unit tests (utilities & components)
│   ├── cache.test.ts      # Cache utility tests
│   ├── logger.test.ts     # Logger utility tests
│   └── WalletManager.test.tsx # WalletManager component tests
├── playwright/             # Playwright E2E tests
│   ├── auth.spec.ts       # Auth flows
│   ├── homepage.spec.ts   # Homepage tests
│   ├── navigation.spec.ts # Navigation tests
│   ├── pricing.spec.ts    # Pricing page tests
│   ├── user-journey.spec.ts # User journey tests
│   └── wallet-management.spec.ts # Wallet management E2E
└── README.md              # This file
```

## Prerequisites

### Environment Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your test/development credentials:
   - Use **test mode** Supabase project
   - Use **test mode** Stripe keys (sk_test_*, pk_test_*)
   - Never use production credentials for testing!

3. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

### Supabase Setup

1. Create a separate Supabase project for testing
2. Run database migrations from `scripts/` directory
3. Enable email authentication
4. Configure redirect URLs for localhost

### Stripe Setup

1. Use Stripe test mode dashboard
2. Get test API keys from https://dashboard.stripe.com/test/apikeys
3. Create webhook endpoint: http://localhost:3000/api/webhooks/stripe
4. Install Stripe CLI: https://stripe.com/docs/stripe-cli
5. Login to Stripe CLI: `stripe login`

## Running Tests

### Quick Start

```bash
# Run all login/auth tests
npm run test:login

# Run all Stripe/payment tests
npm run test:stripe

# Run all tests
npm run test:all

# Run tests in watch mode (for development)
npm run test:watch

# Run Playwright E2E tests
npm run test:playwright
```

### Individual Test Suites

```bash
# E2E authentication tests
npm run test:e2e:auth

# E2E payment tests
npm run test:e2e:stripe

# Integration API tests
npm run test:integration:auth
npm run test:integration:stripe

# Unit tests
npm run test tests/unit/cache.test.ts
npm run test tests/unit/logger.test.ts
npm run test tests/unit/WalletManager.test.tsx

# Playwright tests
npm run test:playwright tests/playwright/wallet-management.spec.ts
npm run test:playwright:ui  # Run with UI mode
```

### Using Stripe CLI for Webhook Testing

```bash
# Forward webhooks to local development server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal, trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

## Test Coverage

### Authentication Tests (`tests/e2e/auth.test.ts`)

- ✅ Signup with valid credentials
- ✅ Signup with invalid email
- ✅ Signup with weak password
- ✅ Signup with duplicate email
- ✅ Signup with referral code
- ✅ Login with valid credentials
- ✅ Login with wrong password
- ✅ Login with non-existent user
- ✅ Magic link authentication
- ✅ Session persistence
- ✅ Session refresh
- ✅ Logout
- ✅ Error handling
- ✅ Edge cases (concurrent logins, special characters, etc.)

### Payment Tests (`tests/e2e/stripe.test.ts`)

- ✅ Checkout session creation
- ✅ Multiple plan types (Starter, Pro, Elite)
- ✅ Monthly and yearly billing
- ✅ Successful payment (test card)
- ✅ Declined payment scenarios
- ✅ Insufficient funds handling
- ✅ Expired card handling
- ✅ 3D Secure authentication
- ✅ Webhook event processing
- ✅ Subscription management
- ✅ Billing portal access
- ✅ Idempotency
- ✅ Security validation

### Wallet Management Tests

#### Unit Tests (`tests/unit/cache.test.ts`)
- ✅ Cache set/get operations
- ✅ TTL expiration
- ✅ Cache cleanup
- ✅ Statistics tracking
- ✅ Type safety

#### Unit Tests (`tests/unit/logger.test.ts`)
- ✅ Development mode logging
- ✅ Production mode filtering
- ✅ JSON formatting
- ✅ Context handling
- ✅ V0 compatibility

#### Component Tests (`tests/unit/WalletManager.test.tsx`)
- ✅ Loading state rendering
- ✅ Empty state display
- ✅ Wallet list rendering
- ✅ Add wallet form validation
- ✅ Edit wallet label
- ✅ Delete wallet confirmation
- ✅ Error handling

#### Integration Tests (`tests/integration/wallet-api.test.ts`)
- ✅ Create wallet with valid address
- ✅ Ethereum address validation
- ✅ Duplicate wallet prevention
- ✅ List user wallets
- ✅ Update wallet label
- ✅ Delete wallet
- ✅ Row Level Security enforcement

#### E2E Tests (`tests/playwright/wallet-management.spec.ts`)
- ✅ Navigate to wallet settings
- ✅ Add wallet flow
- ✅ Invalid address validation
- ✅ Edit wallet label
- ✅ Delete wallet with confirmation
- ✅ Wallet persistence across refresh
- ✅ Empty state display
- ✅ Duplicate prevention
- ✅ Performance benchmarks

### API Tests

- ✅ Authentication endpoints
- ✅ Welcome email sending
- ✅ Referral processing
- ✅ Checkout session API
- ✅ Webhook signature verification
- ✅ Wallet CRUD operations
- ✅ Error handling
- ✅ Security checks

## Manual Testing Checklist

### Critical User Flows

#### 1. Complete Signup Flow
- [ ] Navigate to /auth/signup
- [ ] Enter valid email and password
- [ ] Submit form
- [ ] Check email for confirmation link
- [ ] Click confirmation link
- [ ] Verify redirected to dashboard
- [ ] Check profile created in Supabase

#### 2. Complete Login Flow
- [ ] Navigate to /auth/login
- [ ] Enter credentials
- [ ] Submit form
- [ ] Verify redirected to dashboard
- [ ] Check session persists after refresh
- [ ] Test logout functionality

#### 3. Magic Link Flow
- [ ] Navigate to /auth/magic-link
- [ ] Enter email address
- [ ] Check email arrives within 1 minute
- [ ] Click magic link
- [ ] Verify instant login to dashboard

#### 4. Complete Payment Flow
- [ ] Login to application
- [ ] Navigate to /pricing
- [ ] Select Pro plan
- [ ] Click "Subscribe" button
- [ ] Fill Stripe checkout form
- [ ] Use test card: 4242 4242 4242 4242
- [ ] Complete payment
- [ ] Verify redirect to dashboard with success message
- [ ] Check subscription status shows "Pro"
- [ ] Verify database updated (user_subscriptions table)

#### 5. Failed Payment Flow
- [ ] Start checkout process
- [ ] Use declined card: 4000 0000 0000 0002
- [ ] Verify error message shown
- [ ] Verify user remains on free plan
- [ ] Verify no subscription created

#### 6. Webhook Processing
- [ ] Complete successful payment
- [ ] Check webhook logs in Stripe dashboard
- [ ] Verify webhook delivered to your endpoint
- [ ] Check database for subscription record
- [ ] Verify user plan updated

#### 7. Billing Portal
- [ ] Login as subscribed user
- [ ] Access billing portal link
- [ ] Verify subscription details visible
- [ ] Test updating payment method
- [ ] Test canceling subscription
- [ ] Verify changes reflected in app

#### 8. Wallet Management Flow
- [ ] Login to application
- [ ] Navigate to /settings/wallets
- [ ] Click "Add Wallet" button
- [ ] Enter valid Ethereum address
- [ ] Enter wallet label
- [ ] Submit form
- [ ] Verify wallet appears in list
- [ ] Click edit button
- [ ] Change wallet label
- [ ] Save changes
- [ ] Verify label updated
- [ ] Click delete button
- [ ] Confirm deletion
- [ ] Verify wallet removed
- [ ] Refresh page
- [ ] Verify changes persisted

### Security Checks

- [ ] Verify no .env files committed to git
- [ ] Check no hardcoded API keys in source code
- [ ] Test checkout requires authentication
- [ ] Test webhook validates signatures
- [ ] Verify error messages don't expose internals
- [ ] Check logs don't contain secrets
- [ ] Test rate limiting on auth endpoints
- [ ] Verify wallet RLS policies in Supabase
- [ ] Test users can only access own wallets

## Test Data

### Stripe Test Cards

```
Success: 4242 4242 4242 4242
Declined: 4000 0000 0000 0002
Insufficient Funds: 4000 0000 0000 9995
Expired: 4000 0000 0000 0069
Incorrect CVC: 4000 0000 0000 0127
Processing Error: 4000 0000 0000 0119
Requires 3D Secure: 4000 0025 0000 3155
```

For any test card:
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

### Test Ethereum Addresses

```
Valid: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
Valid: 0x1234567890123456789012345678901234567890
Invalid: not-a-valid-address
Invalid: 0x123 (too short)
```

### Test Users

Create test users with pattern: `test+<identifier>@example.com`

Example:
- test+signup@example.com
- test+login@example.com
- test+payment@example.com
- test+wallets@example.com

This allows multiple test accounts with same base email.

## Troubleshooting

### Tests Failing?

1. **Check environment variables**
   - Verify all required vars in .env.local
   - Ensure using test mode keys
   - Confirm URLs are correct

2. **Supabase connection issues**
   - Check Supabase project is running
   - Verify API keys are valid
   - Check network connectivity

3. **Stripe test failures**
   - Verify using test mode keys (sk_test_*)
   - Check Stripe CLI is running for webhooks
   - Ensure webhook secret is correct

4. **Database errors**
   - Run database migrations
   - Check RLS policies enabled
   - Verify table structure matches code

5. **Wallet test failures**
   - Verify user_wallets table exists
   - Check RLS policies are configured
   - Ensure test user has proper permissions

### Common Issues

**"Invalid JWT" errors**
- Session expired, login again
- Check auth middleware is running

**"Customer not found" errors**
- User doesn't have Stripe customer ID
- Create checkout session first

**"Webhook signature verification failed"**
- Check STRIPE_WEBHOOK_SECRET is correct
- Verify using Stripe CLI generated secret

**"Rate limit exceeded"**
- Wait a few minutes
- Reduce test frequency

**"Wallet already exists"**
- Clean up test wallets between runs
- Use unique addresses for each test

## CI/CD Integration

These tests can be integrated into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test:all
      - run: npm run test:playwright
    env:
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
      STRIPE_SECRET_KEY: ${{ secrets.TEST_STRIPE_SECRET_KEY }}
      STRIPE_WEBHOOK_SECRET: ${{ secrets.TEST_STRIPE_WEBHOOK_SECRET }}
      TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
      TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
```

## Best Practices

1. **Always use test mode** for Stripe and test Supabase projects
2. **Never commit secrets** - use environment variables
3. **Clean up test data** after test runs
4. **Mock external services** where possible
5. **Test error cases** as thoroughly as success cases
6. **Document manual steps** that can't be automated
7. **Keep tests independent** - don't rely on test execution order
8. **Use descriptive test names** - clearly state what is being tested
9. **Test with realistic data** - use valid Ethereum addresses
10. **Verify RLS policies** - ensure proper data isolation

## Contributing

When adding new features:

1. Write tests for new authentication flows
2. Add tests for new payment scenarios
3. Add tests for new wallet features
4. Update this README with new test coverage
5. Document any new manual verification steps
6. Add new test cards or scenarios as needed

## Support

For issues or questions:
1. Check this README first
2. Review test output for specific errors
3. Check Supabase and Stripe dashboards
4. Review application logs
5. Consult Supabase and Stripe documentation

## Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Stripe Testing Docs](https://stripe.com/docs/testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://testingjavascript.com/)
