import Link from "next/link"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string; error_description?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 space-y-6 text-center">
          <div className="text-5xl">⚠️</div>
          <h1 className="text-2xl font-bold text-white">Authentication Error</h1>
          {params?.error ? (
            <div className="space-y-2">
              <p className="text-red-400 font-medium">Error: {params.error}</p>
              {params?.error_description && (
                <p className="text-white/60 text-sm">{params.error_description}</p>
              )}
            </div>
          ) : (
            <p className="text-white/60">An unspecified error occurred during authentication.</p>
          )}
          <Link
            href="/auth/login"
            className="inline-block px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 rounded-lg font-medium text-white shadow-lg shadow-red-500/50 hover:shadow-red-500/70 transition-all"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
