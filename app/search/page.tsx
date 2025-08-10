"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { api } from "@/lib/api"
import ProductGrid from "@/components/product-grid"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import Link from "next/link"
import type { Product } from "@/lib/types"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (query.trim()) {
      performSearch(query)
    } else {
      setProducts([])
    }
  }, [query])

  const performSearch = async (searchQuery: string) => {
    try {
      setLoading(true)
      setError("")

      const results = await api.searchProducts(searchQuery)
      setProducts(results)

      console.log(`🔍 Search completed: "${searchQuery}" returned ${results.length} results`)
    } catch (error) {
      console.error("Search error:", error)
      setError("Failed to search products. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p>Searching for "{query}"...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={() => performSearch(query)}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 pb-32 sm:pb-8">
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Search className="h-5 w-5 text-gray-600" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-wider">SEARCH RESULTS</h1>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-black">
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </Link>
        </div>

        {query && (
          <div className="rounded-lg p-4">
            <p className="text-sm text-gray-600">
              Results for: <span className="font-semibold text-black">"{query}"</span>
            </p>
          </div>
        )}
      </div>

      {/* Search Results */}
      {!query.trim() ? (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">Start typing to search</p>
          <p className="text-gray-400 text-sm">
            Search by product name, category, or combination (e.g., "hoodie black", "t-shirt", "joker")
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No products found</p>
          <p className="text-gray-400 text-sm mb-6">Try searching for:</p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Link href="/search?q=tshirts">
              <Button variant="outline" size="sm" className="bg-transparent">
                T-Shirts
              </Button>
            </Link>
            <Link href="/search?q=hoodies">
              <Button variant="outline" size="sm" className="bg-transparent">
                Hoodies
              </Button>
            </Link>
            <Link href="/search?q=pants">
              <Button variant="outline" size="sm" className="bg-transparent">
                Pants
              </Button>
            </Link>
            <Link href="/shop/all">
              <Button variant="outline" size="sm" className="bg-transparent">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  )
}
