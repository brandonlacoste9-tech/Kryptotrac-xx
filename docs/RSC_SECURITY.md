# React Server Components (RSC) Security - RCE Vulnerability Fix

## Overview

This document describes the React Server Components RCE (Remote Code Execution) vulnerability and the mitigations implemented in this application.

## The Vulnerability

### Background

React 19 introduced Server Components, which allow components to run on the server and serialize their output to be sent to the client. While this provides significant performance benefits, it also introduces a security risk: **sensitive server-side data can accidentally be leaked to the client** if not properly protected.

### The Risk

When server components access sensitive environment variables (API keys, secrets, tokens, passwords), these values can inadvertently be serialized and sent to the client if:

1. They are passed as props to Client Components
2. They are included in serializable objects returned from server functions
3. They are embedded in RSC payload without proper protection

This can lead to:
- **Credential Exposure**: API keys, database passwords, and other secrets exposed to clients
- **Privilege Escalation**: Admin tokens and service role keys accessible to unauthorized users
- **Remote Code Execution**: In certain configurations, leaked credentials can be used to execute arbitrary code

### Affected Versions

- React 19.x with Server Components
- Next.js 13+ (App Router)

## The Solution: React Taint API

React 19 provides experimental APIs to prevent sensitive data from being sent to the client:

- `experimental_taintUniqueValue`: Taints scalar values (strings, numbers)
- `experimental_taintObjectReference`: Taints object references

When a tainted value is attempted to be serialized to the client, React throws an error, preventing the leak.

## Implementation

### 1. Taint Utility Module

Created `/lib/taint.ts` with helper functions:

```typescript
import { experimental_taintObjectReference, experimental_taintUniqueValue } from 'react'

export function taintUniqueValue(message: string, value: string): void {
  if (typeof value === 'string' && value.length > 0) {
    experimental_taintUniqueValue(message, value, value)
  }
}

export function taintObjectReference(message: string, object: object): void {
  if (object && typeof object === 'object') {
    experimental_taintObjectReference(message, object)
  }
}

export function taintEnvironmentVariables(
  variables: Array<{ name: string; value: string | undefined }>
): void {
  variables.forEach(({ name, value }) => {
    if (value) {
      taintUniqueValue(
        `Environment variable ${name} must not be sent to the client`,
        value
      )
    }
  })
}
```

### 2. Protected Sensitive Data

#### Stripe Secrets (`lib/stripe.ts`)
```typescript
import { taintEnvironmentVariables } from "./taint"

taintEnvironmentVariables([
  { name: 'STRIPE_SECRET_KEY', value: process.env.STRIPE_SECRET_KEY },
  { name: 'STRIPE_WEBHOOK_SECRET', value: process.env.STRIPE_WEBHOOK_SECRET },
])
```

#### Supabase Service Role Key (`lib/supabase/server.ts`)
```typescript
import { taintEnvironmentVariables } from "../taint"

taintEnvironmentVariables([
  { name: 'SUPABASE_SERVICE_ROLE_KEY', value: process.env.SUPABASE_SERVICE_ROLE_KEY },
])
```

#### Admin Tokens
- `app/api/admin/analytics/route.ts`
- `app/api/admin/subscription-analytics/route.ts`

```typescript
import { taintEnvironmentVariables } from '@/lib/taint'

taintEnvironmentVariables([
  { name: 'ADMIN_ANALYTICS_TOKEN', value: process.env.ADMIN_ANALYTICS_TOKEN },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', value: process.env.SUPABASE_SERVICE_ROLE_KEY },
])
```

#### Webhook & Cron Secrets
- `app/api/webhooks/stripe/route.ts`
- `app/api/cron/snapshot-portfolios/route.ts`
- `app/api/cron/send-digests/route.ts`

```typescript
import { taintUniqueValue } from '@/lib/taint'

if (process.env.STRIPE_WEBHOOK_SECRET) {
  taintUniqueValue('STRIPE_WEBHOOK_SECRET must not be sent to the client', process.env.STRIPE_WEBHOOK_SECRET)
}

if (process.env.CRON_SECRET) {
  taintUniqueValue('CRON_SECRET must not be sent to the client', process.env.CRON_SECRET)
}
```

#### Third-Party API Tokens (`lib/x.ts`)
```typescript
import { taintUniqueValue } from './taint'

if (process.env.X_BEARER_TOKEN) {
  taintUniqueValue('X_BEARER_TOKEN must not be sent to the client', process.env.X_BEARER_TOKEN)
}
```

## Protected Environment Variables

The following sensitive environment variables are now protected:

