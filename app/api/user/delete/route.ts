import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Delete user's data from all tables
    // Note: This should be done in a transaction ideally, but we'll do it sequentially
    const userId = user.id;
    
    try {
      // Delete user portfolios
      await supabase.from('user_portfolios').delete().eq('user_id', userId);
      
      // Delete user watchlists
      await supabase.from('user_watchlists').delete().eq('user_id', userId);
      
      // Delete user wallets
      await supabase.from('user_wallets').delete().eq('user_id', userId);
      
      // Delete price alerts
      await supabase.from('price_alerts').delete().eq('user_id', userId);
      
      // Delete portfolio snapshots
      await supabase.from('portfolio_snapshots').delete().eq('user_id', userId);
      
      // Delete insights history
      await supabase.from('insights_history').delete().eq('user_id', userId);
      
      // Delete subscriptions
      await supabase.from('subscriptions').delete().eq('user_id', userId);
      
      // Delete user subscriptions
      await supabase.from('user_subscriptions').delete().eq('user_id', userId);
      
      // Delete referrals
      await supabase.from('referrals').delete().eq('referrer_id', userId);
      await supabase.from('referrals').delete().eq('referred_id', userId);
      
      // Delete profile
      await supabase.from('profiles').delete().eq('id', userId);
      
      // Finally, delete the auth user using admin client
      const adminClient = createAdminClient();
      const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId);
      
      if (deleteUserError) {
        console.error('Failed to delete auth user:', deleteUserError);
        // Continue anyway as data is deleted
      }
      
      return NextResponse.json({ 
        success: true,
        message: 'Account deleted successfully',
      });
      
    } catch (deleteError) {
      console.error('Error deleting user data:', deleteError);
      return NextResponse.json({ 
        error: 'Failed to delete all account data' 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete account' 
    }, { status: 500 });
  }
}
