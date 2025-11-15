/* app/api/prices/route.ts */
import { NextResponse } from 'next/server';
import { getLivePrices } from '@/lib/crypto/prices';
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const symbols = Array.isArray(body.symbols) ? body.symbols.map(String) : [];
    if (symbols.length === 0) return NextResponse.json({ error: 'symbols required' }, { status: 400 });
    const prices = await getLivePrices(symbols);
    return NextResponse.json({ prices });
  } catch (err) {
    console.error('prices route error', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
