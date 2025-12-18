/**
 * Price Conversion Utility
 * 
 * Provides functions to fetch cryptocurrency prices and convert
 * token amounts to USD values for DeFi position display.
 * 
 * Features:
 * - Fetch ETH, stETH, USDC prices from CoinGecko
 * - Convert native token amounts to USD
 * - Cache prices using existing cache utility (1-minute TTL)
 * - Handle price fetch failures gracefully
 */

import { cache, CACHE_TTL } from './cache';
import { logger } from './logger';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || '';

/**
 * Token ID mappings for CoinGecko API
 */
const TOKEN_IDS = {
    ETH: 'ethereum',
    STETH: 'staked-ether',
    USDC: 'usd-coin',
    WETH: 'weth',
} as const;

/**
 * Price map interface
 */
export interface PriceMap {
    ETH: number;
    STETH: number;
    USDC: number;
    WETH: number;
    timestamp: number;
}

/**
 * Get headers for CoinGecko API requests
 */
function getHeaders(): HeadersInit {
    const headers: HeadersInit = {
        'Accept': 'application/json',
    };

    if (COINGECKO_API_KEY) {
        headers['x-cg-pro-api-key'] = COINGECKO_API_KEY;
    }

    return headers;
}

/**
 * Fetch current ETH price in USD
 */
export async function getETHPrice(): Promise<number> {
    const cacheKey = 'price-eth-usd';
    const cached = cache.get<number>(cacheKey);

    if (cached !== null) {
        logger.debug('ETH price served from cache', { price: cached });
        return cached;
    }

    try {
        const response = await fetch(
            `${COINGECKO_API}/simple/price?ids=${TOKEN_IDS.ETH}&vs_currencies=usd`,
            { headers: getHeaders() }
        );

        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status}`);
        }

        const data = await response.json();
        const price = data[TOKEN_IDS.ETH]?.usd || 0;

        cache.set(cacheKey, price, CACHE_TTL.COINGECKO_PRICES);
        logger.info('Fetched ETH price', { price });

        return price;
    } catch (error) {
        logger.error('Failed to fetch ETH price', { error });
        // Return fallback price to prevent UI breakage
        return 3200; // Approximate ETH price
    }
}

/**
 * Fetch current stETH price in USD
 */
export async function getStETHPrice(): Promise<number> {
    const cacheKey = 'price-steth-usd';
    const cached = cache.get<number>(cacheKey);

    if (cached !== null) {
        logger.debug('stETH price served from cache', { price: cached });
        return cached;
    }

    try {
        const response = await fetch(
            `${COINGECKO_API}/simple/price?ids=${TOKEN_IDS.STETH}&vs_currencies=usd`,
            { headers: getHeaders() }
        );

        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status}`);
        }

        const data = await response.json();
        const price = data[TOKEN_IDS.STETH]?.usd || 0;

        cache.set(cacheKey, price, CACHE_TTL.COINGECKO_PRICES);
        logger.info('Fetched stETH price', { price });

        return price;
    } catch (error) {
        logger.error('Failed to fetch stETH price', { error });
        // stETH typically trades very close to ETH
        return 3200;
    }
}

/**
 * Get USDC price (always $1, but included for consistency)
 */
export function getUSDCPrice(): number {
    return 1.0;
}

/**
 * Fetch all DeFi token prices in a single batch request
 * More efficient than individual requests
 */
export async function getPriceMap(): Promise<PriceMap> {
    const cacheKey = 'price-map-defi';
    const cached = cache.get<PriceMap>(cacheKey);

    if (cached !== null) {
        logger.debug('Price map served from cache');
        return cached;
    }

    try {
        const tokenIds = [TOKEN_IDS.ETH, TOKEN_IDS.STETH, TOKEN_IDS.USDC].join(',');
        const response = await fetch(
            `${COINGECKO_API}/simple/price?ids=${tokenIds}&vs_currencies=usd`,
            { headers: getHeaders() }
        );

        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status}`);
        }

        const data = await response.json();

        const priceMap: PriceMap = {
            ETH: data[TOKEN_IDS.ETH]?.usd || 3200,
            STETH: data[TOKEN_IDS.STETH]?.usd || 3200,
            USDC: data[TOKEN_IDS.USDC]?.usd || 1.0,
            WETH: data[TOKEN_IDS.ETH]?.usd || 3200, // WETH = ETH
            timestamp: Date.now(),
        };

        cache.set(cacheKey, priceMap, CACHE_TTL.COINGECKO_PRICES);
        logger.info('Fetched price map', { prices: priceMap });

        return priceMap;
    } catch (error) {
        logger.error('Failed to fetch price map', { error });

        // Return fallback prices
        return {
            ETH: 3200,
            STETH: 3200,
            USDC: 1.0,
            WETH: 3200,
            timestamp: Date.now(),
        };
    }
}

/**
 * Convert token amount to USD value
 * 
 * @param amount - Token amount (as string or number)
 * @param token - Token symbol (ETH, STETH, USDC)
 * @param priceMap - Optional pre-fetched price map for batch conversions
 */
export async function convertToUSD(
    amount: string | number,
    token: keyof typeof TOKEN_IDS,
    priceMap?: PriceMap
): Promise<number> {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount) || numAmount === 0) {
        return 0;
    }

    // Use provided price map or fetch individual price
    let price: number;

    if (priceMap) {
        price = priceMap[token];
    } else {
        switch (token) {
            case 'ETH':
            case 'WETH':
                price = await getETHPrice();
                break;
            case 'STETH':
                price = await getStETHPrice();
                break;
            case 'USDC':
                price = getUSDCPrice();
                break;
            default:
                logger.warn('Unknown token for price conversion', { token });
                return 0;
        }
    }

    return numAmount * price;
}

/**
 * Format USD value for display
 * 
 * @param value - USD value
 * @param decimals - Number of decimal places (default: 2)
 */
export function formatUSD(value: number, decimals: number = 2): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
}

/**
 * Format token amount with symbol
 * 
 * @param amount - Token amount
 * @param token - Token symbol
 * @param decimals - Number of decimal places (default: 4)
 */
export function formatTokenAmount(
    amount: string | number,
    token: string,
    decimals: number = 4
): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) {
        return `0 ${token}`;
    }

    return `${numAmount.toFixed(decimals)} ${token}`;
}

/**
 * Format combined display (native + USD)
 * Example: "2.5 ETH ($8,000.00)"
 * 
 * @param amount - Token amount
 * @param token - Token symbol
 * @param usdValue - USD value (optional, will be calculated if not provided)
 */
export async function formatCombined(
    amount: string | number,
    token: keyof typeof TOKEN_IDS,
    usdValue?: number
): Promise<string> {
    const tokenDisplay = formatTokenAmount(amount, token);
    const usd = usdValue ?? await convertToUSD(amount, token);
    const usdDisplay = formatUSD(usd);

    return `${tokenDisplay} (${usdDisplay})`;
}
