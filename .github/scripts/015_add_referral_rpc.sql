-- Add RPC function to increment referral credits atomically
CREATE OR REPLACE FUNCTION increment_referral_credits(user_id UUID, amount DECIMAL)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_referrals (user_id, total_signups, total_conversions, total_credits, credits_earned)
  VALUES (user_id, 
          CASE WHEN amount = 5 THEN 1 ELSE 0 END,
          CASE WHEN amount = 20 THEN 1 ELSE 0 END,
          amount,
          amount)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_signups = user_referrals.total_signups + CASE WHEN amount = 5 THEN 1 ELSE 0 END,
    total_conversions = user_referrals.total_conversions + CASE WHEN amount = 20 THEN 1 ELSE 0 END,
    total_credits = user_referrals.total_credits + amount,
    credits_earned = user_referrals.credits_earned + amount;
END;
$$ LANGUAGE plpgsql;
