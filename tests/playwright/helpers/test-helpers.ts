/**
 * Test Helper Utilities for Playwright Tests
 * 
 * Common functions and utilities used across multiple test files
 */

import { Page, expect } from '@playwright/test';

/**
 * Wait for the page to be fully loaded including network activity
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Check if an element exists on the page (without throwing)
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  try {
    const element = await page.locator(selector).first();
    return await element.isVisible();
  } catch {
    return false;
  }
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ 
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true 
  });
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(page: Page, urlPattern: RegExp) {
  await page.waitForURL(urlPattern, { timeout: 10000 });
  await waitForPageLoad(page);
}

/**
 * Scroll to element and ensure it's in viewport
 */
export async function scrollToElement(page: Page, selector: string) {
  await page.locator(selector).first().scrollIntoViewIfNeeded();
}

/**
 * Check if page has expected meta tags
 */
export async function hasMetaTags(page: Page) {
  const description = await page.locator('meta[name="description"]').count();
  const viewport = await page.locator('meta[name="viewport"]').count();
  
  return description > 0 && viewport > 0;
}

/**
 * Get all visible buttons on the page
 */
export async function getVisibleButtons(page: Page) {
  return await page.getByRole('button').all();
}

/**
 * Get all links on the page
 */
export async function getAllLinks(page: Page) {
  return await page.getByRole('link').all();
}

/**
 * Check if the app is in mobile view
 */
export async function isMobileView(page: Page): Promise<boolean> {
  const viewport = page.viewportSize();
  return viewport ? viewport.width < 768 : false;
}

/**
 * Fill form field by label or placeholder
 */
export async function fillFormField(page: Page, fieldName: string, value: string) {
  const field = page.getByLabel(new RegExp(fieldName, 'i'))
    .or(page.getByPlaceholder(new RegExp(fieldName, 'i')));
  
  await field.first().fill(value);
}

/**
 * Submit a form
 */
export async function submitForm(page: Page, buttonText?: string) {
  const button = buttonText 
    ? page.getByRole('button', { name: new RegExp(buttonText, 'i') })
    : page.getByRole('button[type="submit"]');
  
  await button.first().click();
}

/**
 * Wait for a toast/notification to appear
 */
export async function waitForToast(page: Page, timeout = 5000) {
  // Common toast/notification selectors
  const toastSelectors = [
    '[role="alert"]',
    '[role="status"]',
    '[class*="toast"]',
    '[class*="notification"]',
    '[class*="snackbar"]'
  ];
  
  for (const selector of toastSelectors) {
    try {
      await page.locator(selector).first().waitFor({ timeout, state: 'visible' });
      return true;
    } catch {
      continue;
    }
  }
  
  return false;
}

/**
 * Clear browser storage
 */
export async function clearStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Set viewport to common device sizes
 */
export const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
  desktopSmall: { width: 1366, height: 768 },
};

/**
 * Mock API response
 */
export async function mockApiResponse(
  page: Page, 
  urlPattern: string | RegExp, 
  response: any
) {
  await page.route(urlPattern, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Check for console errors
 */
export async function checkForConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  return errors;
}

/**
 * Check accessibility (basic)
 */
export async function checkBasicAccessibility(page: Page) {
  // Check for proper heading hierarchy
  const h1Count = await page.locator('h1').count();
  expect(h1Count).toBeGreaterThan(0);
  expect(h1Count).toBeLessThanOrEqual(1); // Ideally only one h1 per page
  
  // Check for alt text on images
  const images = await page.locator('img').all();
  for (const img of images) {
    const alt = await img.getAttribute('alt');
    expect(alt).toBeDefined();
  }
}
