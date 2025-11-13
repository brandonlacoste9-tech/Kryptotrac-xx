import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function DisclaimerBanner() {
  return (
    <div className="container mx-auto px-4 pt-4">
      <Alert className="bg-muted/50 border-border">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <span className="font-medium">Data by CoinGecko.</span> Prices for informational purposes only. Not financial
          advice.
        </AlertDescription>
      </Alert>
    </div>
  )
}
