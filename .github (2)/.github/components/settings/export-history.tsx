"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileSpreadsheet, FileText } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"

interface ExportRecord {
  id: string
  export_type: "csv" | "pdf"
  file_size: number | null
  created_at: string
}

interface ExportHistoryProps {
  userId: string
  isPro: boolean
}

export function ExportHistory({ userId, isPro }: ExportHistoryProps) {
  const [exports, setExports] = useState<ExportRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchExports() {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from("export_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("[v0] Error fetching exports:", error)
      } else {
        setExports(data || [])
      }
      setLoading(false)
    }

    fetchExports()
  }, [userId])

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (!isPro) {
    return (
      <Card className="glass-card border-primary/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Export History</CardTitle>
            <Badge variant="default" className="bg-primary text-white">
              PRO ONLY
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-white/60 text-sm">
            Track your portfolio exports with KryptoTrac Pro. Upgrade to access export history and advanced PDF reports.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Export History</CardTitle>
          <Badge variant="default" className="bg-primary text-white">
            PRO
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-white/60 text-sm">Loading export history...</p>
        ) : exports.length === 0 ? (
          <p className="text-white/60 text-sm">No exports yet. Export your portfolio to see history here.</p>
        ) : (
          <div className="space-y-3">
            {exports.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between py-3 border-b border-white/10 last:border-0"
              >
                <div className="flex items-center gap-3">
                  {exp.export_type === "csv" ? (
                    <FileSpreadsheet className="h-5 w-5 text-green-400" />
                  ) : (
                    <FileText className="h-5 w-5 text-red-400" />
                  )}
                  <div>
                    <p className="text-white text-sm font-medium">{exp.export_type.toUpperCase()} Export</p>
                    <p className="text-white/60 text-xs">{new Date(exp.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-xs">{formatFileSize(exp.file_size)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {exports.length > 0 && <p className="text-white/40 text-xs mt-4">Showing last 10 exports</p>}
      </CardContent>
    </Card>
  )
}
