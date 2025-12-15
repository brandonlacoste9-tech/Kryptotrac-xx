/**
 * E2E Test: Authentication Flow
 * 
 * Tests the complete authentication user journey including:
 * - Login page accessibility
 * - Signup page accessibility
 * - Form validation
 * - Navigation between auth pages
 * 
 * Note: These tests verify UI flow, not actual authentication
 * (requires test credentials or mocking for full E2E auth testing)
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the login page
    await expect(page).toHaveURL(/\/auth\/login/);
    
    // Check for login form elements
    const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
    await expect(emailInput.first()).toBeVisible();
    
    const passwordInput = page.getByLabel(/password/i).or(page.getByPlaceholder(/password/i));
    await expect(passwordInput.first()).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the signup page
    await expect(page).toHaveURL(/\/auth\/signup/);
    
    // Check for signup form
    const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
    await expect(emailInput.first()).toBeVisible();
  });

  test('should show login form with required fields', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Look for submit button
    const submitButton = page.getByRole('button', { name: /sign in|log in|login/i });
    await expect(submitButton.first()).toBeVisible();
  });

  test('should show signup form with required fields', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Look for submit button
    const submitButton = page.getByRole('button', { name: /sign up|register|create/i });
    await expect(submitButton.first()).toBeVisible();
  });

  test('should validate email format on login', async ({ page }) => {
    await page.goto('/auth/login');
    
    const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i)).first();
    const submitButton = page.getByRole('button', { name: /sign in|log in|login/i }).first();
    
    // Try submitting with invalid email
    await emailInput.fill('invalid-email');
    await submitButton.click();
    
    // Browser should show validation error or prevent submission
    // This tests HTML5 validation
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('should have link to switch between login and signup', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Look for link to signup page
    const signupLink = page.getByRole('link', { name: /sign up|create account|register/i });
    
    if (await signupLink.first().isVisible()) {
      await signupLink.first().click();
      await expect(page).toHaveURL(/\/auth\/signup/);
    }
  });

  test('should navigate to magic link page if available', async ({ page }) => {
    const response = await page.goto('/auth/magic-link');
    
    // If magic link page exists, verify it loads
    const statusCode = response?.status() || 404;
    
    if (statusCode === 200) {
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/auth\/magic-link/);
    }
  });

  test('should be accessible on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // Verify form is still accessible
    const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
    await expect(emailInput.first()).toBeVisible();
  });

  test('should have password visibility toggle if available', async ({ page }) => {
    await page.goto('/auth/login');
    
    const passwordInput = page.getByLabel(/password/i).or(page.getByPlaceholder(/password/i)).first();
    await passwordInput.fill('test-password');
    
    // Look for show/hide password button
    const toggleButton = page.getByRole('button', { name: /show|hide|toggle/i });
    
    if (await toggleButton.first().isVisible()) {
      const inputType = await passwordInput.getAttribute('type');
      expect(inputType).toBe('password');
      
      await toggleButton.first().click();
      const newInputType = await passwordInput.getAttribute('type');
      expect(newInputType).toBe('text');
    }
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to login when accessing dashboard without auth', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login or show login prompt
    // Wait a bit for redirect to happen
    await page.waitForTimeout(2000);
    
    const url = page.url();
    // Check if redirected to login or showing auth UI
    const isOnLoginPage = url.includes('/auth/login') || url.includes('/login');
    const hasLoginForm = await page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i)).first().isVisible().catch(() => false);
    
    expect(isOnLoginPage || hasLoginForm).toBe(true);
  });
});
