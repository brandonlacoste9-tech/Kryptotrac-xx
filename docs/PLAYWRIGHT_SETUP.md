# Playwright E2E Testing Setup Guide

## Overview

This document provides a comprehensive guide to the Playwright end-to-end (E2E) testing setup for KryptoTrac. Playwright allows us to test the application across multiple browsers and devices, ensuring a consistent user experience.

## What is Playwright?

Playwright is a modern E2E testing framework developed by Microsoft that enables:
- **Cross-browser testing**: Test on Chromium, Firefox, and WebKit
- **Mobile emulation**: Test responsive designs on various devices
- **Auto-waiting**: Smart waiting for elements to be ready
- **Network interception**: Mock API responses for isolated tests
- **Visual testing**: Screenshots and video capture on failures
- **Parallel execution**: Fast test runs with multiple workers

## Installation

### First-Time Setup

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Install Playwright browsers**:
   ```bash
   npx playwright install
   ```

   Or install specific browsers:
   ```bash
   npx playwright install chromium firefox webkit
   ```

3. **Verify installation**:
   ```bash
   npx playwright --version
   ```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm run test:playwright

# Run with UI mode (recommended for development)
npm run test:playwright:ui

# Run with visible browser
npm run test:playwright:headed

# Run specific browser
npm run test:playwright:chromium
npm run test:playwright:firefox
npm run test:playwright:webkit

# View HTML report
npm run test:playwright:report
```

### Advanced Options

```bash
# Run specific test file
npx playwright test homepage.spec.ts

# Run tests matching a pattern
npx playwright test --grep "authentication"

# Run in debug mode
npx playwright test --debug

# Run with specific timeout
npx playwright test --timeout=60000

# Update snapshots
npx playwright test --update-snapshots
```

## Test Structure

### Directory Layout

```
tests/playwright/
├── .env.example              # Environment variables template
├── README.md                 # Quick reference guide
├── helpers/
│   └── test-helpers.ts       # Reusable utility functions
├── homepage.spec.ts          # Homepage tests
├── auth.spec.ts              # Authentication flow tests
├── pricing.spec.ts           # Pricing page tests
├── navigation.spec.ts        # Cross-browser navigation tests
└── user-journey.spec.ts      # Complete user journey tests
```

### Test File Naming Convention

- Use `.spec.ts` extension for test files
- Name files descriptively: `[feature].spec.ts`
- Group related tests in the same file using `test.describe()`

## Writing Tests

### Basic Test Example

```typescript
import { test, expect } from '@playwright/test';

test('basic test example', async ({ page }) => {
  // Navigate to page
  await page.goto('/');
  
  // Interact with elements
  await page.getByRole('button', { name: 'Click me' }).click();
  
  // Assert expectations
  await expect(page.getByText('Success')).toBeVisible();
});
```

### Using Test Helpers

```typescript
import { test, expect } from '@playwright/test';
import { waitForPageLoad, fillFormField } from './helpers/test-helpers';

