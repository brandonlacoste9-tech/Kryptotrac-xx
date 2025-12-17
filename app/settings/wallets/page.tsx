import { WalletManager } from '@/components/settings/WalletManager'

export const metadata = {
    title: 'Manage Wallets | KryptoTrac',
    description: 'Manage your Ethereum wallets for DeFi position tracking',
}

export default function WalletsPage() {
    return (
        <div className="min-h-screen bg-black py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <WalletManager />
            </div>
        </div>
    )
}
