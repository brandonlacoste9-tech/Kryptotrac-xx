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

// Mock logger
jest.mock('@/lib/logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    },
}));

// Define mocks inside the factory to avoid hoisting issues and ensure reference consistency
jest.mock('@/lib/supabase/client', () => {
    // Create mock functions
    const mockGetUser = jest.fn();
    const mockSelect = jest.fn();
    const mockInsert = jest.fn();
    const mockUpdate = jest.fn();
    const mockDelete = jest.fn();
    const mockEq = jest.fn();
    const mockLike = jest.fn();
    const mockOrder = jest.fn();
    const mockSingle = jest.fn();
    const mockIn = jest.fn();

    // Chainable mock implementation defaults
    mockSelect.mockReturnValue({ eq: mockEq, order: mockOrder });
    mockInsert.mockReturnValue({ select: jest.fn().mockReturnValue({ single: mockSingle }) });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockDelete.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder, in: mockIn });
    mockLike.mockReturnValue({ order: mockOrder });
    mockOrder.mockReturnValue({ data: [], error: null });
    mockIn.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({ data: null, error: null });

    return {
        createBrowserClient: jest.fn(() => ({
            auth: {
                getUser: mockGetUser,
            },
            from: jest.fn(() => ({
                select: mockSelect,
                insert: mockInsert,
                update: mockUpdate,
                delete: mockDelete,
            })),
        })),
        // Expose mocks for test control
        _mocks: {
            mockGetUser,
            mockSelect,
            mockInsert,
            mockUpdate,
            mockDelete,
            mockEq,
            mockLike,
            mockOrder,
            mockSingle,
            mockIn
        }
    };
});

