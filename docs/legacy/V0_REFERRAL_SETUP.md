# How to Get Your v0 Referral Link

The referral code `BLNPBF` returns a 404 error, which means:

1. **It's not a valid referral code**, OR
2. **You need to join the v0 Ambassador Program first**

## Steps to Fix:

### Option 1: Join v0 Ambassador Program (Recommended - Earn Money!)
1. Go to https://vercel.com/ambassadors
2. Apply to become a v0 Ambassador
3. Once approved, you'll get an official referral link like `https://v0.dev/r/YOUR_CODE`
4. You earn **$10 per Premium signup** and **$30 per Team signup**

### Option 2: Simple "Built with v0" Link (No Referral)
If you just want to credit v0 without a referral program:
- Use `https://v0.dev` (currently implemented)
- This just links to v0's homepage

### Option 3: Get Your Personal Referral Code
1. Log into your v0 account at https://v0.dev
2. Click your profile icon
3. Look for "Referrals" or "Share" section
4. Copy your personal referral link
5. Update `components/layout/footer.tsx` line 50 with your actual link

## Current Status:
- Changed link to `https://v0.dev` (works, no 404)
- Removed "$5 credit" text since we don't have a valid referral code
- Button now just says "Built with v0"

## To Re-enable Referral:
Once you have your real referral link, replace line 50 in `components/layout/footer.tsx`:

\`\`\`tsx
href="https://v0.dev/r/YOUR_ACTUAL_CODE"
\`\`\`

And add back the credit text:
\`\`\`tsx
<span className="text-xs text-muted-foreground">· Get $5 credit</span>
