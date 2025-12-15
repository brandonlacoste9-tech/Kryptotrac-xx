import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getAllDeFiPositions } from '@/lib/defi/integrations';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user's saved wallet addresses
    const { data: wallets } = await supabase
      .from('user_wallets')
      .select('address, chain, label')
      .eq('user_id', user.id);
    
    if (!wallets || wallets.length === 0) {
      return NextResponse.json({ 
        positions: [], 
        message: 'No wallets configured' 
      });
    }
    
    // Fetch DeFi positions for each wallet
    const allPositions = await Promise.all(
      wallets
        .filter(w => w.chain === 'ethereum') // Only Ethereum for now
        .map(async (wallet) => {
          const positions = await getAllDeFiPositions(wallet.address);
          return {
            ...positions,
            label: wallet.label,
          };
        })
    );
    
    return NextResponse.json({ 
      positions: allPositions,
      count: allPositions.length,
    });
    
  } catch (error) {
    console.error('DeFi positions fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch positions' 
    }, { status: 500 });
  }
}
