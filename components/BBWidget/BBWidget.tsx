'use client';
import React, { useState, useEffect } from 'react';
export function BBWidget() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{from: string; text: string}>>([]);
  const [text, setText] = useState('');
  useEffect(()=>setMessages([{from:'bb', text:"Yo Bee, I'm right here. I got you."}]),[]);
  async function send(){ const trimmed=text.trim(); if(!trimmed)return; setMessages(m=>[...m,{from:'user',text:trimmed}]); setLoading(true); setText('');
    try{
      const res = await fetch('/api/bb/message', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({message:trimmed, persona:'bb'})});
      const data = await res.json();
      setMessages(m=>[...m,{from:'bb', text: (data.reply || 'I got you.')}]);
    }catch(e){ setMessages(m=>[...m,{from:'bb', text:'I had trouble connecting. I got you later.'}]); } finally{ setLoading(false); }
  }
  return (
    <div>
      <button className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-orange-500" onClick={()=>setOpen(o=>!o)} aria-label="Open BB" title="BB—your crypto buddy">BB</button>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-full rounded-xl bg-white shadow-2xl border border-gray-100">
          <div className="p-3 border-b flex items-center justify-between"><div className="font-semibold">BB — Your Crypto Buddy</div><div className="text-sm text-gray-500">{loading ? 'thinking...' : 'online'}</div></div>
          <div className="p-3 h-64 overflow-auto" style={{ background: '#fafafa' }}>{messages.map((m,i)=>(<div key={i} className={m.from==='bb'?'text-left':'text-right'}><div className={m.from==='bb'?'inline-block px-3 py-2 rounded-lg bg-white':'inline-block px-3 py-2 rounded-lg bg-orange-500 text-white'}>{m.text}</div></div>))}</div>
          <div className="p-3 border-t flex gap-2"><input value={text} onChange={(e)=>setText(e.target.value)} className="flex-1 border rounded px-3 py-2" placeholder="Ask BB..." onKeyDown={(e)=>{if(e.key==='Enter') send();}}/><button className="bg-orange-500 text-white px-3 rounded" onClick={send} disabled={loading}>Send</button></div>
        </div>
      )}
    </div>
  );
}
export default BBWidget;
