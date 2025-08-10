"use client"

import type React from "react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/auth"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ShoppingBag from "@/components/shopping-bag"

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { isLoggingOut } = useAuthStore()

  // Track component mount state
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Don't show header/footer on dashboard pages or during logout
  const showHeaderFooter = !pathname.startsWith("/dashboard") && !isLoggingOut

  // Don't render until mounted to avoid hydration issues
  // Also show minimal UI during logout to avoid DOM manipulation
  if (!mounted || isLoggingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          {isLoggingOut && <p>Logging out...</p>}
        </div>
      </div>
    )
  }

  return (
    <>
      {showHeaderFooter && <Header />}
      <main className="min-h-screen">{children}</main>
      {showHeaderFooter && <Footer />}
      {!isLoggingOut && <ShoppingBag />}
    </>
  )
}
