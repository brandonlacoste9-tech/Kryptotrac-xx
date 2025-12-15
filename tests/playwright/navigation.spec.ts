/**
 * E2E Test: Cross-Browser Navigation
 * 
 * Tests that verify the application works correctly across different browsers.
 * These tests demonstrate cross-browser compatibility.
 */

import { test, expect } from '@playwright/test';
import { waitForPageLoad, viewports } from './helpers/test-helpers';

test.describe('Cross-Browser Navigation Tests', () => {
  test('should load homepage across all browsers', async ({ page, browserName }) => {
    await page.goto('/');
    await waitForPageLoad(page);
    
    // Verify page loaded successfully
    await expect(page).toHaveTitle(/KryptoTrac/i);
    
    // Log which browser is being tested
    console.log(`✓ Homepage loaded successfully on ${browserName}`);
  });

  test('should navigate between pages consistently', async ({ page, browserName }) => {
    // Start at homepage
    await page.goto('/');
    await waitForPageLoad(page);
    
    // Navigate to pricing
    const pricingLink = page.getByRole('link', { name: /pricing/i }).first();
    if (await pricingLink.isVisible()) {
      await pricingLink.click();
      await expect(page).toHaveURL(/\/pricing/);
      console.log(`✓ Navigation to pricing works on ${browserName}`);
    }
    
    // Navigate to login
    await page.goto('/auth/login');
    await waitForPageLoad(page);
    await expect(page).toHaveURL(/\/auth\/login/);
    console.log(`✓ Navigation to login works on ${browserName}`);
  });

  test('should render responsive layouts correctly', async ({ page, browserName }) => {
    // Test desktop view
    await page.setViewportSize(viewports.desktop);
    await page.goto('/');
    await waitForPageLoad(page);
    
    const main = page.locator('main').first();
    await expect(main).toBeVisible();
    console.log(`✓ Desktop layout renders on ${browserName}`);
    
    // Test mobile view
    await page.setViewportSize(viewports.mobile);
    await page.reload();
    await waitForPageLoad(page);
    
    await expect(main).toBeVisible();
    console.log(`✓ Mobile layout renders on ${browserName}`);
  });

  test('should handle back/forward navigation', async ({ page, browserName }) => {
    // Navigate through pages
    await page.goto('/');
    await waitForPageLoad(page);
    
    await page.goto('/pricing');
    await waitForPageLoad(page);
    
    // Go back
    await page.goBack();
    await expect(page).toHaveURL(/\/$|\/$/);
    console.log(`✓ Back navigation works on ${browserName}`);
    
    // Go forward
    await page.goForward();
    await expect(page).toHaveURL(/\/pricing/);
    console.log(`✓ Forward navigation works on ${browserName}`);
  });

  test('should load static assets correctly', async ({ page, browserName }) => {
    await page.goto('/');
    await waitForPageLoad(page);
    
    // Check if any images failed to load
    const images = await page.locator('img').all();
    let loadedCount = 0;
    
    for (const img of images.slice(0, 5)) { // Check first 5 images
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      if (naturalWidth > 0) loadedCount++;
    }
    
    expect(loadedCount).toBeGreaterThan(0);
    console.log(`✓ Static assets load on ${browserName}`);
  });

  test('should handle keyboard navigation', async ({ page, browserName }) => {
    await page.goto('/auth/login');
    await waitForPageLoad(page);
    
    // Tab through form elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verify focus is on an input element
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement);
    
    console.log(`✓ Keyboard navigation works on ${browserName}`);
  });
});

test.describe('Browser-Specific Features', () => {
  test('should support modern JavaScript features', async ({ page, browserName }) => {
    await page.goto('/');
    
    // Test if modern JS features work
    const supportsModernJS = await page.evaluate(() => {
      try {
        // Test arrow functions, template literals, const/let
        const test = (x) => `Value: ${x}`;
        const result = test(42);
        
        // Test async/await
        const asyncTest = async () => true;
        
        // Test optional chaining
        const obj = { a: { b: 1 } };
        const value = obj?.a?.b;
        
        return result === 'Value: 42' && value === 1;
      } catch {
        return false;
      }
    });
    
    expect(supportsModernJS).toBe(true);
    console.log(`✓ Modern JavaScript supported on ${browserName}`);
  });

  test('should support CSS features', async ({ page, browserName }) => {
    await page.goto('/');
    await waitForPageLoad(page);
    
    // Check if flexbox and grid are supported
    const supportsModernCSS = await page.evaluate(() => {
      const div = document.createElement('div');
      div.style.display = 'flex';
      const supportsFlex = div.style.display === 'flex';
      
      div.style.display = 'grid';
      const supportsGrid = div.style.display === 'grid';
      
      return supportsFlex && supportsGrid;
    });
    
    expect(supportsModernCSS).toBe(true);
    console.log(`✓ Modern CSS supported on ${browserName}`);
  });
});
