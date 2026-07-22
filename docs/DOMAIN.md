# Custom domain: kryptotrac.com

## Netlify UI (recommended)

1. Open https://app.netlify.com/projects/kryptotrac  
2. **Domain management** → **Add a domain** → `kryptotrac.com`  
3. Also add `www.kryptotrac.com` if you use www  
4. At your DNS provider, add the records Netlify shows (usually):
   - **Apex:** A record → Netlify load balancer IP, or ALIAS/ANAME to `kryptotrac.netlify.app`
   - **www:** CNAME → `kryptotrac.netlify.app`  
5. Wait for SSL (Let’s Encrypt) to provision  

## After DNS is live

```bash
npx netlify-cli env:set NEXT_PUBLIC_SITE_URL "https://kryptotrac.com"
npx netlify-cli deploy --build --prod
```

Update AdSense site URL to the same domain and confirm `https://kryptotrac.com/ads.txt` returns the publisher line.
