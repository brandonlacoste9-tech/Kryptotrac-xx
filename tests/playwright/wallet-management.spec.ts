/**
 * E2E Test: Wallet Management Flow
 * 
 * Tests the complete user journey for managing wallets including:
 * - Navigation to wallet settings
 * - Adding wallets with validation
 * - Editing wallet labels
 * - Deleting wallets
 * - Persistence across page refreshes
 */

import { test, expect } from '@playwright/test';

// Test constants
const TEST_WALLET_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
const TEST_WALLET_LABEL = 'Test E2E Wallet';
const INVALID_ADDRESS = 'not-a-valid-address';

test.describe('Wallet Management E2E', () => {
    test.beforeEach(async ({ page }) => {
        // Login before each test
        await page.goto('/auth/login');

        // Fill in test credentials
        const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i)).first();
        const passwordInput = page.getByLabel(/password/i).or(page.getByPlaceholder(/password/i)).first();

        await emailInput.fill(process.env.TEST_USER_EMAIL || 'test+wallets@example.com');
        await passwordInput.fill(process.env.TEST_USER_PASSWORD || 'TestPassword123!');

        // Submit login form
        const submitButton = page.getByRole('button', { name: /sign in|log in|login/i }).first();
        await submitButton.click();

        // Wait for redirect to dashboard
        await page.waitForURL(/\/dashboard|\//, { timeout: 10000 });
    });

    test('should navigate to wallet settings', async ({ page }) => {
        // Navigate to settings
        await page.goto('/settings/wallets');

        // Verify we're on the wallet management page
        await expect(page).toHaveURL(/\/settings\/wallets/);

        // Check for wallet management header
        const header = page.getByRole('heading', { name: /my wallets/i });
        await expect(header).toBeVisible({ timeout: 5000 });
    });

    test('should display add wallet button', async ({ page }) => {
        await page.goto('/settings/wallets');

        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Check for "Add Wallet" button
        const addButton = page.getByRole('button', { name: /add wallet/i }).first();
        await expect(addButton).toBeVisible();
    });

    test('should show add wallet form when button clicked', async ({ page }) => {
        await page.goto('/settings/wallets');
        await page.waitForLoadState('networkidle');

        // Click "Add Wallet" button
        const addButton = page.getByRole('button', { name: /add wallet/i }).first();
        await addButton.click();

        // Verify form is visible
        const addressInput = page.getByPlaceholder('0x...');
        await expect(addressInput).toBeVisible();

        const labelInput = page.getByPlaceholder(/my main wallet/i);
        await expect(labelInput).toBeVisible();
    });

    test('should validate invalid Ethereum address', async ({ page }) => {
        await page.goto('/settings/wallets');
        await page.waitForLoadState('networkidle');

        // Open add wallet form
        const addButton = page.getByRole('button', { name: /add wallet/i }).first();
        await addButton.click();

        // Enter invalid address
        const addressInput = page.getByPlaceholder('0x...');
        await addressInput.fill(INVALID_ADDRESS);

        // Submit form
        const submitButton = page.getByRole('button', { name: /add wallet/i }).last();
        await submitButton.click();

        // Check for error message
        await expect(page.getByText(/invalid ethereum address/i)).toBeVisible({ timeout: 3000 });
    });

    test('should require wallet address', async ({ page }) => {
        await page.goto('/settings/wallets');
        await page.waitForLoadState('networkidle');

        // Open add wallet form
        const addButton = page.getByRole('button', { name: /add wallet/i }).first();
        await addButton.click();

        // Try to submit without address
        const submitButton = page.getByRole('button', { name: /add wallet/i }).last();
        await submitButton.click();

        // Check for error message
        await expect(page.getByText(/wallet address is required/i)).toBeVisible({ timeout: 3000 });
    });

    test('should add wallet with valid address', async ({ page }) => {
        await page.goto('/settings/wallets');
        await page.waitForLoadState('networkidle');

        // Open add wallet form
        const addButton = page.getByRole('button', { name: /add wallet/i }).first();
        await addButton.click();

        // Fill in wallet details
        const addressInput = page.getByPlaceholder('0x...');
        await addressInput.fill(TEST_WALLET_ADDRESS);

        const labelInput = page.getByPlaceholder(/my main wallet/i);
        await labelInput.fill(TEST_WALLET_LABEL);

        // Submit form
        const submitButton = page.getByRole('button', { name: /add wallet/i }).last();
        await submitButton.click();

        // Wait for wallet to appear in list
        await expect(page.getByText(TEST_WALLET_LABEL)).toBeVisible({ timeout: 5000 });
        await expect(page.getByText(TEST_WALLET_ADDRESS)).toBeVisible();
    });

    test('should edit wallet label', async ({ page }) => {
        await page.goto('/settings/wallets');
        await page.waitForLoadState('networkidle');

        // Find and click edit button (assuming wallet exists from previous test)
        const editButtons = page.locator('button').filter({ has: page.locator('svg.lucide-edit-2') });

        if (await editButtons.count() > 0) {
            await editButtons.first().click();

            // Find input with current label
            const labelInput = page.locator('input[type="text"]').first();
            await labelInput.clear();
            await labelInput.fill('Updated Wallet Label');

            // Click save button
            const saveButton = page.locator('button').filter({ has: page.locator('svg.lucide-check') }).first();
            await saveButton.click();

            // Verify label updated
            await expect(page.getByText('Updated Wallet Label')).toBeVisible({ timeout: 3000 });
        } else {
            console.log('No wallets to edit - skipping test');
        }
    });

    test('should cancel edit operation', async ({ page }) => {
        await page.goto('/settings/wallets');
        await page.waitForLoadState('networkidle');

        // Find and click edit button
        const editButtons = page.locator('button').filter({ has: page.locator('svg.lucide-edit-2') });

        if (await editButtons.count() > 0) {
            const originalLabel = await page.locator('.font-semibold.text-white').first().textContent();

            await editButtons.first().click();

            // Change the label
            const labelInput = page.locator('input[type="text"]').first();
            await labelInput.clear();
            await labelInput.fill('This Should Not Save');

            // Click cancel button
            const cancelButton = page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first();
            await cancelButton.click();

            // Verify original label is still there
            if (originalLabel) {
                await expect(page.getByText(originalLabel)).toBeVisible();
            }
        } else {
            console.log('No wallets to edit - skipping test');
        }
    });

    test('should delete wallet with confirmation', async ({ page }) => {
        await page.goto('/settings/wallets');
        await page.waitForLoadState('networkidle');

        // Find delete button
        const deleteButtons = page.locator('button').filter({ has: page.locator('svg.lucide-trash-2') });

        if (await deleteButtons.count() > 0) {
            // Get wallet label before deletion
            const walletLabel = await page.locator('.font-semibold.text-white').first().textContent();

            // Set up dialog handler to accept confirmation
            page.on('dialog', dialog => dialog.accept());

            // Click delete button
            await deleteButtons.first().click();

            // Verify wallet is removed
            if (walletLabel) {
                await expect(page.getByText(walletLabel)).not.toBeVisible({ timeout: 3000 });
            }
        } else {
            console.log('No wallets to delete - skipping test');
        }
    });

    test('should cancel delete operation', async ({ page }) => {
        await page.goto('/settings/wallets');
        await page.waitForLoadState('networkidle');

        // Find delete button
        const deleteButtons = page.locator('button').filter({ has: page.locator('svg.lucide-trash-2') });

        if (await deleteButtons.count() > 0) {
            const walletLabel = await page.locator('.font-semibold.text-white').first().textContent();

            // Set up dialog handler to cancel confirmation
            page.on('dialog', dialog => dialog.dismiss());

            // Click delete button
            await deleteButtons.first().click();

            // Verify wallet is still there
            if (walletLabel) {
                await expect(page.getByText(walletLabel)).toBeVisible();
            }
        } else {
            console.log('No wallets to delete - skipping test');
        }
    });

    test('should persist wallets across page refresh', async ({ page }) => {
        await page.goto('/settings/wallets');
        await page.waitForLoadState('networkidle');

        // Get current wallet count
        const walletCards = page.locator('.glass-card').filter({ hasText: /0x/ });
        const initialCount = await walletCards.count();

        // Refresh page
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Verify same number of wallets
        const afterRefreshCount = await walletCards.count();
        expect(afterRefreshCount).toBe(initialCount);
    });

    test('should display chain badge for each wallet', async ({ page }) => {
        await page.goto('/settings/wallets');
        await page.waitForLoadState('networkidle');

        // Check for chain badges
        const chainBadges = page.getByText('ethereum');

        if (await chainBadges.count() > 0) {
            await expect(chainBadges.first()).toBeVisible();
        } else {
            console.log('No wallets to check chain badges - skipping test');
        }
    });

    test('should show empty state when no wallets', async ({ page }) => {
        await page.goto('/settings/wallets');
        await page.waitForLoadState('networkidle');

        // Delete all wallets first (if any exist)
        const deleteButtons = page.locator('button').filter({ has: page.locator('svg.lucide-trash-2') });
        const count = await deleteButtons.count();

        page.on('dialog', dialog => dialog.accept());

        for (let i = 0; i < count; i++) {
            const buttons = page.locator('button').filter({ has: page.locator('svg.lucide-trash-2') });
            if (await buttons.count() > 0) {
                await buttons.first().click();
                await page.waitForTimeout(500);
            }
        }

        // Verify empty state
        await expect(page.getByText(/no wallets added yet/i)).toBeVisible({ timeout: 5000 });
    });

    test('should handle duplicate wallet prevention', async ({ page }) => {
        await page.goto('/settings/wallets');
        await page.waitForLoadState('networkidle');

        const duplicateAddress = '0xDuplicateTest1234567890123456789012345678';

        // Add first wallet
        const addButton = page.getByRole('button', { name: /add wallet/i }).first();
        await addButton.click();

        const addressInput = page.getByPlaceholder('0x...');
        await addressInput.fill(duplicateAddress);

        const submitButton = page.getByRole('button', { name: /add wallet/i }).last();
        await submitButton.click();

        // Wait for wallet to be added
        await page.waitForTimeout(1000);

        // Try to add same wallet again
        const addButton2 = page.getByRole('button', { name: /add wallet/i }).first();
        await addButton2.click();

        const addressInput2 = page.getByPlaceholder('0x...');
        await addressInput2.fill(duplicateAddress);

        const submitButton2 = page.getByRole('button', { name: /add wallet/i }).last();
        await submitButton2.click();

        // Should show error
        await expect(page.getByText(/already exist/i)).toBeVisible({ timeout: 3000 });
    });
});

test.describe('Wallet Management - Performance', () => {
    test('should load wallet page within acceptable time', async ({ page }) => {
        // Login first
        await page.goto('/auth/login');
        const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i)).first();
        const passwordInput = page.getByLabel(/password/i).or(page.getByPlaceholder(/password/i)).first();

        await emailInput.fill(process.env.TEST_USER_EMAIL || 'test+wallets@example.com');
        await passwordInput.fill(process.env.TEST_USER_PASSWORD || 'TestPassword123!');

        const submitButton = page.getByRole('button', { name: /sign in|log in|login/i }).first();
        await submitButton.click();
        await page.waitForURL(/\/dashboard|\//, { timeout: 10000 });

        // Measure wallet page load time
        const startTime = Date.now();
        await page.goto('/settings/wallets');
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;

        console.log(`Wallet page loaded in ${loadTime}ms`);
        expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });
});
