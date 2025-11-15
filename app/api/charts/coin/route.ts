export async function POST(req: Request) {
  const { symbol } = await req.json().catch(() => ({}));
  // Placeholder: return synthetic historical points
  const points = Array.from({length:30}).map((_,i)=>({ t: i, v: Math.random()*1000 }));
  return new Response(JSON.stringify({ points }), { status: 200 });
}
