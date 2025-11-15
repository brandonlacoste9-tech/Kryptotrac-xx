/* app/api/portfolio/create.ts - minimal placeholder */
import { NextResponse } from 'next/server';
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body.asset) return NextResponse.json({ error: 'asset required' }, { status: 400 });
  // Persist with your DB (Supabase / Postgres) - this is a placeholder
  return NextResponse.json({ ok: true, asset: body.asset });
}
