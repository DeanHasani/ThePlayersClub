import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"
import ErrorBoundary from "@/components/error-boundary"
import { ToastContainer } from "@/components/toast"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "THE PLAYERS CLUB - FASHION AND APPAREAL",
  description: "designed by Dean Hasani",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-medium`}>
        <ErrorBoundary>
          <ClientLayout>{children}</ClientLayout>
          <ToastContainer />
        </ErrorBoundary>
      </body>
    </html>
  )
}
