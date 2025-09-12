"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, MessageCircle, Mail } from "lucide-react"
import Image from "next/image"
import { getImageUrl } from "@/lib/utils"
import type { CartItem } from "@/lib/types"
import { useCartStore } from "@/lib/store"
import { generateWhatsAppUrl, generateEmailUrl } from "@/lib/config"
// Import the stats functions at the top
import { addCheckout } from "@/lib/stats"

interface CheckoutDialogProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  total: number
}

export default function CheckoutDialog({ isOpen, onClose, items, total }: CheckoutDialogProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)

  // Add this inside the component
  const { clearCart } = useCartStore()

  // Animation logic similar to shopping bag
  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setTimeout(() => setIsAnimating(true), 50)
    } else {
      setIsAnimating(false)
      setTimeout(() => setIsVisible(false), 300)
    }
  }, [isOpen])

  const generateProductMessage = (item: CartItem) => {
    const subtotal = item.price * item.quantity
    // Use the productUrl from the item if available, otherwise create a generic link
    const productUrl = item.productUrl || `${window.location.origin}/shop/all`

    return `I want to order "${item.name}"
Quantity: ${item.quantity}
Color: ${item.color}
Size: ${item.size}
Amount to pay: ${subtotal.toFixed(2)} LEK
Product link: ${productUrl}`
  }

  const generateFullMessage = () => {
    const greeting = "Hello Players!"
    const productMessages = items.map(generateProductMessage).join("\n\n---\n\n")
    return `${greeting}\n\n${productMessages}\n\n---\n\nTotal Amount: ${total.toFixed(2)} LEK`
  }

  // Update the handleWhatsApp function
  const handleWhatsApp = () => {
    const message = generateFullMessage()
    const whatsappUrl = generateWhatsAppUrl(message)

    // Track the checkout in stats
    addCheckout(items, total)

    // Immediately hide checkout dialog and show thank you
    setIsAnimating(false)
    setShowThankYou(true)
    clearCart()

    // Open WhatsApp
    window.open(whatsappUrl, "_blank")
  }

  // Update the handleEmail function
  const handleEmail = () => {
    const message = generateFullMessage()
    const emailUrl = generateEmailUrl("Order Request - The Players Club", message)

    // Track the checkout in stats
    addCheckout(items, total)

    // Immediately hide checkout dialog and show thank you
    setIsAnimating(false)
    setShowThankYou(true)
    clearCart()

    // Open email
    window.open(emailUrl, "_blank")
  }

  const handleContinueShopping = () => {
    // Close thank you first, then close main dialog after a brief delay
    setShowThankYou(false)
    setTimeout(() => {
      onClose()
      window.location.href = "/shop/all"
    }, 100)
  }

  const handleThankYouClose = () => {
    // Close thank you first, then close main dialog
    setShowThankYou(false)
    setTimeout(() => {
      onClose()
    }, 100)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !showThankYou) {
      onClose()
    }
  }

  if (!isVisible) return null

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black z-50 transition-opacity duration-300 ease-out ${
          isAnimating ? "opacity-50" : "opacity-0"
        }`}
        onClick={handleBackdropClick}
      />

      {/* Thank You Dialog - Shows on top */}
      {showThankYou && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white border border-black w-full max-w-xs sm:max-w-sm transition-all duration-300 ease-out">
            <div className="flex flex-col items-center text-center p-6 sm:p-8">
              {/* Logo */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 mb-6">
                <Image
                  src="/images/logo.svg"
                  alt="The Players Club"
                  width={80}
                  height={80}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>

              {/* Thank You Message */}
              <h2 className="text-lg sm:text-xl font-bold tracking-wider mb-6">THANK YOU FOR ORDERING</h2>

              {/* Continue Shopping Button */}
              <button
                onClick={handleContinueShopping}
                className="w-full bg-black text-white hover:bg-gray-800 font-semibold tracking-wider py-3 px-4 transition-colors duration-200"
              >
                CONTINUE SHOPPING
              </button>

              {/* Small close option */}
              <button
                onClick={handleThankYouClose}
                className="mt-4 text-xs text-gray-500 hover:text-gray-700 tracking-wider"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Checkout Dialog - Completely hidden when thank you is showing */}
      {!showThankYou && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div
            className={`bg-white w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-hidden transition-all duration-300 ease-out ${
              isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            style={{ display: showThankYou ? "none" : "block" }}
          >
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Header */}
              <div className="flex justify-between items-center p-4 sm:p-6 border-b flex-shrink-0">
                <h2 className="text-lg sm:text-xl font-bold tracking-wider">CHECKING OUT</h2>
                <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-100">
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>

              {/* Order Summary - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <h3 className="text-sm font-semibold mb-3 tracking-wider">ORDER SUMMARY</h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex space-x-3 p-3 bg-gray-50">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 flex-shrink-0">
                        <Image
                          src={getImageUrl(item.image) || "/placeholder.png"}
                          alt={item.name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.png"
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-gray-600">
                          {item.color} / {item.size} × {item.quantity}
                        </p>
                        <p className="text-sm font-bold">{(item.price * item.quantity).toFixed(2)} LEK</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center font-bold">
                    <span className="tracking-wider">TOTAL</span>
                    <span>{total.toFixed(2)} LEK</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Side by side, smaller */}
              <div className="p-4 sm:p-6 border-t flex-shrink-0">
                <p className="text-xs text-gray-600 mb-3 tracking-wider">ORDER VIA:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleWhatsApp}
                    className="bg-black text-white hover:bg-gray-800 font-semibold text-xs sm:text-sm py-2 px-3 flex items-center justify-center space-x-1.5 transition-colors duration-200"
                  >
                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>WHATSAPP</span>
                  </button>

                  <button
                    onClick={handleEmail}
                    className="border border-black text-black hover:bg-black hover:text-white font-semibold text-xs sm:text-sm py-2 px-3 flex items-center justify-center space-x-1.5 bg-transparent transition-colors duration-200"
                  >
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>EMAIL</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
