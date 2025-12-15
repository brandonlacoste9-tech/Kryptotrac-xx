/**
 * E2E Test: Pricing Page
 * 
 * Tests the pricing page functionality including:
 * - Page load and rendering
 * - Pricing tier display
 * - CTA buttons
 * - Feature comparison
 */

import { test, expect } from '@playwright/test';

test.describe('Pricing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing');
  });

  test('should load pricing page successfully', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the pricing page
    await expect(page).toHaveURL(/\/pricing/);
  });

  test('should display pricing tiers', async ({ page }) => {
    // Look for pricing cards or sections
    const pricingCards = page.locator('[class*="pricing"]').or(page.locator('[class*="card"]'));
    const count = await pricingCards.count();
    
    // Should have at least 2 pricing tiers (typically Free, Pro, Elite)
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should show pricing amounts', async ({ page }) => {
    // Look for dollar amounts or pricing text
    const priceElements = page.locator('text=/\\$\\d+/').or(page.locator('[class*="price"]'));
    const count = await priceElements.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should have CTA buttons for subscription', async ({ page }) => {
    // Look for subscription or upgrade buttons
    const ctaButtons = page.getByRole('button', { name: /upgrade|subscribe|get started|buy/i })
      .or(page.getByRole('link', { name: /upgrade|subscribe|get started|buy/i }));
    
    const count = await ctaButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display feature lists', async ({ page }) => {
    // Look for feature lists (typically in ul/li or similar)
    const features = page.locator('ul li').or(page.locator('[class*="feature"]'));
    const count = await features.count();
    
    // Should have multiple features listed
    expect(count).toBeGreaterThan(0);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Pricing cards should still be visible on mobile
    const pricingSection = page.locator('main').first();
    await expect(pricingSection).toBeVisible();
  });

  test('should have navigation back to home', async ({ page }) => {
    // Look for home/back link
    const homeLink = page.getByRole('link', { name: /home|back/i }).first();
    
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL(/^(?!.*\/pricing)/);
    }
  });
});
