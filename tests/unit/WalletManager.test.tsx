/**
 * Component Tests for WalletManager
 * 
 * Tests the WalletManager React component including:
 * - Loading states
 * - Empty states
 * - Wallet list rendering
 * - Add/edit/delete operations
 * - Form validation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WalletManager } from '@/components/settings/WalletManager';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
    createBrowserClient: jest.fn(() => ({
        auth: {
            getUser: jest.fn(),
        },
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            like: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            single: jest.fn(),
        })),
    })),
}));

// Mock logger
jest.mock('@/lib/logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    },
}));

describe('WalletManager Component', () => {
    let mockSupabase: any;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        const { createBrowserClient } = require('@/lib/supabase/client');
        mockSupabase = createBrowserClient();
    });

    describe('Loading State', () => {
        it('should display loading skeleton while fetching wallets', () => {
            // Mock loading state
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'test-user-id' } },
            });

            render(<WalletManager />);

            // Check for loading indicators (skeleton loaders)
            const skeletons = document.querySelectorAll('.animate-pulse');
            expect(skeletons.length).toBeGreaterThan(0);
        });
    });

    describe('Empty State', () => {
        it('should display empty state when no wallets exist', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'test-user-id' } },
            });

            mockSupabase.from().select().eq().order.mockResolvedValue({
                data: [],
                error: null,
            });

            render(<WalletManager />);

            await waitFor(() => {
                expect(screen.getByText(/No wallets added yet/i)).toBeInTheDocument();
            });
        });

        it('should show helpful message in empty state', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'test-user-id' } },
            });

            mockSupabase.from().select().eq().order.mockResolvedValue({
                data: [],
                error: null,
            });

            render(<WalletManager />);

            await waitFor(() => {
                expect(screen.getByText(/Add a wallet to start tracking/i)).toBeInTheDocument();
            });
        });
    });

    describe('Wallet List', () => {
        const mockWallets = [
            {
                id: 'wallet-1',
                address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
                label: 'My Main Wallet',
                chain: 'ethereum',
                created_at: '2024-01-01T00:00:00Z',
            },
            {
                id: 'wallet-2',
                address: '0x1234567890123456789012345678901234567890',
                label: 'Trading Wallet',
                chain: 'ethereum',
                created_at: '2024-01-02T00:00:00Z',
            },
        ];

        it('should render list of wallets', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'test-user-id' } },
            });

            mockSupabase.from().select().eq().order.mockResolvedValue({
                data: mockWallets,
                error: null,
            });

            render(<WalletManager />);

            await waitFor(() => {
                expect(screen.getByText('My Main Wallet')).toBeInTheDocument();
                expect(screen.getByText('Trading Wallet')).toBeInTheDocument();
            });
        });

        it('should display wallet addresses', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'test-user-id' } },
            });

            mockSupabase.from().select().eq().order.mockResolvedValue({
                data: mockWallets,
                error: null,
            });

            render(<WalletManager />);

            await waitFor(() => {
                expect(screen.getByText('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')).toBeInTheDocument();
            });
        });

        it('should display chain badges', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'test-user-id' } },
            });

            mockSupabase.from().select().eq().order.mockResolvedValue({
                data: mockWallets,
                error: null,
            });

            render(<WalletManager />);

            await waitFor(() => {
                const chainBadges = screen.getAllByText('ethereum');
                expect(chainBadges.length).toBe(2);
            });
        });
    });

    describe('Add Wallet Form', () => {
        it('should show add wallet form when button clicked', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'test-user-id' } },
            });

            mockSupabase.from().select().eq().order.mockResolvedValue({
                data: [],
                error: null,
            });

            render(<WalletManager />);

            await waitFor(() => {
                const addButton = screen.getByText(/Add Wallet/i);
                fireEvent.click(addButton);
            });

            expect(screen.getByPlaceholderText('0x...')).toBeInTheDocument();
        });

        it('should validate Ethereum address format', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'test-user-id' } },
            });

            mockSupabase.from().select().eq().order.mockResolvedValue({
                data: [],
                error: null,
            });

            render(<WalletManager />);

            await waitFor(() => {
                const addButton = screen.getByText(/Add Wallet/i);
                fireEvent.click(addButton);
            });

            const addressInput = screen.getByPlaceholderText('0x...');
            const submitButton = screen.getAllByText(/Add Wallet/i)[1]; // Second one is in form

            // Enter invalid address
            fireEvent.change(addressInput, { target: { value: 'invalid-address' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/Invalid Ethereum address format/i)).toBeInTheDocument();
            });
        });

        it('should require wallet address', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'test-user-id' } },
            });

            mockSupabase.from().select().eq().order.mockResolvedValue({
                data: [],
                error: null,
            });

            render(<WalletManager />);

            await waitFor(() => {
                const addButton = screen.getByText(/Add Wallet/i);
                fireEvent.click(addButton);
            });

            const submitButton = screen.getAllByText(/Add Wallet/i)[1];
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/Wallet address is required/i)).toBeInTheDocument();
            });
        });

        it('should allow optional label', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'test-user-id' } },
            });

            mockSupabase.from().select().eq().order.mockResolvedValue({
                data: [],
                error: null,
            });

            render(<WalletManager />);

            await waitFor(() => {
                const addButton = screen.getByText(/Add Wallet/i);
                fireEvent.click(addButton);
            });

            const labelInput = screen.getByPlaceholderText(/My Main Wallet/i);
            expect(labelInput).toBeInTheDocument();
        });

        it('should cancel add wallet form', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'test-user-id' } },
            });

            mockSupabase.from().select().eq().order.mockResolvedValue({
                data: [],
                error: null,
            });

            render(<WalletManager />);

            await waitFor(() => {
                const addButton = screen.getByText(/Add Wallet/i);
                fireEvent.click(addButton);
            });

            const cancelButton = screen.getByText(/Cancel/i);
            fireEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.queryByPlaceholderText('0x...')).not.toBeInTheDocument();
            });
        });
    });

    describe('Edit Wallet', () => {
        const mockWallets = [
            {
                id: 'wallet-1',
                address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
                label: 'My Main Wallet',
                chain: 'ethereum',
                created_at: '2024-01-01T00:00:00Z',
            },
        ];

        it('should show edit form when edit button clicked', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'test-user-id' } },
            });

            mockSupabase.from().select().eq().order.mockResolvedValue({
                data: mockWallets,
                error: null,
            });

            render(<WalletManager />);

            await waitFor(() => {
                const editButtons = screen.getAllByRole('button');
                const editButton = editButtons.find(btn =>
                    btn.querySelector('svg')?.classList.contains('lucide-edit-2')
                );
                if (editButton) fireEvent.click(editButton);
            });

            // Should show input with current label
            await waitFor(() => {
                const input = screen.getByDisplayValue('My Main Wallet');
                expect(input).toBeInTheDocument();
            });
        });

        it('should validate label is not empty', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'test-user-id' } },
            });

            mockSupabase.from().select().eq().order.mockResolvedValue({
                data: mockWallets,
                error: null,
            });

            render(<WalletManager />);

            await waitFor(() => {
                const editButtons = screen.getAllByRole('button');
                const editButton = editButtons.find(btn =>
                    btn.querySelector('svg')?.classList.contains('lucide-edit-2')
                );
                if (editButton) fireEvent.click(editButton);
            });

            await waitFor(() => {
                const input = screen.getByDisplayValue('My Main Wallet');
                fireEvent.change(input, { target: { value: '' } });

                const saveButtons = screen.getAllByRole('button');
                const saveButton = saveButtons.find(btn =>
                    btn.querySelector('svg')?.classList.contains('lucide-check')
                );
                if (saveButton) fireEvent.click(saveButton);
            });

            await waitFor(() => {
                expect(screen.getByText(/Label cannot be empty/i)).toBeInTheDocument();
            });
        });
    });

    describe('Delete Wallet', () => {
        it('should show confirmation before deleting', async () => {
            const mockWallets = [
                {
                    id: 'wallet-1',
                    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
                    label: 'My Main Wallet',
                    chain: 'ethereum',
                    created_at: '2024-01-01T00:00:00Z',
                },
            ];

            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'test-user-id' } },
            });

            mockSupabase.from().select().eq().order.mockResolvedValue({
                data: mockWallets,
                error: null,
            });

            // Mock window.confirm
            global.confirm = jest.fn(() => false);

            render(<WalletManager />);

            await waitFor(() => {
                const deleteButtons = screen.getAllByRole('button');
                const deleteButton = deleteButtons.find(btn =>
                    btn.querySelector('svg')?.classList.contains('lucide-trash-2')
                );
                if (deleteButton) fireEvent.click(deleteButton);
            });

            expect(global.confirm).toHaveBeenCalledWith(
                'Are you sure you want to delete this wallet?'
            );
        });
    });

    describe('Error Handling', () => {
        it('should display error message on failed load', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'test-user-id' } },
            });

            mockSupabase.from().select().eq().order.mockResolvedValue({
                data: null,
                error: { message: 'Database error' },
            });

            render(<WalletManager />);

            await waitFor(() => {
                expect(screen.getByText(/Failed to load wallets/i)).toBeInTheDocument();
            });
        });

        it('should handle missing user gracefully', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
            });

            render(<WalletManager />);

            await waitFor(() => {
                // Should not crash, component should handle gracefully
                expect(screen.queryByText(/My Wallets/i)).toBeInTheDocument();
            });
        });
    });
});
