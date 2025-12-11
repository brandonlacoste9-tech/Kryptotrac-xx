# Unit Tests

This directory contains unit tests for individual components and utilities.

## Security Tests

### ChartStyle Security Tests
Location: `chart-style-security.test.tsx`

Comprehensive security test suite validating that the ChartStyle component properly sanitizes inputs and prevents CSS injection attacks.

**Coverage:**
- Chart ID validation (alphanumeric, hyphens, underscores only)
- Config key validation (alphanumeric, hyphens, underscores only)
- Color value validation (hex, rgb, rgba, hsl, hsla, CSS variables, keywords)
- Alpha value validation (strict 0-1 range for rgba/hsla)
- Attack vector simulation (XSS, CSS injection, style breakout)
- Edge cases and mixed valid/invalid inputs

**Run tests:**
```bash
npm test tests/unit/chart-style-security.test.tsx
```

### ChartStyle Smoke Tests
Location: `chart-style-smoke.test.tsx`

Smoke tests verifying normal operation of the ChartStyle component with valid configurations.

**Coverage:**
- Basic color configurations
- Multiple color formats
- Theme configurations (light/dark)
- CSS variable colors
- Real-world usage patterns

**Run tests:**
```bash
npm test tests/unit/chart-style-smoke.test.tsx
```

## Running All Unit Tests

```bash
npm test tests/unit/
```

## Test Results

All tests should pass to ensure:
1. Security validations are working correctly
2. Valid configurations continue to render properly
3. No regression in functionality after security enhancements
