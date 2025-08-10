"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function DashboardLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false) // Added for loading state
  const [mounted, setMounted] = useState(false)
  const { login, isAuthenticated, isLoggingOut } = useAuthStore()
  const router = useRouter()

  // Track component mount state
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Handle authentication redirect
  useEffect(() => {
    if (!mounted) return

    if (isAuthenticated && !isLoggingOut) {
      router.replace("/dashboard/admin")
    }
  }, [isAuthenticated, isLoggingOut, mounted, router])

  // Updated to handle the async login and loading state
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mounted) return

    setError("")
    setIsLoading(true)

    const success = await login(username, password)

    if (success) {
      router.replace("/dashboard/admin")
    } else {
      setError("Invalid credentials")
      setPassword("")
    }
    setIsLoading(false)
  }

  // Don't render anything if not mounted or if authenticated
  if (!mounted || (isAuthenticated && !isLoggingOut)) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {/* Logo Section */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-4">
          <Image
            src="/images/logo.svg"
            alt="The Players Club"
            width={96}
            height={96}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Login Form */}
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-wider">ADMIN LOGIN</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-800 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "LOGGING IN..." : "LOGIN"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
