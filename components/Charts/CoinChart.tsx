'use client';
import React from 'react';
export default function CoinChart({ symbol = 'BTC' }: { symbol?: string }) {
  return <div style={{height:300, background:'#0f172a', color:'#fff', padding:12}}>Coin chart placeholder for {symbol}</div>;
}
