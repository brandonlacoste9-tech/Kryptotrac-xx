# Email Alerts Setup Guide

## 1. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Create an API key in the dashboard
3. Add to your Vercel environment variables:
   \`\`\`
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   \`\`\`

## 2. Configure QStash Scheduled Job

The email alerts are triggered by a cron job that runs every 5 minutes.

### Option A: Use Upstash QStash (Recommended)

1. Go to [Upstash Console](https://console.upstash.com/qstash)
2. Create a new scheduled job:
   - **Destination URL**: `https://your-domain.vercel.app/api/cron/check-alerts`
   - **Schedule**: `*/5 * * * *` (every 5 minutes)
   - **Method**: GET
   - **Headers**: Add `Authorization: Bearer YOUR_SECRET_TOKEN`

3. Add to environment variables:
   \`\`\`
   CRON_SECRET=YOUR_SECRET_TOKEN
   \`\`\`

### Option B: Use Vercel Cron (if available)

Add to `vercel.json`:
\`\`\`json
{
  "crons": [
    {
      "path": "/api/cron/check-alerts",
      "schedule": "*/5 * * * *"
    }
  ]
}
\`\`\`

## 3. Test the Email System

### Test locally:
\`\`\`bash
curl http://localhost:3000/api/cron/check-alerts \
  -H "Authorization: Bearer YOUR_SECRET_TOKEN"
\`\`\`

### Test in production:
\`\`\`bash
curl https://your-domain.vercel.app/api/cron/check-alerts \
  -H "Authorization: Bearer YOUR_SECRET_TOKEN"
\`\`\`

## 4. Verify Domain (Optional but Recommended)

For better email deliverability:

1. Go to Resend dashboard
2. Add and verify your domain
3. Update the `from` field in `lib/email.ts`:
   \`\`\`typescript
   from: "KryptoTrac Alerts <alerts@yourdomain.com>"
   \`\`\`

## Email Templates

The system sends two types of emails:

1. **Price Alert Email**: Sent when a price threshold is crossed
2. **Welcome Email**: Sent when a user signs up (optional)

Both emails use a dark theme with red accents matching the KryptoTrac brand.

## Troubleshooting

- **Emails not sending**: Check RESEND_API_KEY is set correctly
- **Cron not running**: Verify QStash schedule is active
- **Alerts not triggering**: Check database has active alerts with `is_triggered = false`
- **Wrong email address**: Ensure users table has correct email in Supabase
\`\`\`

\`\`\`typescript file="" isHidden
