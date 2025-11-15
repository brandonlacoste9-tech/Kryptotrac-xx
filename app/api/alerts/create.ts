import { NextResponse } from 'next/server';
export async function POST(req: Request) {
  const body = await req.json().catch(()=>({}));
  if (!body.symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 });
  // Persist alert; placeholder
  return NextResponse.json({ ok: true, alert: { id: Date.now(), ...body } });
}