| Variable | Purpose | Protected In |
|----------|---------|--------------|
| `STRIPE_SECRET_KEY` | Stripe API authentication | `lib/stripe.ts` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook validation | `lib/stripe.ts`, `app/api/webhooks/stripe/route.ts` |
| `SUPABASE_SERVICE_ROLE_KEY` | Database admin access | `lib/supabase/server.ts`, admin routes |
| `ADMIN_ANALYTICS_TOKEN` | Admin API authentication | `app/api/admin/subscription-analytics/route.ts` |
| `CRON_SECRET` | Cron job authentication | `app/api/cron/*` routes |
| `X_BEARER_TOKEN` | X (Twitter) API authentication | `lib/x.ts` |

**Note**: `NEXT_PUBLIC_*` variables are intentionally public and do NOT need tainting.

## Testing

### Unit Tests

Created `tests/unit/taint-security.test.ts` with comprehensive tests:

- ✅ Taint unique values (strings, secrets)
- ✅ Taint object references
- ✅ Taint multiple environment variables
- ✅ Automatic sensitive variable detection
- ✅ Skip NEXT_PUBLIC_* variables
- ✅ Real-world usage scenarios
- ✅ Error handling

Run tests:
```bash
npm test tests/unit/taint-security.test.ts
```

### Manual Verification

To verify the protection is working:

1. **Development Mode**: Taint APIs work in development
2. **Build**: `npm run build` - should complete successfully
3. **Runtime**: Any attempt to pass tainted values to client components will throw an error

Example of what will happen if protection is triggered:
```
Error: This value is tainted and cannot be sent to the client.
STRIPE_SECRET_KEY must not be sent to the client
```

## Best Practices

### ✅ DO

1. **Taint at Module Initialization**
   ```typescript
   // At top of file, after imports
   taintEnvironmentVariables([
     { name: 'SECRET_KEY', value: process.env.SECRET_KEY }
   ])
   ```

2. **Use Descriptive Error Messages**
   ```typescript
   taintUniqueValue(
     'API_KEY must not be sent to the client. Use the public key instead.',
     apiKey
   )
   ```

3. **Taint in Server-Only Modules**
   ```typescript
   import 'server-only'
   import { taintUniqueValue } from './taint'
   ```

4. **Use TypeScript for Type Safety**
   ```typescript
   const secret: string = process.env.SECRET_KEY!
   taintUniqueValue('Secret key protection', secret)
   ```

### ❌ DON'T

1. **Don't Taint Public Values**
   ```typescript
   // ❌ These are meant to be public
   taintUniqueValue('error', process.env.NEXT_PUBLIC_API_URL)
   ```

2. **Don't Rely Solely on Tainting**
   - Still follow security best practices
   - Use proper authentication and authorization
   - Validate and sanitize all inputs
   - Implement rate limiting

3. **Don't Pass Tainted Values to Client Components**
   ```typescript
   // ❌ This will throw an error
   <ClientComponent apiKey={taintedApiKey} />
   ```

4. **Don't Store Secrets in Code**
   ```typescript
   // ❌ Never do this
   const apiKey = "sk_live_123..." // Hardcoded secret
   ```

## Migration Guide

### For Existing Code

If you have existing server code that uses environment variables:

1. **Identify sensitive variables**
   - API keys, secrets, tokens
   - Database passwords, connection strings
   - Webhook secrets, signing keys
   - Admin tokens, service account credentials

2. **Add tainting at module initialization**
   ```typescript
   import { taintEnvironmentVariables } from '@/lib/taint'
   
   taintEnvironmentVariables([
     { name: 'YOUR_SECRET', value: process.env.YOUR_SECRET }
   ])
   ```

3. **Test thoroughly**
   - Run your application
   - Verify no taint errors occur during normal operation
   - Check that client components don't receive tainted values

### For New Code

1. **Always taint sensitive environment variables** when importing them
2. **Use the taint utility module** for consistency
3. **Add tests** for new tainted values
4. **Document** what you're protecting and why

## Security Checklist

Before deploying:

- [ ] All sensitive environment variables are tainted
- [ ] No hardcoded secrets in source code
- [ ] Tests pass, including taint security tests
- [ ] Build succeeds without taint errors
- [ ] CodeQL security scan passes
- [ ] Environment variables properly configured in deployment

## References

- [React 19 Taint API Documentation](https://react.dev/reference/react/experimental_taintObjectReference)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#security)
- [OWASP: Sensitive Data Exposure](https://owasp.org/www-community/vulnerabilities/Information_exposure_through_query_strings_in_url)
- [React Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)

## Support

For questions or concerns:
- Open a security advisory on GitHub
- Contact the security team
- Review with senior engineers before modifying taint logic

## Version History

### 2025-12-15 - Initial Implementation
- Added taint utility module (`lib/taint.ts`)
- Protected Stripe secrets
- Protected Supabase service role key
- Protected admin and cron secrets
- Protected third-party API tokens
- Added comprehensive tests
- Created security documentation

---

**IMPORTANT**: This protection is a defense-in-depth measure. Continue following all security best practices:
- Never commit secrets to version control
- Use environment variables for all secrets
- Implement proper authentication and authorization
- Regularly rotate credentials
- Monitor for suspicious activity
