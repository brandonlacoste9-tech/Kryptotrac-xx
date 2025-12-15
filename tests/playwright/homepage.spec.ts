/**
 * E2E Test: Homepage Navigation and Core Features
 * 
 * Tests the main landing page functionality including:
 * - Page load and basic rendering
 * - Navigation to key sections
 * - Core UI elements visibility
 * - Responsive behavior
 */

import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the homepage successfully', async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check that the main heading or title is visible
    await expect(page).toHaveTitle(/KryptoTrac/i);
  });

  test('should display hero section with main CTA', async ({ page }) => {
    // Check for hero section elements
    const heroSection = page.locator('main').first();
    await expect(heroSection).toBeVisible();
    
    // Look for key branding elements (adjust selectors based on actual content)
    const heading = page.getByRole('heading', { level: 1 }).first();
    await expect(heading).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    // Test navigation to pricing page (adjust based on actual navigation)
    const pricingLink = page.getByRole('link', { name: /pricing/i }).first();
    
    if (await pricingLink.isVisible()) {
      await pricingLink.click();
      await page.waitForURL(/\/pricing/);
      await expect(page).toHaveURL(/\/pricing/);
    }
  });

  test('should display feature cards', async ({ page }) => {
    // Check that feature cards are rendered
    // Adjust selector based on actual DOM structure
    const cards = page.locator('[class*="card"]').or(page.locator('article')).or(page.locator('[role="article"]'));
    const count = await cards.count();
    
    // Should have at least one feature card
    expect(count).toBeGreaterThan(0);
  });

  test('should be responsive on mobile', async ({ page, viewport }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify page still loads correctly
    await page.waitForLoadState('networkidle');
    const heroSection = page.locator('main').first();
    await expect(heroSection).toBeVisible();
  });

  test('should have meta tags for SEO', async ({ page }) => {
    // Check for essential meta tags
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveCount(1);
  });
});
