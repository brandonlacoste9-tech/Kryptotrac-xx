
import { TransactionSimulator } from "@/components/wallet/TransactionSimulator"

export default function SimulatePage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
      <TransactionSimulator />
    </div>
  )
}
