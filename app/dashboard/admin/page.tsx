"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth"
import { api } from "@/lib/api"
import { getProductImageUrl } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { X, Upload, AlertCircle, Edit, Trash2, Database, RefreshCw, ImageIcon, LogOut, CheckCircle } from "lucide-react"
import Image from "next/image"
import type { Product, AdminStats } from "@/lib/types"
import {
  getStats,
  getMostAddedToBagProduct,
  getMostCheckoutProduct,
  getRecentOrders,
  resetStats,
  subtractFromStats,
} from "@/lib/stats"

interface ColorWithImages {
  name: string
  value: string
  images: {
    front: string
    back: string
    optional: string[]
  }
  frontFile?: File
  backFile?: File
  optionalFiles?: File[]
}

interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info"
  duration?: number
}

export default function AdminDashboard() {
  const { isAuthenticated, isLoggingOut, logout, setLoggingOut } = useAuthStore()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("stats")
  const [dbTestResult, setDbTestResult] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([])

  // Color modal state
  const [showColorModal, setShowColorModal] = useState(false)
  const [colorName, setColorName] = useState("")

  // Confirmation modal states
  const [showResetStatsModal, setShowResetStatsModal] = useState(false)
  const [showDeleteOrderModal, setShowDeleteOrderModal] = useState(false)
  const [showDeleteAllOrdersModal, setShowDeleteAllOrdersModal] = useState(false)
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    details: "",
    availableSizes: [] as string[],
    colors: [] as ColorWithImages[],
  })

  // Subtract functionality state
  const [subtractRevenue, setSubtractRevenue] = useState("")
  const [subtractCheckouts, setSubtractCheckouts] = useState("")
  const [showSubtractRevenue, setShowSubtractRevenue] = useState(false)
  const [showSubtractCheckouts, setShowSubtractCheckouts] = useState(false)

  // Toast functions
  const showToast = (message: string, type: "success" | "error" | "info" = "info", duration = 4000) => {
    const id = Date.now().toString()
    const newToast: Toast = { id, message, type, duration }
    setToasts((prev) => [...prev, newToast])

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  // Track component mount state
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Handle authentication redirect
  useEffect(() => {
    if (!mounted) return

    if (!isAuthenticated && !isLoggingOut) {
      router.replace("/dashboard")
      return
    }

    if (isAuthenticated && !isLoggingOut) {
      loadData()
      testDatabaseConnection()
    }
  }, [isAuthenticated, isLoggingOut, mounted, router])

  const testDatabaseConnection = useCallback(async () => {
    if (!mounted) return

    try {
      const response = await fetch("/api/test-db")
      const result = await response.json()
      if (mounted) {
        setDbTestResult(result)
        console.log("🧪 Database test result:", result)
      }
    } catch (error) {
      console.error("❌ Database test failed:", error)
      if (mounted) {
        setDbTestResult({ success: false, error: "Failed to test database connection" })
      }
    }
  }, [mounted])

  const loadData = useCallback(async () => {
    if (!mounted) return

    try {
      console.log("🔄 Loading admin data...")
      if (mounted) setError("")

      const [productsData, statsData] = await Promise.all([
        api.getProducts().catch((err) => {
          console.error("Failed to load products:", err)
          throw new Error("Failed to load products")
        }),
        api.getStats().catch((err) => {
          console.error("Failed to load stats:", err)
          throw new Error("Failed to load statistics")
        }),
      ])

      if (mounted) {
        setProducts(productsData)

        // Load local stats and combine with API stats
        const localStats = getStats()
        const mostAddedToBag = await getMostAddedToBagProduct(productsData)
        const mostCheckout = await getMostCheckoutProduct(productsData)
        const orders = getRecentOrders()

        const combinedStats: AdminStats = {
          totalProducts: productsData.length,
          totalRevenue: localStats.totalRevenue,
          totalCheckouts: localStats.totalCheckouts,
          mostAddedToBag,
          mostCheckout,
        }

        setStats(combinedStats)
        setRecentOrders(orders)
        console.log("✅ Admin data loaded successfully")
      }
    } catch (error) {
      console.error("❌ Error loading data:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      if (mounted) {
        setError(`Failed to load data: ${errorMessage}. Please check your database connection.`)
      }
    }
  }, [mounted])

  // Stats management functions
  const handleResetStats = () => {
    setShowResetStatsModal(true)
  }

  const confirmResetStats = () => {
    resetStats()
    showToast("Statistics reset successfully!", "success")
    setShowResetStatsModal(false)
    loadData()
  }

  const handleSubtractRevenue = () => {
    const amount = Number.parseFloat(subtractRevenue)
    if (isNaN(amount) || amount <= 0) {
      showToast("Please enter a valid amount to subtract", "error")
      return
    }
    subtractFromStats(amount, 0)
    showToast(`${amount.toFixed(2)} ALL subtracted from revenue`, "success")
    setSubtractRevenue("")
    setShowSubtractRevenue(false)
    loadData()
  }

  const handleSubtractCheckouts = () => {
    const amount = Number.parseInt(subtractCheckouts)
    if (isNaN(amount) || amount <= 0) {
      showToast("Please enter a valid number to subtract", "error")
      return
    }
    subtractFromStats(0, amount)
    showToast(`${amount} checkouts subtracted`, "success")
    setSubtractCheckouts("")
    setShowSubtractCheckouts(false)
    loadData()
  }

  const handleDeleteOrder = (orderIndex: number) => {
    setOrderToDelete(orderIndex)
    setShowDeleteOrderModal(true)
  }

  const confirmDeleteOrder = () => {
    if (orderToDelete !== null) {
      const updatedOrders = recentOrders.filter((_, index) => index !== orderToDelete)
      if (typeof window !== "undefined") {
        localStorage.setItem("players-club-orders", JSON.stringify(updatedOrders))
      }
      setRecentOrders(updatedOrders)
      showToast("Order deleted successfully!", "success")
    }
    setShowDeleteOrderModal(false)
    setOrderToDelete(null)
  }

  const handleDeleteAllOrders = () => {
    setShowDeleteAllOrdersModal(true)
  }

  const confirmDeleteAllOrders = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("players-club-orders")
    }
    setRecentOrders([])
    showToast("All orders deleted successfully!", "success")
    setShowDeleteAllOrdersModal(false)
  }

  // Don't render anything if not authenticated or during logout
  if (!mounted || !isAuthenticated || isLoggingOut) {
    return null
  }

  const handleLogout = () => {
    try {
      setLoggingOut(true)
      window.location.href = "/"
    } catch (error) {
      console.error("Error during logout:", error)
      window.location.href = "/"
    }
  }

  const resetForm = () => {
    if (!mounted) return

    setNewProduct({
      name: "",
      price: "",
      category: "",
      description: "",
      details: "",
      availableSizes: [],
      colors: [],
    })
    setEditingProduct(null)
    setError("")
  }

  const addColor = () => {
    if (!mounted) return
    setColorName("")
    setShowColorModal(true)
  }

  const handleColorSave = () => {
    if (colorName && colorName.trim()) {
      const newColor: ColorWithImages = {
        name: colorName.trim(),
        value: colorName.toLowerCase().replace(/\s+/g, "-"),
        images: {
          front: "/placeholder.png",
          back: "/placeholder.png",
          optional: [],
        },
      }
      setNewProduct({
        ...newProduct,
        colors: [...newProduct.colors, newColor],
      })
      setShowColorModal(false)
      setColorName("")
      showToast("Color added successfully!", "success")
    } else {
      showToast("Color name is required", "error")
    }
  }

  const removeColor = (index: number) => {
    if (!mounted) return

    setNewProduct({
      ...newProduct,
      colors: newProduct.colors.filter((_, i) => i !== index),
    })
  }

  const handleImageUpload = async (
    colorIndex: number,
    imageType: "front" | "back" | "optional",
    file: File,
    optionalIndex?: number,
  ) => {
    if (!file || !mounted) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("files", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const result = await response.json()
      const imageUrl = result.files[0]

      if (mounted) {
        const updatedColors = [...newProduct.colors]

        if (imageType === "optional" && optionalIndex !== undefined) {
          // Handle optional images array
          if (!updatedColors[colorIndex].images.optional) {
            updatedColors[colorIndex].images.optional = []
          }
          updatedColors[colorIndex].images.optional[optionalIndex] = imageUrl
        } else {
          // Handle front/back images
          updatedColors[colorIndex].images[imageType] = imageUrl
        }

        setNewProduct({
          ...newProduct,
          colors: updatedColors,
        })

        showToast(`${imageType} image uploaded successfully!`, "success")
        console.log(`✅ ${imageType} image uploaded for color ${newProduct.colors[colorIndex].name}:`, imageUrl)
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      if (mounted) {
        showToast("Failed to upload image. Please try again.", "error")
      }
    } finally {
      if (mounted) {
        setUploading(false)
      }
    }
  }

  const addOptionalImage = (colorIndex: number) => {
    if (!mounted) return

    const updatedColors = [...newProduct.colors]
    if (!updatedColors[colorIndex].images.optional) {
      updatedColors[colorIndex].images.optional = []
    }
    updatedColors[colorIndex].images.optional.push("/placeholder.png")

    setNewProduct({
      ...newProduct,
      colors: updatedColors,
    })
  }

  const removeOptionalImage = (colorIndex: number, optionalIndex: number) => {
    if (!mounted) return

    const updatedColors = [...newProduct.colors]
    updatedColors[colorIndex].images.optional.splice(optionalIndex, 1)

    setNewProduct({
      ...newProduct,
      colors: updatedColors,
    })
  }

  const validateForm = () => {
    const errors = []

    console.log("🔍 Validating form data:", {
      name: newProduct.name,
      price: newProduct.price,
      category: newProduct.category,
      description: newProduct.description,
      details: newProduct.details,
      availableSizes: newProduct.availableSizes,
      colors: newProduct.colors,
    })

    if (!newProduct.name.trim()) errors.push("Product name is required")
    if (!newProduct.price || Number.parseFloat(newProduct.price) <= 0) errors.push("Valid price is required")
    if (!newProduct.category) errors.push("Category is required")
    if (!newProduct.description.trim()) errors.push("Description is required")
    if (!newProduct.details.trim()) errors.push("Product details are required")
    if (newProduct.availableSizes.length === 0) errors.push("At least one available size is required")
    if (newProduct.colors.length === 0) errors.push("At least one color is required")

    // Check if all colors have front and back images
    const colorsWithoutImages = newProduct.colors.filter(
      (color) =>
        !color.images.front ||
        color.images.front === "/placeholder.png" ||
        !color.images.back ||
        color.images.back === "/placeholder.png",
    )
    if (colorsWithoutImages.length > 0) {
      errors.push(`Front and back images are required for colors: ${colorsWithoutImages.map((c) => c.name).join(", ")}`)
    }

    console.log("🔍 Validation errors found:", errors)
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mounted) return

    console.log("🚀 Form submission started")
    setLoading(true)
    setError("")

    try {
      const validationErrors = validateForm()
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(", "))
      }

      // Process details - ensure it's an array of non-empty strings
      const detailsArray = newProduct.details
        .split("\n")
        .map((d) => d.trim())
        .filter((d) => d.length > 0)

      if (detailsArray.length === 0) {
        throw new Error("Product details cannot be empty")
      }

      const productData = {
        name: newProduct.name.trim(),
        price: Number.parseFloat(newProduct.price),
        category: newProduct.category as "tshirts" | "hoodies" | "pants",
        description: newProduct.description.trim(),
        details: detailsArray,
        sizes: newProduct.availableSizes,
        availableSizes: newProduct.availableSizes,
        colors: newProduct.colors.map((color) => ({
          name: color.name,
          value: color.value,
          images: {
            front: color.images.front,
            back: color.images.back,
            optional: color.images.optional.filter((img) => img && img !== "/placeholder.png"),
          },
        })),
        images: newProduct.colors.map((color) => color.images.front),
        inStock: true,
      }

      console.log("📤 Final product data being submitted:", JSON.stringify(productData, null, 2))

      // Additional validation before sending
      if (!productData.name || productData.name.length === 0) {
        throw new Error("Product name is required")
      }
      if (!productData.price || productData.price <= 0) {
        throw new Error("Valid price is required")
      }
      if (!productData.category) {
        throw new Error("Category is required")
      }
      if (!productData.description || productData.description.length === 0) {
        throw new Error("Description is required")
      }
      if (!productData.details || productData.details.length === 0) {
        throw new Error("Product details are required")
      }
      if (!productData.availableSizes || productData.availableSizes.length === 0) {
        throw new Error("At least one available size is required")
      }
      if (!productData.colors || productData.colors.length === 0) {
        throw new Error("At least one color is required")
      }

      // Validate each color has required images
      for (const color of productData.colors) {
        if (!color.images.front || color.images.front === "/placeholder.png") {
          throw new Error(`Color "${color.name}" is missing front image`)
        }
        if (!color.images.back || color.images.back === "/placeholder.png") {
          throw new Error(`Color "${color.name}" is missing back image`)
        }
      }

      if (editingProduct) {
        const productId = editingProduct._id || editingProduct.id
        if (!productId) {
          throw new Error("Product ID is missing for update")
        }
        await api.updateProduct(productId, productData)
        if (mounted) showToast("Product updated successfully!", "success")
      } else {
        await api.createProduct(productData as any)
        if (mounted) showToast("Product added successfully!", "success")
      }

      if (mounted) {
        resetForm()
        setActiveTab("products")
        await loadData()
      }
    } catch (error) {
      console.error("❌ Error saving product:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      if (mounted) {
        setError(`Error saving product: ${errorMessage}`)
        showToast(`Error saving product: ${errorMessage}`, "error")
      }
    } finally {
      if (mounted) {
        setLoading(false)
      }
    }
  }

  const handleEdit = (product: Product) => {
    if (!mounted) return

    console.log("🔄 Editing product:", product)

    setEditingProduct(product)
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      description: product.description,
      details: product.details.join("\n"),
      availableSizes: product.availableSizes,
      colors: product.colors.map((color) => ({
        name: color.name,
        value: color.value,
        images: {
          front: color.images?.front || "/placeholder.png",
          back: color.images?.back || "/placeholder.png",
          optional: color.images?.optional || [],
        },
      })),
    })

    setActiveTab("add-product")
    setError("")
  }

  const handleDelete = async (product: Product) => {
    if (!mounted) return

    const productId = product._id || product.id

    console.log("🗑️ Attempting to delete product:", {
      productId,
      productName: product.name,
      hasId: !!productId,
    })

    if (!productId) {
      showToast("Error: Product ID is missing", "error")
      return
    }

    setProductToDelete(product)
    setShowDeleteProductModal(true)
  }

  const confirmDeleteProduct = async () => {
    if (!productToDelete || !mounted) return

    const productId = productToDelete._id || productToDelete.id
    if (!productId) {
      showToast("Error: Product ID is missing", "error")
      setShowDeleteProductModal(false)
      setProductToDelete(null)
      return
    }

    setDeleteLoading(productId)
    setError("")

    try {
      console.log("🗑️ Calling API to delete product:", productId)
      await api.deleteProduct(productId)
      if (mounted) {
        showToast("Product deleted successfully!", "success")
        await loadData()
      }
    } catch (error) {
      console.error("❌ Error deleting product:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      if (mounted) {
        setError(`Error deleting product "${productToDelete.name}": ${errorMessage}`)
        showToast(`Error deleting product: ${errorMessage}`, "error")
      }
    } finally {
      if (mounted) {
        setDeleteLoading(null)
      }
    }

    setShowDeleteProductModal(false)
    setProductToDelete(null)
  }

  // Helper function to check if color has valid images
  const isColorValid = (color: ColorWithImages) => {
    return color.images.front !== "/placeholder.png" && color.images.back !== "/placeholder.png"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
          <div className="pointer-events-auto space-y-2">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={`bg-white border-2 shadow-lg p-4 min-w-80 max-w-sm transition-all duration-300 ease-out ${
                  toast.type === "success"
                    ? "border-green-600"
                    : toast.type === "error"
                      ? "border-red-600"
                      : "border-blue-600"
                }`}
              >
                <div className="flex items-start space-x-3">
                  {toast.type === "success" && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {toast.type === "error" && <AlertCircle className="h-5 w-5 text-red-600" />}
                  {toast.type === "info" && <AlertCircle className="h-5 w-5 text-blue-600" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{toast.message}</p>
                  </div>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Color Modal */}
      {showColorModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowColorModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white border-2 border-black w-full max-w-sm">
              <div className="flex justify-between items-center p-6">
                <h2 className="text-xl font-bold tracking-wider">ADD COLOR</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowColorModal(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="colorName" className="text-sm font-bold tracking-wider">
                      COLOR NAME
                    </Label>
                    <Input
                      id="colorName"
                      value={colorName}
                      onChange={(e) => setColorName(e.target.value)}
                      placeholder="e.g., Black, White, Red"
                      className="border-2 border-gray-300 focus:border-black"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleColorSave()
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex space-x-3">
                  <Button
                    onClick={handleColorSave}
                    className="flex-1 bg-black text-white hover:bg-gray-800 font-bold tracking-wider"
                  >
                    ADD COLOR
                  </Button>
                  <Button
                    onClick={() => setShowColorModal(false)}
                    variant="outline"
                    className="flex-1 border-2 border-black text-black hover:bg-black hover:text-white font-bold tracking-wider bg-transparent"
                  >
                    CANCEL
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Reset Stats Confirmation Modal */}
      {showResetStatsModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowResetStatsModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white border-2 border-red-600 w-full max-w-sm">
              <div className="flex justify-between items-center p-4">
                <h2 className="text-lg font-bold tracking-wider text-red-600">RESET STATISTICS</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowResetStatsModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700">
                  Are you sure you want to reset all statistics? This will set revenue and checkouts back to zero and
                  cannot be undone.
                </p>
              </div>
              <div className="p-4">
                <div className="flex space-x-3">
                  <Button
                    onClick={confirmResetStats}
                    className="flex-1 bg-red-600 text-white hover:bg-red-700 font-bold tracking-wider"
                  >
                    RESET
                  </Button>
                  <Button
                    onClick={() => setShowResetStatsModal(false)}
                    variant="outline"
                    className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-bold tracking-wider bg-transparent"
                  >
                    CANCEL
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Order Confirmation Modal */}
      {showDeleteOrderModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowDeleteOrderModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white border-2 border-red-600 w-full max-w-sm">
              <div className="flex justify-between items-center p-4">
                <h2 className="text-lg font-bold tracking-wider text-red-600">DELETE ORDER</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowDeleteOrderModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700">
                  Are you sure you want to delete this order? This action cannot be undone.
                </p>
              </div>
              <div className="p-4">
                <div className="flex space-x-3">
                  <Button
                    onClick={confirmDeleteOrder}
                    className="flex-1 bg-red-600 text-white hover:bg-red-700 font-bold tracking-wider"
                  >
                    DELETE
                  </Button>
                  <Button
                    onClick={() => setShowDeleteOrderModal(false)}
                    variant="outline"
                    className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-bold tracking-wider bg-transparent"
                  >
                    CANCEL
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete All Orders Confirmation Modal */}
      {showDeleteAllOrdersModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setShowDeleteAllOrdersModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white border-2 border-red-600 w-full max-w-sm">
              <div className="flex justify-between items-center p-4">
                <h2 className="text-lg font-bold tracking-wider text-red-600">DELETE ALL ORDERS</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowDeleteAllOrdersModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700">
                  Are you sure you want to delete ALL orders? This will permanently remove all order history and cannot
                  be undone.
                </p>
              </div>
              <div className="p-4">
                <div className="flex space-x-3">
                  <Button
                    onClick={confirmDeleteAllOrders}
                    className="flex-1 bg-red-600 text-white hover:bg-red-700 font-bold tracking-wider"
                  >
                    DELETE ALL
                  </Button>
                  <Button
                    onClick={() => setShowDeleteAllOrdersModal(false)}
                    variant="outline"
                    className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-bold tracking-wider bg-transparent"
                  >
                    CANCEL
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Product Confirmation Modal */}
      {showDeleteProductModal && productToDelete && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowDeleteProductModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white border-2 border-red-600 w-full max-w-sm">
              <div className="flex justify-between items-center p-4">
                <h2 className="text-lg font-bold tracking-wider text-red-600">DELETE PRODUCT</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowDeleteProductModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700 mb-3">
                  Are you sure you want to delete this product? This action cannot be undone.
                </p>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-medium text-gray-900">{productToDelete.name}</p>
                  <p className="text-xs text-gray-600">
                    {productToDelete.category} • {productToDelete.price} LEK
                  </p>
                </div>
              </div>
              <div className="p-4">
                <div className="flex space-x-3">
                  <Button
                    onClick={confirmDeleteProduct}
                    disabled={deleteLoading === (productToDelete._id || productToDelete.id)}
                    className="flex-1 bg-red-600 text-white hover:bg-red-700 font-bold tracking-wider"
                  >
                    {deleteLoading === (productToDelete._id || productToDelete.id) ? "DELETING..." : "DELETE"}
                  </Button>
                  <Button
                    onClick={() => setShowDeleteProductModal(false)}
                    variant="outline"
                    className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-bold tracking-wider bg-transparent"
                  >
                    CANCEL
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Admin Navbar - Mobile Optimized */}
      <nav className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <h1 className="text-lg sm:text-xl font-playfair font-medium tracking-wide truncate">THE PLAYERS CLUB</h1>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {dbTestResult && (
                <Badge variant={dbTestResult.success ? "default" : "destructive"} className="text-xs">
                  DB: {dbTestResult.success ? "OK" : "ERR"}
                </Badge>
              )}
              <Button
                variant="outline"
                onClick={handleLogout}
                className="font-medium bg-transparent text-xs sm:text-sm px-2 sm:px-4"
                disabled={isLoggingOut}
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {isLoggingOut ? "LOGGING OUT..." : "LOGOUT"}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Error Display - Mobile Optimized */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-red-600 font-medium text-sm sm:text-base break-words">{error}</p>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadData}
                    className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testDatabaseConnection}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50 bg-transparent text-xs"
                  >
                    <Database className="h-3 w-3 mr-1" />
                    Test DB
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Database Status - Mobile Optimized */}
        {dbTestResult && !dbTestResult.success && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Database className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
              <h3 className="font-medium text-yellow-800 text-sm sm:text-base">Database Issue</h3>
            </div>
            <p className="text-yellow-700 text-xs sm:text-sm mb-2 break-words">{dbTestResult.error}</p>
            <p className="text-yellow-600 text-xs mb-3 break-all">MongoDB URI: {dbTestResult.mongoUri || "Not set"}</p>

            {dbTestResult.troubleshooting && (
              <div className="bg-yellow-100 p-2 sm:p-3 rounded text-xs">
                <p className="font-medium text-yellow-800 mb-2">Troubleshooting:</p>
                <ul className="list-disc list-inside space-y-1 text-yellow-700">
                  {dbTestResult.troubleshooting.slice(0, 3).map((step: string, index: number) => (
                    <li key={index} className="break-words">
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={testDatabaseConnection}
                className="text-yellow-600 border-yellow-300 hover:bg-yellow-50 bg-transparent text-xs"
              >
                <Database className="h-3 w-3 mr-1" />
                Test Again
              </Button>
            </div>
          </div>
        )}

        {/* Tabs - Mobile Optimized */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 gap-1 h-auto sm:grid-cols-4 sm:h-10">
            <TabsTrigger value="stats" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
              Stats
            </TabsTrigger>
            <TabsTrigger value="products" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
              Products ({products.length})
            </TabsTrigger>
            <TabsTrigger value="add-product" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
              {editingProduct ? "Edit" : "Add Product"}
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
              Orders ({recentOrders.length})
            </TabsTrigger>
          </TabsList>

          {/* Stats Tab - Mobile Optimized */}
          <TabsContent value="stats">
            {stats ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">Total Products</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xl sm:text-2xl font-bold">{stats.totalProducts}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">Total Checkouts</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xl sm:text-2xl font-bold">{stats.totalCheckouts}</div>
                    <div className="flex flex-col gap-1 mt-2">
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSubtractCheckouts(!showSubtractCheckouts)}
                          className="text-xs px-2 py-1 h-6 bg-transparent"
                        >
                          Subtract
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResetStats}
                          className="text-xs px-2 py-1 h-6 bg-transparent text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Reset
                        </Button>
                      </div>
                      {showSubtractCheckouts && (
                        <div className="flex gap-1 mt-1">
                          <Input
                            type="number"
                            value={subtractCheckouts}
                            onChange={(e) => setSubtractCheckouts(e.target.value)}
                            placeholder="Amount"
                            className="text-xs h-6 px-2"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSubtractCheckouts}
                            className="text-xs px-2 py-1 h-6 bg-transparent"
                          >
                            ✓
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xl sm:text-2xl font-bold">{stats.totalRevenue.toFixed(2)} ALL</div>
                    <div className="flex flex-col gap-1 mt-2">
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSubtractRevenue(!showSubtractRevenue)}
                          className="text-xs px-2 py-1 h-6 bg-transparent"
                        >
                          Subtract
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResetStats}
                          className="text-xs px-2 py-1 h-6 bg-transparent text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Reset
                        </Button>
                      </div>
                      {showSubtractRevenue && (
                        <div className="flex gap-1 mt-1">
                          <Input
                            type="number"
                            step="0.01"
                            value={subtractRevenue}
                            onChange={(e) => setSubtractRevenue(e.target.value)}
                            placeholder="Amount"
                            className="text-xs h-6 px-2"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSubtractRevenue}
                            className="text-xs px-2 py-1 h-6 bg-transparent"
                          >
                            ✓
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">Most Added</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm sm:text-lg font-semibold truncate">
                      {stats.mostAddedToBag?.name || "N/A"}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {stats.mostAddedToBag?.addedToBagCount || 0} times
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-4 sm:p-8 text-center">
                  <p className="text-gray-500 text-sm sm:text-base">
                    Unable to load statistics. Please check your database connection.
                  </p>
                  <Button variant="outline" onClick={loadData} className="mt-4 bg-transparent text-sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Products Tab - Mobile Optimized */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Products ({products.length})</CardTitle>
                <CardDescription className="text-sm">Manage your existing products</CardDescription>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <p className="text-sm sm:text-base">No products found. Add your first product to get started.</p>
                    <Button variant="outline" onClick={() => setActiveTab("add-product")} className="mt-4 text-sm">
                      Add Product
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {products.map((product) => {
                      const productId = product._id || product.id
                      return (
                        <div
                          key={productId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors space-y-3 sm:space-y-0"
                        >
                          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                              <Image
                                src={getProductImageUrl(product) || "/placeholder.png"}
                                alt={product.name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                                priority={false}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = "/placeholder.png"
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base truncate">{product.name}</h3>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {product.category} • {product.price} ALL
                              </p>
                              <p className="text-xs text-gray-500 mt-1 truncate">ID: {productId}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  Sizes: {product.availableSizes.join(", ") || "None"}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  Colors: {product.colors.length}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2 sm:flex-col sm:space-x-0 sm:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                              className="flex-1 sm:flex-none text-xs"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(product)}
                              disabled={deleteLoading === productId}
                              className="flex-1 sm:flex-none text-xs"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              {deleteLoading === productId ? "..." : "Delete"}
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Product Tab - Mobile Optimized */}
          <TabsContent value="add-product">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  {editingProduct ? `Edit: ${editingProduct.name}` : "Add New Product"}
                </CardTitle>
                <CardDescription className="text-sm">
                  {editingProduct ? "Update product information" : "Create a new product listing"}
                  <br />
                  <span className="text-red-600 text-xs font-semibold">
                    ⚠️ IMPORTANT: You must upload actual front and back images for each color. Placeholder images will
                    not be accepted.
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* Basic Info - Mobile Stacked */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Product Name *
                      </Label>
                      <Input
                        id="name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="Enter product name"
                        className="text-sm"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-sm font-medium">
                        Price (ALL) *
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        placeholder="0.00"
                        className="text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium">
                      Category *
                    </Label>
                    <Select
                      value={newProduct.category}
                      onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                      required
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tshirts">T-Shirts</SelectItem>
                        <SelectItem value="hoodies">Hoodies</SelectItem>
                        <SelectItem value="pants">Pants</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description *
                    </Label>
                    <Input
                      id="description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="Brief product description"
                      className="text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="details" className="text-sm font-medium">
                      Product Details *
                    </Label>
                    <Textarea
                      id="details"
                      value={newProduct.details}
                      onChange={(e) => setNewProduct({ ...newProduct, details: e.target.value })}
                      placeholder="Enter product details (one per line)"
                      rows={4}
                      className="text-sm"
                      required
                    />
                  </div>

                  {/* Sizes - Mobile Optimized */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Available Sizes *</Label>
                    <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
                      {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                        <Button
                          key={size}
                          type="button"
                          variant={newProduct.availableSizes.includes(size) ? "default" : "outline"}
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            const availableSizes = newProduct.availableSizes.includes(size)
                              ? newProduct.availableSizes.filter((s) => s !== size)
                              : [...newProduct.availableSizes, size]
                            setNewProduct({ ...newProduct, availableSizes })
                          }}
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">Select at least one size</p>
                  </div>

                  {/* Colors - Mobile Optimized */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <Label className="text-sm font-medium">Product Colors & Images *</Label>
                      <Button
                        type="button"
                        onClick={addColor}
                        variant="outline"
                        size="sm"
                        className="text-xs bg-transparent"
                      >
                        Add Color
                      </Button>
                    </div>

                    {newProduct.colors.length === 0 ? (
                      <p className="text-sm text-gray-500 p-4 border border-dashed rounded-lg text-center">
                        No colors added yet. Click "Add Color" to start.
                      </p>
                    ) : (
                      <div className="space-y-6">
                        {newProduct.colors.map((color, colorIndex) => (
                          <div
                            key={colorIndex}
                            className={`border rounded-lg p-4 space-y-4 ${isColorValid(color) ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-sm sm:text-base">{color.name}</h4>
                                {isColorValid(color) ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeColor(colorIndex)}
                                className="text-xs"
                              >
                                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>

                            {!isColorValid(color) && (
                              <div className="bg-red-100 border border-red-200 rounded p-2">
                                <p className="text-red-700 text-xs font-medium">
                                  ⚠️ This color needs both front and back images uploaded before you can save the
                                  product.
                                </p>
                              </div>
                            )}

                            {/* Front Image */}
                            <div className="space-y-2">
                              <Label
                                className={`text-sm font-medium ${color.images.front === "/placeholder.png" ? "text-red-600" : "text-green-600"}`}
                              >
                                Front View Image * {color.images.front !== "/placeholder.png" ? "✓" : "(Required)"}
                              </Label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        handleImageUpload(colorIndex, "front", file)
                                      }
                                    }}
                                    disabled={uploading}
                                    className="text-sm"
                                  />
                                </div>
                                <div
                                  className={`w-20 h-20 rounded border overflow-hidden ${color.images.front !== "/placeholder.png" ? "bg-green-100 border-green-300" : "bg-gray-100 border-gray-300"}`}
                                >
                                  {color.images.front && color.images.front !== "/placeholder.png" ? (
                                    <Image
                                      src={color.images.front || "/placeholder.svg"}
                                      alt={`${color.name} front`}
                                      width={80}
                                      height={80}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <ImageIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Back Image */}
                            <div className="space-y-2">
                              <Label
                                className={`text-sm font-medium ${color.images.back === "/placeholder.png" ? "text-red-600" : "text-green-600"}`}
                              >
                                Back View Image * {color.images.back !== "/placeholder.png" ? "✓" : "(Required)"}
                              </Label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        handleImageUpload(colorIndex, "back", file)
                                      }
                                    }}
                                    disabled={uploading}
                                    className="text-sm"
                                  />
                                </div>
                                <div
                                  className={`w-20 h-20 rounded border overflow-hidden ${color.images.back !== "/placeholder.png" ? "bg-green-100 border-green-300" : "bg-gray-100 border-gray-300"}`}
                                >
                                  {color.images.back && color.images.back !== "/placeholder.png" ? (
                                    <Image
                                      src={color.images.back || "/placeholder.svg"}
                                      alt={`${color.name} back`}
                                      width={80}
                                      height={80}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <ImageIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Optional Images */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">
                                  Optional Images (Models, Side Views, etc.)
                                </Label>
                                <Button
                                  type="button"
                                  onClick={() => addOptionalImage(colorIndex)}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs bg-transparent"
                                >
                                  Add Optional
                                </Button>
                              </div>

                              {color.images.optional && color.images.optional.length > 0 && (
                                <div className="space-y-3">
                                  {color.images.optional.map((optionalImage, optionalIndex) => (
                                    <div
                                      key={optionalIndex}
                                      className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center p-3 border rounded"
                                    >
                                      <div>
                                        <Input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                              handleImageUpload(colorIndex, "optional", file, optionalIndex)
                                            }
                                          }}
                                          disabled={uploading}
                                          className="text-sm"
                                        />
                                      </div>
                                      <div className="w-20 h-20 bg-gray-100 rounded border overflow-hidden">
                                        {optionalImage && optionalImage !== "/placeholder.png" ? (
                                          <Image
                                            src={optionalImage || "/placeholder.svg"}
                                            alt={`${color.name} optional ${optionalIndex + 1}`}
                                            width={80}
                                            height={80}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="h-6 w-6 text-gray-400" />
                                          </div>
                                        )}
                                      </div>
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => removeOptionalImage(colorIndex, optionalIndex)}
                                        className="text-xs justify-self-start"
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {uploading && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Upload className="h-4 w-4 animate-spin" />
                                <span>Uploading...</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons - Mobile Optimized */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                    <Button type="submit" className="flex-1 text-sm" disabled={loading || uploading}>
                      {loading ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
                    </Button>
                    {editingProduct && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        className="flex-1 sm:flex-none text-sm bg-transparent"
                      >
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab - Mobile Optimized */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Recent Orders ({recentOrders.length})</CardTitle>
                    <CardDescription className="text-sm">View and manage customer orders</CardDescription>
                  </div>
                  {recentOrders.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteAllOrders}
                      className="text-xs bg-transparent text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Delete All Orders
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <p className="text-sm sm:text-base">
                      No orders yet. Orders will appear here once customers start purchasing.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {recentOrders.map((order, index) => (
                      <div key={index} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                Order #{index + 1}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(order.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm font-medium">{order.total.toFixed(2)} ALL</p>
                            <p className="text-xs text-gray-600">{order.items.length} item(s)</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="text-xs">
                              WhatsApp Order
                            </Badge>
                            <div className="mt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteOrder(index)}
                                className="text-xs px-2 py-1 h-6 bg-transparent text-red-600 border-red-300 hover:bg-red-50"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
