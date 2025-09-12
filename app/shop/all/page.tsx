"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import ProductGrid from "@/components/product-grid"
import type { Product } from "@/lib/types"
import LoadingSpinner from "@/components/loading-spinner"

export default function AllProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        setLoading(true)
        setError("")

        const allProducts = await api.getProducts()
        console.log(`📦 Found ${allProducts.length} total products`)
        setProducts(allProducts)
      } catch (error) {
        console.error("Error loading all products:", error)
        setError("Failed to load products. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadAllProducts()
  }, [])

   if (loading) {
    return (
      <div className="px-6 lg:px-8 py-8">
        <div className="min-h-[50vh] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 lg:px-8 py-8 pb-32 sm:pb-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-wider">ALL PRODUCTS</h1>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No products available yet.</p>
          <p className="text-gray-400 text-sm">Products will appear here once they are added.</p>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  )
}
