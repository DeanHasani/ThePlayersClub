"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { getProductImageUrl } from "@/lib/utils"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  const imageUrl = getProductImageUrl(product)

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  return (
    <Link href={`/shop/${product.category}/${product.slug}`} className="group">
      <div
        className="aspect-[4/5.5] bg-gray-100 overflow-hidden mb-2 sm:mb-3 relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 sm:h-6 sm:w-6 border-b-2 border-gray-400"></div>
          </div>
        )}

        <Image
          src={imageError ? "/placeholder.png" : imageUrl || "/placeholder.png"}
          alt={product.name}
          width={400}
          height={550}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          priority={false}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />

        {/* Sizes overlay on hover - only show on desktop */}
        {isHovered && product.availableSizes && product.availableSizes.length > 0 && (
          <div className="hidden sm:flex absolute inset-0 bg-black bg-opacity-40 items-center justify-center transition-opacity duration-300">
            <div className="text-white text-sm font-medium tracking-wider">{product.availableSizes.join("  ")}</div>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-xs sm:text-sm font-medium tracking-wide line-clamp-2">{product.name}</h3>
        {!product.inStock && <p className="text-xs text-red-500 font-medium">SOLD OUT</p>}
        <p className="text-xs sm:text-sm font-semibold">${product.price}</p>

        {/* Show sizes on mobile below the product info */}
        {product.availableSizes && product.availableSizes.length > 0 && (
          <p className="text-xs text-gray-500 sm:hidden">{product.availableSizes.join("  ")}</p>
        )}
      </div>
    </Link>
  )
}
