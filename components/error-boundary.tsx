"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  isLogoutError: boolean
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error?: Error; reset: () => void }> },
  ErrorBoundaryState
> {
  private logoutCheckTimer: NodeJS.Timeout | null = null

  constructor(props: {
    children: React.ReactNode
    fallback?: React.ComponentType<{ error?: Error; reset: () => void }>
  }) {
    super(props)
    this.state = { hasError: false, isLogoutError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Check if this looks like a logout-related error
    const isLogoutError =
      error.message.includes("removeChild") ||
      error.message.includes("Cannot read properties") ||
      error.message.includes("Cannot access before initialization") ||
      error.stack?.includes("logout") ||
      error.stack?.includes("router") ||
      // Check if we're currently in a logout state
      (typeof window !== "undefined" && window.location.pathname === "/") ||
      (typeof window !== "undefined" && document.body.style.overflow === "hidden")

    return { hasError: true, error, isLogoutError }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)

    // If this seems like a logout error, automatically redirect after a short delay
    if (this.state.isLogoutError) {
      console.log("🔄 Detected logout-related error, redirecting...")
      this.logoutCheckTimer = setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = "/"
        }
      }, 100)
    }
  }

  componentWillUnmount() {
    if (this.logoutCheckTimer) {
      clearTimeout(this.logoutCheckTimer)
    }
  }

  render() {
    if (this.state.hasError) {
      // If it's a logout error, show minimal UI or redirect immediately
      if (this.state.isLogoutError) {
        // Don't show error UI for logout errors - just redirect
        if (typeof window !== "undefined") {
          // Use setTimeout to avoid blocking the render
          setTimeout(() => {
            window.location.href = "/"
          }, 0)
        }

        // Return minimal loading state while redirecting
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
              <p>Redirecting...</p>
            </div>
          </div>
        )
      }

      // For legitimate errors, show the full error UI
      const reset = () => {
        this.setState({ hasError: false, error: undefined, isLogoutError: false })
      }

      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} reset={reset} />
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold">Something went wrong</CardTitle>
              <CardDescription>An unexpected error occurred. This might be a temporary issue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
                  <p className="font-medium mb-1">Error details:</p>
                  <p className="text-xs">{this.state.error.message}</p>
                </div>
              )}
              <div className="flex space-x-2">
                <Button onClick={reset} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => (window.location.href = "/")} className="flex-1">
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
