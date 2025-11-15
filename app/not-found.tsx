import Link from "next/link"
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-9xl font-bold bg-gradient-to-r from-red-500 via-red-400 to-white bg-clip-text text-transparent">
          404
        </div>
        <h1 className="text-3xl font-bold text-white">Page Not Found</h1>
        <p className="text-white/60">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-md bg-gradient-to-r from-red-600 to-red-500 text-white font-medium shadow-lg shadow-red-500/50 hover:shadow-red-500/70 transition-all"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 h-12 px-6 rounded-md border border-white/20 bg-black/50 backdrop-blur text-white hover:bg-white/10 hover:border-white/30 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
