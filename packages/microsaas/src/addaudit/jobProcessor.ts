/* packages/microsaas/src/addaudit/jobProcessor.ts - demo */
export async function processAudit(url:string){
  // Demo heuristic: return a tiny report
  return { url, score: Math.round(Math.random()*100), issues: ['missing meta description'] };
}
