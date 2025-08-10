"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import ProductCard from "@/components/product-card"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Product } from "@/lib/types"

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError("")
        const data = await api.getProducts()
        setProducts(data)
      } catch (error) {
        console.error("Error loading products:", error)
        setError("Failed to load products. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-sm sm:text-base">Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Filter products by category and get first 4 of each
  const tshirts = products.filter((p) => p.category === "tshirts").slice(0, 4)
  const hoodies = products.filter((p) => p.category === "hoodies").slice(0, 4)
  const pants = products.filter((p) => p.category === "pants").slice(0, 4)

  return (
    <div className="space-y-12 pb-32 sm:pb-20">
      {/* T-Shirts Section */}
      <section className="space-y-8">
        {/* Hero Image with Text Overlay - Full width, extends to navbar */}
        <Link href="/shop/tshirts" className="block relative group -mt-14">
          <div className="relative h-[46rem] sm:h-[54rem] lg:h-[62rem] bg-gray-200 overflow-hidden">
            {/* Replace this placeholder with your T-shirts background image */}
            <Image
              src="/images/shirtheader.jpg"
              alt="T-Shirts Collection"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Text Overlay - You can position this text wherever you want */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-wider drop-shadow-lg">
                  {/* Replace this text with your desired T-shirts text */}
                  T-SHIRTS COLLECTION
                </h2>
              </div>
            </div>
          </div>
        </Link>

        {/* Products Grid */}
        <div className="px-2 sm:px-4">
          {tshirts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {tshirts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No T-shirts available yet.</p>
            </div>
          )}

          {/* View All Link - Below products */}
          <div className="flex justify-end mt-4">
            <Link href="/shop/tshirts" className="flex items-center group">
              <span className="text-xs font-medium tracking-wider text-black group-hover:text-gray-600 transition-colors mr-1">
                VIEW ALL
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-black group-hover:text-gray-600 transition-colors group-hover:translate-x-1 duration-200" />
            </Link>
          </div>
        </div>
      </section>

      {/* Hoodies Section */}
      <section className="space-y-6">
        {/* Hero Image with Text Overlay - Full width */}
        <Link href="/shop/hoodies" className="block relative group">
          <div className="relative h-[46rem] sm:h-[54rem] lg:h-[62rem] bg-gray-200 overflow-hidden">
            {/* Replace this placeholder with your Hoodies background image */}
            <Image
              src="/images/hoodieheader.jpg"
              alt="Hoodies Collection"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Text Overlay - You can position this text wherever you want */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-wider drop-shadow-lg">
                  {/* Replace this text with your desired Hoodies text */}
                  HOODIES COLLECTION
                </h2>
              </div>
            </div>
          </div>
        </Link>

        {/* Products Grid */}
        <div className="px-2 sm:px-4">
          {hoodies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {hoodies.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No hoodies available yet.</p>
            </div>
          )}

          {/* View All Link - Below products */}
          <div className="flex justify-end mt-4">
            <Link href="/shop/hoodies" className="flex items-center group">
              <span className="text-xs font-medium tracking-wider text-black group-hover:text-gray-600 transition-colors mr-1">
                VIEW ALL
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-black group-hover:text-gray-600 transition-colors group-hover:translate-x-1 duration-200" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pants Section */}
      <section className="space-y-6">
        {/* Hero Image with Text Overlay - Full width */}
        <Link href="/shop/pants" className="block relative group">
          <div className="relative h-[46rem] sm:h-[54rem] lg:h-[62rem] bg-gray-200 overflow-hidden">
            {/* Replace this placeholder with your Pants background image */}
            <Image
              src="/images/pantsheader.jpg"
              alt="Pants Collection"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Text Overlay - You can position this text wherever you want */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-wider drop-shadow-lg">
                  {/* Replace this text with your desired Pants text */}
                  PANTS COLLECTION
                </h2>
              </div>
            </div>
          </div>
        </Link>

        {/* Products Grid */}
        <div className="px-2 sm:px-.env.local4">
          {pants.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {pants.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No pants available yet.</p>
            </div>
          )}

          {/* View All Link - Below products */}
          <div className="flex justify-end mt-4">
            <Link href="/shop/pants" className="flex items-center group">
              <span className="text-xs font-medium tracking-wider text-black group-hover:text-gray-600 transition-colors mr-1">
                VIEW ALL
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-black group-hover:text-gray-600 transition-colors group-hover:translate-x-1 duration-200" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
