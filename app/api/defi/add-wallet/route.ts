import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { address, label } = body;
    
    // Validate wallet address
    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }
    
    // Basic Ethereum address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address format' }, { status: 400 });
    }
    
    // Check if wallet already exists for this user
    const { data: existingWallet } = await supabase
      .from('user_wallets')
      .select('id')
      .eq('user_id', user.id)
      .eq('address', address.toLowerCase())
      .single();
    
    if (existingWallet) {
      return NextResponse.json({ error: 'This wallet is already added' }, { status: 400 });
    }
    
    // Insert the wallet
    const { data: newWallet, error: insertError } = await supabase
      .from('user_wallets')
      .insert({
        user_id: user.id,
        address: address.toLowerCase(),
        chain: 'ethereum',
        label: label || null,
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Failed to insert wallet:', insertError);
      return NextResponse.json({ error: 'Failed to add wallet' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      wallet: newWallet,
      message: 'Wallet added successfully',
    });
    
  } catch (error) {
    console.error('Add wallet error:', error);
    return NextResponse.json({ 
      error: 'Failed to add wallet' 
    }, { status: 500 });
  }
}
