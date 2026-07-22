"use client"

import { useRef, useState } from "react"
import { Download, Upload } from "lucide-react"
import { usePortfolio } from "@/lib/portfolio"

export function PortfolioBackup() {
  const { exportBackup, importBackup } = usePortfolio()
  const inputRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState("")

  function onExport() {
    const data = exportBackup()
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `kryptotrac-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg("Backup downloaded")
  }

  function onFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const json = JSON.parse(String(reader.result))
        const mode = window.confirm(
          "Merge with current portfolio?\n\nOK = merge\nCancel = replace all"
        )
          ? "merge"
          : "replace"
        const result = importBackup(json, mode)
        setMsg(result.message)
      } catch {
        setMsg("Invalid JSON file")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onExport}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-accent/40"
      >
        <Download className="h-3.5 w-3.5" />
        Export backup
      </button>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-accent/40"
      >
        <Upload className="h-3.5 w-3.5" />
        Import backup
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
          e.target.value = ""
        }}
      />
      {msg && <span className="text-xs text-accent">{msg}</span>}
    </div>
  )
}
