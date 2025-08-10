export const api = {
  async getProducts() {
    const response = await fetch("/api/products", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ API: Failed to fetch products:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
      })
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`)
    }

    const products = await response.json()
    return products
  },

  async createProduct(productData: any) {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error("❌ API: Failed to create product:", {
        status: response.status,
        statusText: response.statusText,
        responseData,
        originalData: productData,
      })

      // Log validation errors if available
      if (responseData.validationErrors) {
        console.error("❌ API: Validation errors:", responseData.validationErrors)
      }

      throw new Error(responseData.error || `Failed to create product: ${response.status}`)
    }

    return responseData
  },

  async updateProduct(id: string, productData: any) {
    const response = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error("❌ API: Failed to update product:", {
        status: response.status,
        statusText: response.statusText,
        responseData,
        originalData: productData,
      })
      throw new Error(responseData.error || `Failed to update product: ${response.status}`)
    }

    return responseData
  },

  async deleteProduct(id: string) {
    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ API: Failed to delete product:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
      })
      throw new Error(errorData.error || `Failed to delete product: ${response.status}`)
    }

    return { success: true }
  },

  async getStats() {
    const response = await fetch("/api/stats", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ API: Failed to fetch stats:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
      })
      throw new Error(`Failed to fetch stats: ${response.status} ${response.statusText}`)
    }

    const stats = await response.json()
    return stats
  },

  async getProductBySlug(slug: string) {
    const response = await fetch(`/api/products/slug/${slug}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ API: Failed to fetch product by slug:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
        slug,
      })
      throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`)
    }

    const product = await response.json()
    return product
  },

  async getProductsByCategory(category: string) {
    const response = await fetch(`/api/products/category/${category}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ API: Failed to fetch products by category:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
        category,
      })
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`)
    }

    const products = await response.json()
    return products
  },

  async searchProducts(query: string) {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ API: Failed to search products:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
        query,
      })
      throw new Error(`Failed to search products: ${response.status} ${response.statusText}`)
    }

    const products = await response.json()
    return products
  },
}
