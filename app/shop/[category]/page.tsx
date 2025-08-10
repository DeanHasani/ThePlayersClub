"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import ProductGrid from "@/components/product-grid"
import { notFound } from "next/navigation"
import type { Product } from "@/lib/types"

interface CategoryPageProps {
  params: {
    category: string
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { category } = params
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  // Valid categories (excluding 'all' since it has its own page)
  const validCategories = ["tshirts", "hoodies", "pants"]

  useEffect(() => {
    // Redirect to /shop/all if category is 'all'
    if (category === "all") {
      router.push("/shop/all")
      return
    }

    if (!validCategories.includes(category)) {
      notFound()
      return
    }

    const loadCategoryProducts = async () => {
      try {
        setLoading(true)
        setError("")

        // Use the category-specific API endpoint for better performance
        const categoryProducts = await api.getProductsByCategory(category)

        console.log(`📦 Found ${categoryProducts.length} products in ${category} category`)
        setProducts(categoryProducts)
      } catch (error) {
        console.error("Error loading category products:", error)
        setError("Failed to load products. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadCategoryProducts()
  }, [category, router])

  // Handle redirect case
  if (category === "all") {
    return (
      <div className="px-6 lg:px-8 py-8">
        <div className="text-center">
          <p>Redirecting to all products...</p>
        </div>
      </div>
    )
  }

  if (!validCategories.includes(category)) {
    notFound()
  }

  const categoryNames = {
    tshirts: "T-SHIRTS",
    hoodies: "HOODIES",
    pants: "PANTS",
  }

  if (loading) {
    return (
      <div className="px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p>Loading {categoryNames[category as keyof typeof categoryNames]}...</p>
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
        <h1 className="text-2xl font-bold tracking-wider">{categoryNames[category as keyof typeof categoryNames]}</h1>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            No products found in {categoryNames[category as keyof typeof categoryNames]} category.
          </p>
          <p className="text-gray-400 text-sm">Products will appear here once they are added to this category.</p>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  )
}
