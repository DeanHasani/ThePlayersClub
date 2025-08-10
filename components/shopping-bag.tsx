"use client"

import { useEffect, useState } from "react"
import { useCartStore } from "@/lib/store"
import { getImageUrl } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { X, Plus, Minus } from "lucide-react"
import Image from "next/image"
import CheckoutDialog from "./checkout-dialog"

export default function ShoppingBag() {
  const { items, isOpen, total, toggleCart, updateQuantity, removeItem } = useCartStore()
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setTimeout(() => setIsAnimating(true), 50)
    } else {
      setIsAnimating(false)
      setTimeout(() => setIsVisible(false), 300)
    }
  }, [isOpen])

  const handleCheckout = () => {
    setShowCheckoutDialog(true)
  }

  const handleCheckoutDialogClose = () => {
    setShowCheckoutDialog(false)
  }

  if (!isVisible) return null

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black z-50 transition-opacity duration-300 ease-out ${
          isAnimating ? "opacity-50" : "opacity-0"
        }`}
        onClick={toggleCart}
      />

      {/* Sliding panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 transform transition-transform duration-300 ease-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold tracking-wider">SHOPPING BAG</h2>
            <Button variant="ghost" size="sm" onClick={toggleCart}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <p className="text-center text-gray-500 mt-8 font-medium">Your bag is empty</p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex space-x-4">
                    <div className="w-20 h-20 bg-gray-100">
                      <Image
                        src={getImageUrl(item.image) || "/placeholder.png"}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.png"
                        }}
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <p className="text-sm text-gray-600 font-medium">
                        {item.color} / {item.size}
                      </p>
                      <p className="font-bold">${item.price}</p>

                      <div className="flex items-center space-x-2 mt-2">
                        <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="text-xs text-gray-600 font-medium">
                <p>HAND TO HAND SHIPPING, NO TAXES INCLUDED</p>
                <p className="mt-1">FOR MORE INFORMATION ASK ON WHATSAPP</p>
              </div>

              <div className="flex justify-between items-center font-semibold text-sm">
                <span>SUBTOTAL</span>
                <span>${total}</span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={toggleCart}
                  className="w-full text-black border border-black hover:bg-black hover:text-white bg-transparent font-semibold py-2 px-4 transition-colors duration-200"
                >
                  CONTINUE SHOPPING
                </button>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-black text-white hover:bg-gray-800 font-semibold py-2 px-4 transition-colors duration-200"
                >
                  CHECKOUT
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Dialog */}
      <CheckoutDialog isOpen={showCheckoutDialog} onClose={handleCheckoutDialogClose} items={items} total={total} />
    </>
  )
}