describe('WalletManager Component', () => {
    // Access the exposed mocks
    const { _mocks } = require('@/lib/supabase/client');
    const {
        mockGetUser, mockSelect, mockInsert, mockUpdate, mockDelete,
        mockEq, mockLike, mockOrder, mockSingle, mockIn
    } = _mocks;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Default happy path setup
        mockGetUser.mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
        });

        // Reset chainable mocks default return values
        mockSelect.mockReturnValue({ eq: mockEq, order: mockOrder });
        mockEq.mockReturnValue({ order: mockOrder, in: mockIn });
        mockOrder.mockResolvedValue({ data: [], error: null });
        mockIn.mockReturnValue({ single: mockSingle });
        mockSingle.mockResolvedValue({ data: null, error: null });

        // Ensure creates return this for chaining if needed
        mockInsert.mockReturnValue({ select: jest.fn().mockReturnValue({ single: mockSingle }) });
    });

    describe('Loading State', () => {
        it('should display loading skeleton while fetching wallets', () => {
             // Delay the response to allow skeleton check
            mockGetUser.mockImplementation(() => new Promise(resolve => {
                setTimeout(() => resolve({ data: { user: { id: 'test-user-id' } } }), 100);
            }));

            render(<WalletManager />);

            // Check for loading indicators (skeleton loaders)
            const skeletons = document.querySelectorAll('.animate-pulse');
            expect(skeletons.length).toBeGreaterThan(0);
        });
    });

    describe('Empty State', () => {
        it('should display empty state when no wallets exist', async () => {
            mockOrder.mockResolvedValue({
                data: [],
                error: null,
            });

            render(<WalletManager />);

            await waitFor(() => {
                expect(screen.getByText(/No wallets added yet/i)).toBeInTheDocument();
            });
        });

        it('should show helpful message in empty state', async () => {
             mockOrder.mockResolvedValue({
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
            mockOrder.mockResolvedValue({
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
            mockOrder.mockResolvedValue({
                data: mockWallets,
                error: null,
            });

            render(<WalletManager />);

            await waitFor(() => {
                expect(screen.getByText('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')).toBeInTheDocument();
            });
        });

        it('should display chain badges', async () => {
             mockOrder.mockResolvedValue({
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
            mockOrder.mockResolvedValue({
                data: [],
                error: null,
            });

            render(<WalletManager />);

            // Wait for loading to finish first
            await waitFor(() => {
                expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
            });

            const addButton = await screen.findByText(/Add Wallet/i);
            fireEvent.click(addButton);

            expect(screen.getByPlaceholderText('0x...')).toBeInTheDocument();
        });

        it('should validate Ethereum address format', async () => {
            mockOrder.mockResolvedValue({
                data: [],
                error: null,
            });

            render(<WalletManager />);

            const addButton = await screen.findByText(/Add Wallet/i);
            fireEvent.click(addButton);

            const addressInput = screen.getByPlaceholderText('0x...');
            // Need to verify the second button is actually the submit button
            // The first one is likely the one to open the modal/form
            const buttons = screen.getAllByText(/Add Wallet/i);
            const submitButton = buttons[buttons.length - 1];

            // Enter invalid address
            fireEvent.change(addressInput, { target: { value: 'invalid-address' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/Invalid Ethereum address format/i)).toBeInTheDocument();
            });
        });

        it('should require wallet address', async () => {
            mockOrder.mockResolvedValue({
                data: [],
                error: null,
            });

            render(<WalletManager />);

            const addButton = await screen.findByText(/Add Wallet/i);
            fireEvent.click(addButton);

            const buttons = screen.getAllByText(/Add Wallet/i);
            const submitButton = buttons[buttons.length - 1];
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/Wallet address is required/i)).toBeInTheDocument();
            });
        });

        it('should allow optional label', async () => {
            mockOrder.mockResolvedValue({
                data: [],
                error: null,
            });

            render(<WalletManager />);

            const addButton = await screen.findByText(/Add Wallet/i);
            fireEvent.click(addButton);

            const labelInput = screen.getByPlaceholderText(/My Main Wallet/i);
            expect(labelInput).toBeInTheDocument();
        });

        it('should cancel add wallet form', async () => {
            mockOrder.mockResolvedValue({
                data: [],
                error: null,
            });

            render(<WalletManager />);

            const addButton = await screen.findByText(/Add Wallet/i);
            fireEvent.click(addButton);

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
            mockOrder.mockResolvedValue({
                data: mockWallets,
                error: null,
            });

            render(<WalletManager />);

            // Wait for list to render
            await screen.findByText('My Main Wallet');

            // Need to wait specifically for the buttons to appear
            // Using a more generic selector to find the edit button
            const editButton = await waitFor(() => {
                // Find button that contains the edit icon
                // Since we can't easily select by icon, we'll assume it's one of the buttons in the row
                // This test might be brittle without better test IDs, but let's try to find it
                // by finding the row content then looking for buttons
                const row = screen.getByText('My Main Wallet').closest('.glass-card');
                const buttons = row?.querySelectorAll('button');
                // The first button in the actions area is usually edit
                return buttons?.[0];
            });

            if (editButton) {
                fireEvent.click(editButton);
                // Should show input with current label
                const input = await screen.findByDisplayValue('My Main Wallet');
                expect(input).toBeInTheDocument();
            } else {
                throw new Error('Edit button not found');
            }
        });

        it('should validate label is not empty', async () => {
            mockOrder.mockResolvedValue({
                data: mockWallets,
                error: null,
            });

            render(<WalletManager />);

            // Wait for list to render
            await screen.findByText('My Main Wallet');

            // Find edit button (first button in row)
            const editButton = await waitFor(() => {
                const row = screen.getByText('My Main Wallet').closest('.glass-card');
                return row?.querySelectorAll('button')[0];
            });

            if (editButton) {
                fireEvent.click(editButton);
                const input = await screen.findByDisplayValue('My Main Wallet');
                fireEvent.change(input, { target: { value: '' } });

                // Find save button (should be first button after clicking edit)
                const saveButton = await waitFor(() => {
                    const row = screen.getByDisplayValue('').closest('.glass-card');
                    return row?.querySelectorAll('button')[0];
                });

                if (saveButton) {
                    fireEvent.click(saveButton);
                    await waitFor(() => {
                        expect(screen.getByText(/Label cannot be empty/i)).toBeInTheDocument();
                    });
                }
            }
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

            mockOrder.mockResolvedValue({
                data: mockWallets,
                error: null,
            });

            // Mock window.confirm
            global.confirm = jest.fn(() => true); // Auto confirm

            render(<WalletManager />);

            // Wait for list to render
            await screen.findByText('My Main Wallet');

            // Find delete button (second button in row)
            const deleteButton = await waitFor(() => {
                const row = screen.getByText('My Main Wallet').closest('.glass-card');
                return row?.querySelectorAll('button')[1];
            });

            if (deleteButton) {
                fireEvent.click(deleteButton);
                expect(global.confirm).toHaveBeenCalledWith(
                    'Are you sure you want to delete this wallet?'
                );
            } else {
                throw new Error('Delete button not found');
            }
        });
    });

    describe('Error Handling', () => {
        it('should display error message on failed load', async () => {
            // Need to mock the chain failure
            // .from().select().eq().order()
            // mockOrder is the last link in the chain
            mockOrder.mockResolvedValue({
                data: null,
                error: { message: 'Database error' },
            });

            render(<WalletManager />);

            await waitFor(() => {
                expect(screen.getByText(/Failed to load wallets/i)).toBeInTheDocument();
            });
        });

        it('should handle missing user gracefully', async () => {
            mockGetUser.mockResolvedValue({
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
