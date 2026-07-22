import { siteUrl } from "@/lib/utils"

/** Server-rendered JSON-LD for the app shell */
export function AppJsonLd() {
  const base = siteUrl()
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: "KryptoTrac",
        description:
          "Free private crypto portfolio tracker with live CoinGecko markets, USD & CAD, alerts, and compare tools.",
        inLanguage: "en",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${base}/?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebApplication",
        "@id": `${base}/#app`,
        name: "KryptoTrac",
        url: base,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description:
          "Track crypto holdings with live prices. Portfolio stays in your browser — no account required.",
        featureList: [
          "Live crypto markets",
          "Private browser portfolio",
          "USD and CAD",
          "Price alerts",
          "Coin compare",
          "Watchlist",
        ],
      },
      {
        "@type": "Organization",
        "@id": `${base}/#org`,
        name: "KryptoTrac",
        url: base,
        logo: `${base}/favicon.svg`,
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function FaqJsonLd({
  faqs,
}: {
  faqs: { question: string; answer: string }[]
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function CoinJsonLd({
  id,
  name,
  symbol,
  description,
  image,
  priceUsd,
}: {
  id: string
  name: string
  symbol: string
  description?: string
  image?: string
  priceUsd?: number
}) {
  const base = siteUrl()
  const data = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${name} (${symbol.toUpperCase()}) price & portfolio tracker`,
    url: `${base}/coin/${id}`,
    description:
      description?.slice(0, 300) ||
      `Track ${name} (${symbol.toUpperCase()}) price, charts, and add it to your private KryptoTrac portfolio.`,
    isPartOf: { "@id": `${base}/#website` },
    about: {
      "@type": "Thing",
      name,
      alternateName: symbol.toUpperCase(),
      image,
      ...(priceUsd != null
        ? {
            additionalProperty: {
              "@type": "PropertyValue",
              name: "priceUSD",
              value: priceUsd,
            },
          }
        : {}),
    },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
