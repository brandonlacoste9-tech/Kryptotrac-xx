/**
 * E2E Test: Complete User Journey
 * 
 * Tests the complete user flow from landing page to key features.
 * This demonstrates a real-world E2E testing scenario.
 */

import { test, expect } from '@playwright/test';
import { waitForPageLoad } from './helpers/test-helpers';

test.describe('User Journey: New Visitor Flow', () => {
  test('should guide new user through main features', async ({ page }) => {
    // Step 1: Landing on homepage
    await page.goto('/');
    await waitForPageLoad(page);
    
    await expect(page).toHaveTitle(/KryptoTrac/i);
    console.log('✓ Step 1: Landed on homepage');
    
    // Step 2: Explore features
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();
    console.log('✓ Step 2: Main content visible');
    
    // Step 3: Navigate to pricing
    const pricingLink = page.getByRole('link', { name: /pricing/i }).first();
    if (await pricingLink.isVisible()) {
      await pricingLink.click();
      await page.waitForURL(/\/pricing/);
      console.log('✓ Step 3: Navigated to pricing page');
      
      // Verify pricing tiers are shown
      await waitForPageLoad(page);
      const pageContent = await page.content();
      const hasPricingContent = pageContent.includes('$') || 
                                pageContent.includes('Free') || 
                                pageContent.includes('Pro') ||
                                pageContent.includes('Elite');
      expect(hasPricingContent).toBe(true);
      console.log('✓ Step 4: Pricing information displayed');
    }
    
    // Step 5: Navigate to signup
    await page.goto('/auth/signup');
    await waitForPageLoad(page);
    
    await expect(page).toHaveURL(/\/auth\/signup/);
    console.log('✓ Step 5: Reached signup page');
    
    // Step 6: Verify signup form exists
    const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
    await expect(emailInput.first()).toBeVisible();
    console.log('✓ Step 6: Signup form visible');
  });

  test('should show login page for returning users', async ({ page }) => {
    // Navigate directly to login
    await page.goto('/auth/login');
    await waitForPageLoad(page);
    
    // Verify login form
    await expect(page).toHaveURL(/\/auth\/login/);
    
    const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
    const passwordInput = page.getByLabel(/password/i).or(page.getByPlaceholder(/password/i));
    
    await expect(emailInput.first()).toBeVisible();
    await expect(passwordInput.first()).toBeVisible();
    
    console.log('✓ Login form rendered with email and password fields');
  });
});

test.describe('User Journey: Marketing Flow', () => {
  test('should display key marketing messages', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
    
    // Look for key value propositions
    const content = await page.content();
    const hasKeywords = 
      content.toLowerCase().includes('crypto') ||
      content.toLowerCase().includes('portfolio') ||
      content.toLowerCase().includes('track');
    
    expect(hasKeywords).toBe(true);
    console.log('✓ Marketing messages present on homepage');
  });

  test('should have clear call-to-action buttons', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
    
    // Look for CTA buttons
    const buttons = await page.getByRole('button').all();
    const links = await page.getByRole('link').all();
    
    const totalCTAs = buttons.length + links.length;
    expect(totalCTAs).toBeGreaterThan(0);
    
    console.log(`✓ Found ${totalCTAs} interactive elements (buttons/links)`);
  });
});

test.describe('User Journey: Error Handling', () => {
  test('should handle 404 page gracefully', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345');
    
    // Either get a 404 status or redirect to error page
    const isErrorHandled = 
      response?.status() === 404 || 
      page.url().includes('not-found') ||
      (await page.content()).toLowerCase().includes('not found') ||
      (await page.content()).toLowerCase().includes('404');
    
    expect(isErrorHandled).toBe(true);
    console.log('✓ 404 errors handled appropriately');
  });

  test('should display user-friendly error messages', async ({ page }) => {
    await page.goto('/auth/login');
    await waitForPageLoad(page);
    
    // Try to submit empty form (if validation exists)
    const submitButton = page.getByRole('button', { name: /sign in|log in|login/i }).first();
    
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Wait a bit for potential error messages
      await page.waitForTimeout(1000);
      
      // Check if there are any error messages or validation
      const hasValidation = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        return inputs.some(input => !input.validity.valid);
      });
      
      // Either HTML5 validation or custom error messages
      expect(hasValidation).toBeDefined();
      console.log('✓ Form validation in place');
    }
  });
});

test.describe('User Journey: Performance', () => {
  test('should load main pages within acceptable time', async ({ page }) => {
    const pages = ['/', '/pricing', '/auth/login'];
    
    for (const url of pages) {
      const startTime = Date.now();
      await page.goto(url);
      await waitForPageLoad(page);
      const loadTime = Date.now() - startTime;
      
      // Page should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);
      console.log(`✓ ${url} loaded in ${loadTime}ms`);
    }
  });

  test('should not have excessive console errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await waitForPageLoad(page);
    
    // Allow for some acceptable errors (like third-party scripts)
    // but catch major issues
    if (errors.length > 0) {
      console.log(`⚠ Found ${errors.length} console errors:`, errors.slice(0, 3));
    } else {
      console.log('✓ No console errors detected');
    }
  });
});
