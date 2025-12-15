# Playwright E2E Tests

This directory contains end-to-end (E2E) tests for KryptoTrac using Playwright.

## Overview

Playwright is a modern E2E testing framework that allows us to test our application across different browsers (Chromium, Firefox, WebKit) and devices (desktop, mobile).

## Prerequisites

Before running the tests, ensure you have:
- Node.js 18+ installed
- All project dependencies installed (`npm install`)
- Playwright browsers installed (`npx playwright install`)

## Running Tests

### Install Playwright Browsers (First Time Only)

```bash
npx playwright install
```

Or install specific browsers:

```bash
npx playwright install chromium firefox webkit
```

### Run All Tests

```bash
npm run test:playwright
```

### Run Tests with UI Mode

UI mode provides an interactive way to run and debug tests:

```bash
npm run test:playwright:ui
```

### Run Tests in Headed Mode

See the browser while tests run:

```bash
npm run test:playwright:headed
```

### Run Tests for Specific Browser

```bash
# Chromium only
npm run test:playwright:chromium

# Firefox only
npm run test:playwright:firefox

# WebKit (Safari) only
npm run test:playwright:webkit
```

### View Test Report

After tests run, view the HTML report:

```bash
npm run test:playwright:report
```

## Test Structure

```
tests/playwright/
├── README.md           # This file
├── homepage.spec.ts    # Homepage navigation and UI tests
├── auth.spec.ts        # Authentication flow tests
└── pricing.spec.ts     # Pricing page tests
```

## Writing New Tests

### Basic Test Example

```typescript
import { test, expect } from '@playwright/test';

test('my test', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/KryptoTrac/);
});
```

### Best Practices

1. **Use Descriptive Test Names**: Clearly describe what the test does
2. **Keep Tests Independent**: Each test should run independently
3. **Use Page Object Model**: For complex pages, consider using POM pattern
4. **Handle Async Properly**: Always await async operations
5. **Use Built-in Waits**: Playwright auto-waits, but use explicit waits when needed
6. **Test Critical Paths**: Focus on user journeys that matter most

### Common Patterns

#### Navigation

```typescript
await page.goto('/dashboard');
await expect(page).toHaveURL(/\/dashboard/);
```

#### Interacting with Elements

```typescript
// Click button
await page.getByRole('button', { name: 'Submit' }).click();

// Fill input
await page.getByLabel('Email').fill('test@example.com');

// Select from dropdown
await page.getByRole('combobox').selectOption('option-value');
```

#### Assertions

```typescript
// Element visibility
await expect(page.getByText('Welcome')).toBeVisible();

// Text content
await expect(page.locator('h1')).toHaveText('KryptoTrac');

// Count
await expect(page.getByRole('button')).toHaveCount(3);
```

## CI/CD Integration

Tests automatically run in GitHub Actions on:
- Pull requests to `main` and `develop` branches
- Pushes to `main` and `develop` branches

See `.github/workflows/playwright.yml` for the workflow configuration.

## Debugging

### Debug a Specific Test

```bash
npx playwright test --debug auth.spec.ts
```

### View Traces

When tests fail in CI, traces are uploaded as artifacts. Download and view them:

```bash
npx playwright show-trace trace.zip
```

### Use Playwright Inspector

```bash
PWDEBUG=1 npm run test:playwright
```

## Configuration

The Playwright configuration is in `playwright.config.ts` at the project root. Key settings:

- **Test Directory**: `./tests/playwright`
- **Base URL**: `http://localhost:3000` (configurable via `PLAYWRIGHT_BASE_URL`)
- **Timeout**: 30 seconds per test
- **Retries**: 2 retries in CI, 0 locally
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari

## Troubleshooting

### "Browser not found" Error

Run:
```bash
npx playwright install
```

### Tests Failing Locally but Passing in CI

Check your environment variables and ensure the app is running correctly locally.

### Flaky Tests

- Add explicit waits: `await page.waitForLoadState('networkidle')`
- Use auto-waiting matchers: `await expect(locator).toBeVisible()`
- Increase timeout for specific actions

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Selectors Guide](https://playwright.dev/docs/selectors)

## Support

For issues with tests, please open an issue in the repository or contact the development team.
