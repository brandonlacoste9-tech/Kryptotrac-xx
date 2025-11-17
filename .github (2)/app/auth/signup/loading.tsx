export default function SignupLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="h-8 w-48 mx-auto bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-64 mx-auto bg-white/5 rounded animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-10 bg-white/5 rounded animate-pulse" />
            <div className="h-10 bg-white/5 rounded animate-pulse" />
            <div className="h-12 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
