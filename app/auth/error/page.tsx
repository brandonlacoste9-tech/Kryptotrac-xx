import Link from "next/link"
import { HardwareContainer } from "@/components/shared/hardware-container"
import { AlertTriangle, ArrowLeft } from "lucide-react"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string; error_description?: string }>
}) {
  const params = await searchParams

  return (
    <HardwareContainer>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        
        <div className="w-full max-w-md">
          <div className="glass-panel p-8 text-center space-y-6 border border-red-500/20 bg-red-500/5 rounded-xl">
             <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto border border-red-500/50">
               <AlertTriangle className="w-8 h-8 text-red-500" />
             </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold font-mono text-white">SYSTEM_ERROR</h1>
              <p className="text-sm text-red-400 font-mono uppercase tracking-wider">
                 AUTHENTICATION FAILURE
              </p>
            </div>

            {params?.error ? (
              <div className="p-4 bg-black/40 border border-red-500/20 rounded text-left font-mono text-xs space-y-2">
                <div className="flex gap-2">
                  <span className="text-red-500 shrink-0">CODE::</span>
                  <span className="text-white break-all">{params.error}</span>
                </div>
                {params?.error_description && (
                  <div className="flex gap-2">
                    <span className="text-red-500 shrink-0">DESC::</span>
                    <span className="text-muted-foreground break-all">{params.error_description}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-white/60 font-mono text-sm">Unknown system anomaly detected during handshake.</p>
            )}

            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded font-mono text-red-500 text-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              RETURN_TO_BASE
            </Link>
          </div>
        </div>
      </div>
    </HardwareContainer>
  )
}
