/* lib/crypto/prices.ts */
const DEFAULT_TTL_MS = Number(process.env.PRICE_CACHE_TTL_MS || 15000);
type PriceRow = { symbol: string; price: number; market_cap?: number; last_updated?: string; };
const cache = new Map<string, { ts: number; data: PriceRow }>();
function symbolToId(symbol: string) {
  const s = symbol.toLowerCase();
  if (s === 'btc' || s === 'bitcoin') return 'bitcoin';
  if (s === 'eth' || s === 'ethereum') return 'ethereum';
  if (s === 'usdc') return 'usd-coin';
  return s;
}
export async function getLivePrices(symbols: string[]): Promise<PriceRow[]> {
  const now = Date.now();
  const toFetch: string[] = [];
  const results: PriceRow[] = [];
  for (const sym of symbols) {
    const key = sym.toUpperCase();
    const cached = cache.get(key);
    if (cached && now - cached.ts < DEFAULT_TTL_MS) results.push(cached.data);
    else toFetch.push(symbolToId(sym));
  }
  if (toFetch.length === 0) return results;
  try {
    const ids = Array.from(new Set(toFetch)).join(',');
    const url = `${process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3'}/coins/markets?vs_currency=usd&ids=${encodeURIComponent(ids)}&order=market_cap_desc&per_page=250&page=1&sparkline=false`;
    const res = await fetch(url, { headers: { 'User-Agent': 'KryptoTrac/1.0' } });
    if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
    const data = await res.json();
    for (const item of data) {
      const row: PriceRow = {
        symbol: (item.symbol || item.id || '').toUpperCase(),
        price: Number(item.current_price ?? 0),
        market_cap: Number(item.market_cap ?? 0),
        last_updated: item.last_updated ?? new Date().toISOString(),
      };
      cache.set(row.symbol, { ts: now, data: row });
      results.push(row);
    }
  } catch (err) {
    console.error('getLivePrices error', err);
  }
  const bySym = new Map(results.map((r) => [r.symbol.toUpperCase(), r]));
  return symbols.map((s) => bySym.get(s.toUpperCase()) ?? { symbol: s.toUpperCase(), price: 0 });
}
export default getLivePrices;
