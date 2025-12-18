import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cache } from '@/lib/cache';
import { logger } from '@/lib/logger';

/**
 * Health Check Endpoint
 * 
 * Provides system health status for monitoring and uptime checks.
 * Publicly accessible endpoint that checks:
 * - Database connectivity
 * - External API availability
 * - Cache statistics
 * - System version
 */

interface HealthCheck {
    status: 'up' | 'down' | 'degraded';
    responseTime?: number;
    error?: string;
}

interface HealthResponse {
    status: 'healthy' | 'unhealthy' | 'degraded';
    version: string;
    timestamp: string;
    checks: {
        database: HealthCheck;
        coingecko: HealthCheck;
        cache: {
            status: 'up' | 'down';
            stats?: {
                size: number;
                hitRate?: number;
            };
        };
    };
    uptime: number;
}

const startTime = Date.now();

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<HealthCheck> {
    const start = Date.now();

    try {
        const supabase = await createServerClient();

        // Simple query to check connectivity
        const { error } = await supabase
            .from('user_wallets')
            .select('id')
            .limit(1);

        if (error) {
            logger.warn('Database health check failed', { error });
            return {
                status: 'down',
                responseTime: Date.now() - start,
                error: error.message,
            };
        }

        return {
            status: 'up',
            responseTime: Date.now() - start,
        };
    } catch (error) {
        logger.error('Database health check error', { error });
        return {
            status: 'down',
            responseTime: Date.now() - start,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Check CoinGecko API availability
 */
async function checkCoinGecko(): Promise<HealthCheck> {
    const start = Date.now();

    try {
        const response = await fetch('https://api.coingecko.com/api/v3/ping', {
            signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        if (!response.ok) {
            return {
                status: 'down',
                responseTime: Date.now() - start,
                error: `HTTP ${response.status}`,
            };
        }

        return {
            status: 'up',
            responseTime: Date.now() - start,
        };
    } catch (error) {
        logger.warn('CoinGecko health check failed', { error });
        return {
            status: 'down',
            responseTime: Date.now() - start,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Get cache statistics
 */
function getCacheStats() {
    try {
        const stats = cache.getStats();

        return {
            status: 'up' as const,
            stats: {
                size: stats.size,
                hitRate: stats.hits > 0 ? stats.hits / (stats.hits + stats.misses) : 0,
            },
        };
    } catch (error) {
        logger.error('Cache stats error', { error });
        return {
            status: 'down' as const,
        };
    }
}

/**
 * GET /api/health
 * 
 * Returns system health status
 */
export async function GET() {
    const timestamp = new Date().toISOString();

    try {
        // Run health checks in parallel
        const [database, coingecko] = await Promise.all([
            checkDatabase(),
            checkCoinGecko(),
        ]);

        const cacheCheck = getCacheStats();

        // Determine overall status
        let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

        if (database.status === 'down') {
            overallStatus = 'unhealthy'; // Database is critical
        } else if (coingecko.status === 'down') {
            overallStatus = 'degraded'; // CoinGecko is not critical
        }

        const response: HealthResponse = {
            status: overallStatus,
            version: process.env.npm_package_version || '1.0.0',
            timestamp,
            checks: {
                database,
                coingecko,
                cache: cacheCheck,
            },
            uptime: Math.floor((Date.now() - startTime) / 1000), // seconds
        };

        // Log health check results
        logger.info('Health check completed', {
            status: overallStatus,
            dbResponseTime: database.responseTime,
            coinGeckoResponseTime: coingecko.responseTime,
        });

        // Return appropriate HTTP status
        const httpStatus = overallStatus === 'healthy' ? 200 :
            overallStatus === 'degraded' ? 200 : 503;

        return NextResponse.json(response, { status: httpStatus });

    } catch (error) {
        logger.error('Health check failed', { error });

        return NextResponse.json(
            {
                status: 'unhealthy',
                version: process.env.npm_package_version || '1.0.0',
                timestamp,
                error: error instanceof Error ? error.message : 'Unknown error',
                uptime: Math.floor((Date.now() - startTime) / 1000),
            },
            { status: 503 }
        );
    }
}
