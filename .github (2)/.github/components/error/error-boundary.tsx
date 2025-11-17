"use client"

import { Component, type ReactNode } from "react"
import { AlertTriangle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("[v0] Error boundary caught:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-black">
          <Card className="max-w-md w-full p-8 text-center space-y-6 bg-neutral-900 border-neutral-800">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-500/10 p-4">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Something went wrong</h2>
              <p className="text-neutral-400">
                We encountered an unexpected error. Our team has been notified.
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  this.setState({ hasError: false })
                  window.location.href = "/"
                }}
                className="w-full"
              >
                Return to Home
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Reload Page
              </Button>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
