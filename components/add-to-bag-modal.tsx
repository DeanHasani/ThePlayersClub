"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useCartStore } from "@/lib/store"

interface AddToBagModalProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  productColor: string
  productSize: string
  productPrice: number
  onCheckout?: () => void // Add this prop to trigger checkout
}

export default function AddToBagModal({
  isOpen,
  onClose,
  productName,
  productColor,
  productSize,
  productPrice,
  onCheckout,
}: AddToBagModalProps) {
  const [show, setShow] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toggleCart } = useCartStore()

  useEffect(() => {
    if (isOpen) {
      setShow(true)
      setProgress(0)

      // Progress bar animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + 2 // 2% every 40ms = 2 seconds total
        })
      }, 40)

      // Auto close after 2 seconds
      const timer = setTimeout(() => {
        setShow(false)
        setTimeout(onClose, 300)
      }, 2000)

      return () => {
        clearTimeout(timer)
        clearInterval(progressInterval)
      }
    }
  }, [isOpen, onClose])

  const handleViewBag = () => {
    onClose()
    toggleCart()
  }

  const handleCheckout = () => {
    onClose()
    if (onCheckout) {
      onCheckout()
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black text-white z-50 w-80 transition-all duration-300 ${show ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      >
        {/* Progress bar */}
        <div className="w-full h-0.5 bg-gray-800 overflow-hidden">
          <div className="h-full bg-white transition-all duration-75 ease-linear" style={{ width: `${progress}%` }} />
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold tracking-wider">ADDED</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-gray-800">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-2 mb-6">
            <h3 className="font-bold tracking-wide">{productName}</h3>
            <p className="text-sm font-medium">
              {productColor} / {productSize}
            </p>
            <p className="font-bold">${productPrice}</p>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleViewBag}
              className="w-full text-white border border-white hover:bg-white hover:text-black bg-transparent font-semibold py-2 px-4 transition-colors duration-200"
            >
              VIEW BAG
            </button>
            <button
              onClick={handleCheckout}
              className="w-full bg-white text-black hover:bg-gray-200 font-semibold py-2 px-4 transition-colors duration-200"
            >
              CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
