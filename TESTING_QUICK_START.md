# Testing Quick Start Guide

**Get your authentication and payment testing up and running in 5 minutes!**

## TL;DR - Run Tests Now

```bash
# 1. Setup
cp .env.example .env.local
# Edit .env.local with your test credentials

# 2. Install
npm install

# 3. Test!
npm run test:login    # Authentication tests
npm run test:stripe   # Payment tests
npm run test:all      # Everything
```

Or use the interactive test runner:
```bash
./scripts/run-tests.sh
```

## What's Included?

### 📁 Test Files Created

```
tests/
├── e2e/
│   ├── auth.test.ts          # 40+ authentication test cases
│   └── stripe.test.ts        # 30+ payment test cases
└── integration/
    ├── auth-api.test.ts      # API endpoint tests
    └── stripe-api.test.ts    # Payment API tests
```

### 📜 NPM Scripts Added

```json
"test:login"              // Authentication tests
"test:stripe"             // Payment tests
"test:all"                // All tests with coverage
"test:e2e"                // E2E tests only
"test:integration"        // Integration tests only
"test:watch"              // Watch mode for development
```

### 📚 Documentation Created

- `AUTOMATION_SCAN_RESULTS.md` - Complete code analysis
- `MANUAL_VERIFICATION_GUIDE.md` - Step-by-step testing procedures
- `SECURITY_AUDIT_REPORT.md` - Security findings (✅ All Clear!)
- `tests/README.md` - Comprehensive testing guide
- `.env.example` - Environment variable template

### 🛡️ Security Files

- `.gitignore` - Prevents secret leakage
- `.env.example` - Template with no real secrets

## Quick Test Scenarios

### Test User Signup
```bash
npm run test:e2e:auth
# Covers: signup, login, magic link, session, logout
```

### Test Stripe Payment
```bash
npm run test:e2e:stripe
# Covers: checkout, webhooks, success/failure, billing portal
```

### Test with Stripe CLI (Webhooks)
```bash
# Terminal 1: Start your app
npm run dev

# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 3: Trigger events
stripe trigger checkout.session.completed
```

## Environment Setup

### Required Variables (in .env.local)

```bash
# Supabase (use TEST project, not production!)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Stripe (use TEST mode keys!)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

⚠️ **Important:** Always use TEST mode keys, never production!

## Test Card Numbers

```
✅ Success:         4242 4242 4242 4242
❌ Declined:        4000 0000 0000 0002
💰 Insufficient:    4000 0000 0000 9995
⏰ Expired:         4000 0000 0000 0069
🔒 3D Secure:       4000 0025 0000 3155

Expiry: Any future date (12/34)
CVC: Any 3 digits (123)
ZIP: Any 5 digits (12345)
```

## Interactive Test Runner

```bash
./scripts/run-tests.sh
```

Menu options:
1. Run auth tests
2. Run payment tests
3. Run all tests
4. Start webhook testing
5. Trigger test events
...and more!

## What Gets Tested?

### Authentication ✅
- ✅ Signup (valid/invalid)
- ✅ Login (success/failure)
- ✅ Magic link
- ✅ Session management
- ✅ Logout
- ✅ Referral codes
- ✅ Error handling
- ✅ Edge cases

### Payments ✅
- ✅ Checkout creation
- ✅ Successful payments
- ✅ Failed payments
- ✅ Webhook processing
- ✅ Subscription management
- ✅ Billing portal
- ✅ 3D Secure
- ✅ Security validation

## Manual Testing

For scenarios that can't be fully automated:

```bash
# View the comprehensive manual guide
cat MANUAL_VERIFICATION_GUIDE.md

# Or open in your editor/browser
```

Key manual tests:
1. Email confirmation clicks
2. Magic link clicks
3. Complete Stripe checkout UI
4. Billing portal navigation
5. Session across browser tabs

## Security Check Results

✅ **All Clear!**
- No hardcoded secrets found
- All API keys use environment variables
- Webhook signatures verified
- Authentication properly protected

See `SECURITY_AUDIT_REPORT.md` for details.

## Common Issues

### Tests Won't Run?
```bash
# Check prerequisites
./scripts/run-tests.sh --check

# Make sure you have:
# - Node.js installed
# - Dependencies installed (npm install)
# - .env.local configured
```

### Stripe Tests Failing?
```bash
# Verify test mode
echo $STRIPE_SECRET_KEY
# Should start with sk_test_

# Check webhook secret
echo $STRIPE_WEBHOOK_SECRET
# Should start with whsec_
```

### Auth Tests Failing?
```bash
# Verify Supabase config
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Make sure using TEST Supabase project
```

## CI/CD Integration

Add to GitHub Actions:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test:all
    env:
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
      STRIPE_SECRET_KEY: ${{ secrets.TEST_STRIPE_SECRET_KEY }}
```

## Next Steps

1. ✅ **Run automated tests** - `npm run test:all`
2. ✅ **Follow manual guide** - See `MANUAL_VERIFICATION_GUIDE.md`
3. ✅ **Review security report** - See `SECURITY_AUDIT_REPORT.md`
4. ✅ **Set up monitoring** - Track failed logins, payments, webhooks
5. ✅ **Document in CI/CD** - Add tests to deployment pipeline

## Need Help?

- 📖 **Detailed docs:** See `tests/README.md`
- 🔍 **Code analysis:** See `AUTOMATION_SCAN_RESULTS.md`
- 🛡️ **Security:** See `SECURITY_AUDIT_REPORT.md`
- 📝 **Manual tests:** See `MANUAL_VERIFICATION_GUIDE.md`
- 🎯 **Interactive:** Run `./scripts/run-tests.sh`

## Files Added in This PR

```
.env.example                     # Environment template
.gitignore                       # Prevent secret leaks
AUTOMATION_SCAN_RESULTS.md       # Code scan findings
MANUAL_VERIFICATION_GUIDE.md     # Manual test procedures
SECURITY_AUDIT_REPORT.md         # Security audit
TESTING_QUICK_START.md          # This file
jest.config.js                   # Jest configuration
jest.setup.js                    # Test setup
package.json                     # Updated with test scripts
scripts/run-tests.sh            # Interactive test runner
tests/README.md                  # Complete test guide
tests/e2e/auth.test.ts          # Auth E2E tests
tests/e2e/stripe.test.ts        # Payment E2E tests
tests/integration/auth-api.test.ts    # Auth API tests
tests/integration/stripe-api.test.ts  # Payment API tests
```

## Success Criteria

Your testing setup is ready when:
- ✅ All test files are in place
- ✅ Environment variables configured
- ✅ Tests run without errors
- ✅ Manual verification completed
- ✅ Security audit reviewed
- ✅ No secrets in repository

**You're all set! Happy testing! 🚀**
