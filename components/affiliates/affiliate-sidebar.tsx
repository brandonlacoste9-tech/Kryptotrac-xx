import { ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const AFFILIATE_OFFERS = [
  {
    id: 1,
    name: "Coinbase",
    description: "Get $10 in Bitcoin when you buy or sell $100 or more",
    badge: "Popular",
    link: "#",
    color: "bg-blue-500/10 border-blue-500/20",
  },
  {
    id: 2,
    name: "Ledger",
    description: "Secure your crypto with the #1 hardware wallet",
    badge: "Secure",
    link: "#",
    color: "bg-purple-500/10 border-purple-500/20",
  },
  {
    id: 3,
    name: "CoinLedger",
    description: "Simplify your crypto taxes with automated tracking",
    badge: "Tax Season",
    link: "#",
    color: "bg-green-500/10 border-green-500/20",
  },
]

export function AffiliateSidebar() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground">Featured Partners</h3>
        <Badge variant="secondary" className="text-xs">
          Sponsored
        </Badge>
      </div>

      <div className="space-y-3">
        {AFFILIATE_OFFERS.map((offer) => (
          <Card key={offer.id} className={`${offer.color} border-2 hover:shadow-md transition-shadow`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{offer.name}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {offer.badge}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">{offer.description}</p>
              <Button className="w-full" variant="secondary" asChild>
                <a href={offer.link} target="_blank" rel="noopener noreferrer">
                  Learn More
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center pt-2">We may earn a commission from partner links</p>
    </div>
  )
}
