import { Shield, Lock, Eye, Globe } from 'lucide-react'

export function TrustBanner() {
  return (
    <div className="bg-black/40 backdrop-blur-xl border-y border-white/10 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm font-medium text-white">Bank-Level Security</p>
            <p className="text-xs text-gray-400">Your data is encrypted</p>
          </div>

          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm font-medium text-white">Privacy First</p>
            <p className="text-xs text-gray-400">We never sell your data</p>
          </div>

          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <Eye className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm font-medium text-white">Full Transparency</p>
            <p className="text-xs text-gray-400">Open about monetization</p>
          </div>

          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <Globe className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm font-medium text-white">Canadian-Friendly</p>
            <p className="text-xs text-gray-400">Built for CAD investors</p>
          </div>
        </div>
      </div>
    </div>
  )
}
