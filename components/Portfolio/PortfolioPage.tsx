'use client';
import React, { useState } from 'react';
export default function PortfolioPage() {
  const [asset, setAsset] = useState('');
  const [items, setItems] = useState<string[]>([]);
  async function add() {
    if (!asset) return;
    await fetch('/api/portfolio/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ asset })});
    setItems((s) => [...s, asset]);
    setAsset('');
  }
  return (
    <div>
      <h2>Your Portfolio</h2>
      <input value={asset} onChange={(e) => setAsset(e.target.value)} placeholder="BTC" />
      <button onClick={add}>Add</button>
      <ul>{items.map((i, idx) => <li key={idx}>{i}</li>)}</ul>
    </div>
  );
}
