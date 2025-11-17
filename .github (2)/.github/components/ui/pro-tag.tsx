import { Lock, Zap } from 'lucide-react'
import Link from "next/link"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ProTagProps {
  feature: string
  className?: string
}

export function ProTag({ feature, className }: ProTagProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-semibold ${className || ""}`}
          >
            <Zap className="w-3 h-3" />
            PRO
          </span>
        </TooltipTrigger>
        <TooltipContent className="bg-black/95 border-red-900/30">
          <div className="text-sm space-y-2 p-2">
            <p className="font-semibold text-white">{feature} is a Pro feature</p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 text-red-400 hover:text-red-300"
            >
              Upgrade to unlock
              <Zap className="w-3 h-3" />
            </Link>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function ProFeatureButton({
  children,
  feature,
  disabled = true,
}: {
  children: React.ReactNode
  feature: string
  disabled?: boolean
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            disabled={disabled}
            className="relative inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/40 cursor-not-allowed"
          >
            <Lock className="w-4 h-4" />
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent className="bg-black/95 border-red-900/30">
          <div className="text-sm space-y-2 p-2">
            <p className="font-semibold text-white">{feature}</p>
            <p className="text-white/60">Unlock with Pro</p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 font-medium"
            >
              View Plans
              <Zap className="w-3 h-3" />
            </Link>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
