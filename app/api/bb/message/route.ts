/* app/api/bb/message/route.ts */
import { NextResponse } from 'next/server';
export async function POST(req: Request){
  try {
    const body = await req.json().catch(()=>({}));
    const message = body.message || '';
    if(!message) return NextResponse.json({ error:'message required' }, { status:400 });
    // Try forward to /api/atlas/query then fallback
    try {
      const atlasRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/atlas/query`, {
        method:'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ mode:'friend', persona: 'bb', message })
      });
      if(atlasRes.ok){ const d = await atlasRes.json(); const reply = d?.bb_reply ?? d?.analysis ?? d?.reply; if(reply) return NextResponse.json({ reply }); }
    } catch(e){ console.warn('atlas forward failed', e); }
    const fallback = "Hey bro — breathe. Charts are just numbers. Keep it small and we'll ride it out. I got you.";
    return NextResponse.json({ reply: fallback });
  } catch (err){ console.error('bb message error', err); return NextResponse.json({ error: 'internal' }, { status: 500 }); }
}
