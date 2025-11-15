'use client';
import React, { useState } from 'react';
export default function AdAuditTool(){
  const [url,setUrl]=useState(''); const [report,setReport]=useState(null);
  async function run(){ const r = await fetch('/api/tools/addaudit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url})}); const d=await r.json(); setReport(d.report); }
  return (<div><h3>AdAudit (Demo)</h3><input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://..." /><button onClick={run}>Run</button><pre>{JSON.stringify(report,null,2)}</pre></div>);
}
