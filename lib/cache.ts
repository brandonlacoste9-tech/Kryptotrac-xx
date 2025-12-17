/**
 * Simple in-memory cache utility for KryptoTrac
 * 
 * Provides caching with TTL (Time To Live) for API responses
 * Can be extended to use Redis in production
 * 
 * Usage:
 * import { cache } from '@/lib/cache';
 * 
 * // Cache data for 5 minutes
 * cache.set('defi-positions-user123', positions, 300);
 * 
 * // Retrieve cached data
 * const cached = cache.get('defi-positions-user123');
 */

interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

class MemoryCache {
    private cache: Map<string, CacheEntry<unknown>>;

    constructor() {
        this.cache = new Map();

        // Clean up expired entries every 60 seconds
        if (typeof window === 'undefined') {
            // Server-side only
            setInterval(() => this.cleanup(), 60000);
        }
    }

    /**
     * Store value in cache with TTL (in seconds)
     */
    set<T>(key: string, value: T, ttlSeconds: number): void {
        const expiresAt = Date.now() + (ttlSeconds * 1000);
        this.cache.set(key, { value, expiresAt });
    }

    /**
     * Retrieve value from cache (returns null if expired or not found)
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key) as CacheEntry<T> | undefined;

        if (!entry) {
            return null;
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.value;
    }

    /**
     * Check if key exists and is not expired
     */
    has(key: string): boolean {
        const entry = this.cache.get(key);
        if (!entry) {
            return false;
        }

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Delete specific key
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Remove expired entries
     */
    private cleanup(): void {
        const now = Date.now();
        const keysToDelete: string[] = [];

        this.cache.forEach((entry, key) => {
            if (now > entry.expiresAt) {
                keysToDelete.push(key);
            }
        });

        keysToDelete.forEach(key => this.cache.delete(key));
    }

    /**
     * Get cache statistics
     */
    getStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
}

// Export singleton instance
export const cache = new MemoryCache();

/**
 * Cache TTL constants (in seconds)
 */
export const CACHE_TTL = {
    COINGECKO_PRICES: 60,        // 1 minute
    DEFI_POSITIONS: 300,          // 5 minutes
    PORTFOLIO_HISTORY: 600,       // 10 minutes
    USER_PROFILE: 300,            // 5 minutes
    WATCHLIST: 120,               // 2 minutes
} as const;
