export async function POST(req: Request){
  const body = await req.json().catch(()=>({}));
  const url = body.url;
  if(!url) return new Response(JSON.stringify({ error:'url required' }), { status:400 });
  // call job processor - in production this should enqueue
  const proc = await import('@/packages/microsaas/src/addaudit/jobProcessor').catch(()=>null);
  const report = proc? await proc.processAudit(url) : { url, score: 0 };
  return new Response(JSON.stringify({ ok:true, report }), { status:200 });
}
