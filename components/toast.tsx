"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info"
  duration?: number
}

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 50)

    // Auto remove after duration
    const timer = setTimeout(() => {
      setIsLeaving(true)
      setTimeout(() => onRemove(toast.id), 300)
    }, toast.duration || 4000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => onRemove(toast.id), 300)
  }

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getBorderColor = () => {
    switch (toast.type) {
      case "success":
        return "border-green-600"
      case "error":
        return "border-red-600"
      case "info":
        return "border-blue-600"
    }
  }

  return (
    <div
      className={`bg-white border-2 ${getBorderColor()} shadow-lg p-4 mb-3 min-w-80 max-w-sm transition-all duration-300 ease-out ${
        isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{toast.message}</p>
        </div>
        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// Toast Container Component
export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  // Global toast function
  useEffect(() => {
    const showToast = (message: string, type: "success" | "error" | "info" = "info", duration = 4000) => {
      const id = Date.now().toString()
      const newToast: Toast = { id, message, type, duration }
      setToasts((prev) => [...prev, newToast])
    }

    // Make it globally available
    ;(window as any).showToast = showToast

    return () => {
      delete (window as any).showToast
    }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </div>
  )
}

// Helper function to show toasts
export const showToast = (message: string, type: "success" | "error" | "info" = "info", duration = 4000) => {
  if (typeof window !== "undefined" && (window as any).showToast) {
    ;(window as any).showToast(message, type, duration)
  }
}
