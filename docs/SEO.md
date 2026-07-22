# KryptoTrac SEO checklist

## Implemented in product

- Unique titles & meta descriptions per route
- Canonical URLs via `NEXT_PUBLIC_SITE_URL` / default Netlify URL
- Open Graph + Twitter cards + dynamic OG image
- JSON-LD: WebSite, WebApplication, Organization, FAQ, coin WebPage
- `robots.txt` + dynamic `sitemap.xml` (static pages + top 100 coins)
- Server `generateMetadata` + static params for top coin pages
- Crawlable FAQ/content block on home + about
- `sr-only` h1 / coin summaries for crawlers

## After custom domain

1. Set `NEXT_PUBLIC_SITE_URL=https://kryptotrac.com`
2. Redeploy
3. [Google Search Console](https://search.google.com/search-console) → add property
4. Submit `https://kryptotrac.com/sitemap.xml`
5. Request indexing for home + `/coin/bitcoin` + `/about`

## Optional next

- Blog/guides (`/blog/how-to-track-crypto-portfolio`)
- Locale pages (`/fr`)
- Server-render top market table snapshot for richer home HTML
