/**
 * Unit Tests for Cache Utility
 * 
 * Tests the in-memory cache implementation including:
 * - Basic CRUD operations
 * - TTL (Time To Live) functionality
 * - Cleanup of expired entries
 * - Statistics tracking
 */

import { cache, CACHE_TTL } from '@/lib/cache';

describe('Cache Utility', () => {
    beforeEach(() => {
        // Clear cache before each test
        cache.clear();
    });

    describe('Basic Operations', () => {
        it('should store and retrieve values', () => {
            cache.set('test-key', 'test-value', 60);
            const value = cache.get('test-key');
            expect(value).toBe('test-value');
        });

        it('should store and retrieve complex objects', () => {
            const testObject = {
                id: 123,
                name: 'Test User',
                positions: [{ token: 'ETH', amount: 1.5 }],
            };

            cache.set('user-data', testObject, 60);
            const retrieved = cache.get('user-data');

            expect(retrieved).toEqual(testObject);
        });

        it('should return null for non-existent keys', () => {
            const value = cache.get('non-existent-key');
            expect(value).toBeNull();
        });

        it('should overwrite existing keys', () => {
            cache.set('key', 'value1', 60);
            cache.set('key', 'value2', 60);

            const value = cache.get('key');
            expect(value).toBe('value2');
        });

        it('should delete specific keys', () => {
            cache.set('key1', 'value1', 60);
            cache.set('key2', 'value2', 60);

            cache.delete('key1');

            expect(cache.get('key1')).toBeNull();
            expect(cache.get('key2')).toBe('value2');
        });

        it('should clear all entries', () => {
            cache.set('key1', 'value1', 60);
            cache.set('key2', 'value2', 60);
            cache.set('key3', 'value3', 60);

            cache.clear();

            expect(cache.get('key1')).toBeNull();
            expect(cache.get('key2')).toBeNull();
            expect(cache.get('key3')).toBeNull();
        });
    });

    describe('TTL (Time To Live)', () => {
        it('should return value before expiration', () => {
            cache.set('key', 'value', 10); // 10 seconds TTL
            const value = cache.get('key');
            expect(value).toBe('value');
        });

        it('should return null after expiration', async () => {
            // Set with 1 second TTL
            cache.set('key', 'value', 1);

            // Wait for expiration
            await new Promise(resolve => setTimeout(resolve, 1100));

            const value = cache.get('key');
            expect(value).toBeNull();
        });

        it('should handle different TTL values for different keys', async () => {
            cache.set('short-lived', 'value1', 1);
            cache.set('long-lived', 'value2', 10);

            // Wait for short-lived to expire
            await new Promise(resolve => setTimeout(resolve, 1100));

            expect(cache.get('short-lived')).toBeNull();
            expect(cache.get('long-lived')).toBe('value2');
        });
    });

    describe('has() Method', () => {
        it('should return true for existing non-expired keys', () => {
            cache.set('key', 'value', 60);
            expect(cache.has('key')).toBe(true);
        });

        it('should return false for non-existent keys', () => {
            expect(cache.has('non-existent')).toBe(false);
        });

        it('should return false for expired keys', async () => {
            cache.set('key', 'value', 1);

            // Wait for expiration
            await new Promise(resolve => setTimeout(resolve, 1100));

            expect(cache.has('key')).toBe(false);
        });

        it('should clean up expired keys when checking', async () => {
            cache.set('key', 'value', 1);

            // Wait for expiration
            await new Promise(resolve => setTimeout(resolve, 1100));

            cache.has('key'); // This should trigger cleanup

            const stats = cache.getStats();
            expect(stats.size).toBe(0);
        });
    });

    describe('Statistics', () => {
        it('should return accurate cache size', () => {
            cache.set('key1', 'value1', 60);
            cache.set('key2', 'value2', 60);
            cache.set('key3', 'value3', 60);

            const stats = cache.getStats();
            expect(stats.size).toBe(3);
        });

        it('should return list of keys', () => {
            cache.set('key1', 'value1', 60);
            cache.set('key2', 'value2', 60);

            const stats = cache.getStats();
            expect(stats.keys).toContain('key1');
            expect(stats.keys).toContain('key2');
            expect(stats.keys.length).toBe(2);
        });

        it('should reflect changes after deletion', () => {
            cache.set('key1', 'value1', 60);
            cache.set('key2', 'value2', 60);

            cache.delete('key1');

            const stats = cache.getStats();
            expect(stats.size).toBe(1);
            expect(stats.keys).toContain('key2');
            expect(stats.keys).not.toContain('key1');
        });
    });

    describe('CACHE_TTL Constants', () => {
        it('should have defined TTL constants', () => {
            expect(CACHE_TTL.COINGECKO_PRICES).toBeDefined();
            expect(CACHE_TTL.DEFI_POSITIONS).toBeDefined();
            expect(CACHE_TTL.PORTFOLIO_HISTORY).toBeDefined();
            expect(CACHE_TTL.USER_PROFILE).toBeDefined();
            expect(CACHE_TTL.WATCHLIST).toBeDefined();
        });

        it('should have reasonable TTL values', () => {
            // All TTLs should be positive numbers
            expect(CACHE_TTL.COINGECKO_PRICES).toBeGreaterThan(0);
            expect(CACHE_TTL.DEFI_POSITIONS).toBeGreaterThan(0);
            expect(CACHE_TTL.PORTFOLIO_HISTORY).toBeGreaterThan(0);
            expect(CACHE_TTL.USER_PROFILE).toBeGreaterThan(0);
            expect(CACHE_TTL.WATCHLIST).toBeGreaterThan(0);
        });

        it('should work with predefined TTL constants', () => {
            cache.set('prices', { BTC: 50000 }, CACHE_TTL.COINGECKO_PRICES);
            const prices = cache.get('prices');
            expect(prices).toEqual({ BTC: 50000 });
        });
    });

    describe('Type Safety', () => {
        it('should preserve type information', () => {
            interface UserData {
                id: number;
                name: string;
            }

            const userData: UserData = { id: 1, name: 'Test' };
            cache.set<UserData>('user', userData, 60);

            const retrieved = cache.get<UserData>('user');
            expect(retrieved?.id).toBe(1);
            expect(retrieved?.name).toBe('Test');
        });

        it('should handle arrays correctly', () => {
            const wallets = ['0x123', '0x456', '0x789'];
            cache.set('wallets', wallets, 60);

            const retrieved = cache.get<string[]>('wallets');
            expect(Array.isArray(retrieved)).toBe(true);
            expect(retrieved?.length).toBe(3);
        });
    });
});