test('using helpers', async ({ page }) => {
  await page.goto('/auth/login');
  await waitForPageLoad(page);
  
  await fillFormField(page, 'email', 'test@example.com');
  await fillFormField(page, 'password', 'password123');
});
```

### Best Practices

1. **Use Descriptive Test Names**
   ```typescript
   test('should allow user to login with valid credentials', async ({ page }) => {
     // ...
   });
   ```

2. **Keep Tests Independent**
   - Each test should run independently
   - Don't rely on state from other tests
   - Use `beforeEach` for common setup

3. **Use Built-in Locators**
   ```typescript
   // Good - semantic and resilient
   page.getByRole('button', { name: 'Submit' })
   page.getByLabel('Email')
   page.getByText('Welcome')
   
   // Avoid - brittle and hard to maintain
   page.locator('.css-class-xyz-123')
   page.locator('#id-that-might-change')
   ```

4. **Handle Async Properly**
   ```typescript
   // Always await async operations
   await page.goto('/');
   await page.click('button');
   await expect(page.locator('h1')).toBeVisible();
   ```

5. **Use Auto-waiting**
   ```typescript
   // Playwright auto-waits for elements to be ready
   await page.getByRole('button').click(); // waits for button to be clickable
   await expect(page.getByText('Success')).toBeVisible(); // waits for element
   ```

## Configuration

The main configuration is in `playwright.config.ts` at the project root:

### Key Settings

```typescript
{
  testDir: './tests/playwright',           // Test directory
  timeout: 30 * 1000,                      // 30 second timeout per test
  fullyParallel: true,                     // Run tests in parallel
  retries: process.env.CI ? 2 : 0,        // Retry failed tests in CI
  workers: process.env.CI ? 1 : undefined, // Parallel workers
  use: {
    baseURL: 'http://localhost:3000',      // Base URL for tests
    trace: 'on-first-retry',               // Trace on failure
    screenshot: 'only-on-failure',         // Screenshot on failure
  }
}
```

### Environment Variables

Create `.env` in `tests/playwright/` directory (copy from `.env.example`):

```env
PLAYWRIGHT_BASE_URL=http://localhost:3000
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
```

## CI/CD Integration

### GitHub Actions Workflow

The `.github/workflows/playwright.yml` workflow automatically:
- Runs on pushes to `main` and `develop` branches
- Runs on pull requests to `main` and `develop` branches
- Tests across Chromium, Firefox, and WebKit
- Uploads test results and traces as artifacts
- Provides a test summary

### Workflow Features

- **Matrix Strategy**: Tests run in parallel across browsers
- **Dependency Caching**: npm dependencies are cached for faster runs
- **Artifact Upload**: Test results and traces saved for 30 days
- **Fail-fast Disabled**: All browser tests run even if one fails

## Debugging

### Local Debugging

1. **UI Mode** (Recommended):
   ```bash
   npm run test:playwright:ui
   ```
   - Interactive test runner
   - Visual test inspector
   - Time-travel debugging

2. **Debug Mode**:
   ```bash
   npx playwright test --debug
   ```
   - Opens Playwright Inspector
   - Step through tests
   - Inspect page state

3. **Headed Mode**:
   ```bash
   npm run test:playwright:headed
   ```
   - See browser while tests run
   - Useful for understanding test flow

### Debugging Failed CI Tests

1. Download artifacts from GitHub Actions
2. Extract trace files
3. View traces:
   ```bash
   npx playwright show-trace trace.zip
   ```

### Common Issues

#### "Browser not found"
```bash
npx playwright install
```

#### "Timeout waiting for element"
- Increase timeout for specific action
- Check if element selector is correct
- Verify page is fully loaded

#### "Test is flaky"
- Add explicit waits: `await page.waitForLoadState('networkidle')`
- Use auto-waiting assertions: `await expect(locator).toBeVisible()`
- Avoid hardcoded waits: `await page.waitForTimeout(1000)` (use as last resort)

## Test Coverage

### Current Test Coverage

1. **Homepage Tests** (`homepage.spec.ts`)
   - Page loading and rendering
   - Hero section visibility
   - Navigation functionality
   - Feature cards display
   - Mobile responsiveness
   - SEO meta tags

2. **Authentication Tests** (`auth.spec.ts`)
   - Login page accessibility
   - Signup page accessibility
   - Form validation
   - Navigation between auth pages
   - Protected route redirects

3. **Pricing Tests** (`pricing.spec.ts`)
   - Pricing page rendering
   - Pricing tier display
   - CTA buttons
   - Feature lists
   - Mobile responsiveness

4. **Navigation Tests** (`navigation.spec.ts`)
   - Cross-browser compatibility
   - Page navigation
   - Responsive layouts
   - Back/forward navigation
   - Static asset loading
   - Keyboard navigation

5. **User Journey Tests** (`user-journey.spec.ts`)
   - Complete visitor flow
   - Marketing flow
   - Error handling
   - Performance checks

## Performance Testing

### Load Time Assertions

```typescript
test('should load within acceptable time', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000); // 3 second threshold
});
```

### Monitoring Console Errors

```typescript
test('should not have console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  await page.goto('/');
  expect(errors).toHaveLength(0);
});
```

## Resources

### Documentation
- [Playwright Official Docs](https://playwright.dev)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)

### Tutorials
- [Writing Your First Test](https://playwright.dev/docs/writing-tests)
- [Selectors Guide](https://playwright.dev/docs/selectors)
- [Test Assertions](https://playwright.dev/docs/test-assertions)

### Tools
- [Playwright Inspector](https://playwright.dev/docs/inspector)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)

## Support

For issues or questions:
- Check [tests/playwright/README.md](../tests/playwright/README.md)
- Review [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)
- Open an issue in the repository
- Contact the development team

## Future Enhancements

Potential improvements to the testing suite:
- Visual regression testing
- API mocking and testing
- Accessibility testing with axe-core
- Performance profiling
- Component testing
- Database seeding for integration tests
- Authentication state management

---

**Last Updated**: December 2025
