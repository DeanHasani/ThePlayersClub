"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { useCartStore } from "@/lib/store"
import { getImageUrl } from "@/lib/utils"
import { ChevronLeft, ChevronDown, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import AddToBagModal from "@/components/add-to-bag-modal"
import CheckoutDialog from "@/components/checkout-dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Product } from "@/lib/types"
import LoadingSpinner from "@/components/loading-spinner"

interface ProductPageProps {
  params: {
    category: string
    slug: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const { category, slug } = params
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  const [selectedColor, setSelectedColor] = useState<any>(null)
  const [selectedSize, setSelectedSize] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [shippingOpen, setShippingOpen] = useState(false)
  const [imageZoomed, setImageZoomed] = useState(false)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)

  // Carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const { addItem } = useCartStore()

  // Touch handlers for swipe (works for both normal and zoomed view)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    const currentImages = getCurrentImages()
    if (isLeftSwipe && currentImageIndex < currentImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
    if (isRightSwipe && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  // Navigation functions for both normal and zoomed view
  const goToPrevious = (currentImages: any[]) => {
    setCurrentImageIndex(currentImageIndex > 0 ? currentImageIndex - 1 : currentImages.length - 1)
  }

  const goToNext = (currentImages: any[]) => {
    setCurrentImageIndex(currentImageIndex < currentImages.length - 1 ? currentImageIndex + 1 : 0)
  }

  // Keyboard navigation for zoomed view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentImages = getCurrentImages()
      if (!imageZoomed) return

      if (e.key === "ArrowLeft") {
        e.preventDefault()
        goToPrevious(currentImages)
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        goToNext(currentImages)
      } else if (e.key === "Escape") {
        e.preventDefault()
        setImageZoomed(false)
      }
    }

    if (imageZoomed) {
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [imageZoomed])

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await api.getProductBySlug(slug)
        setProduct(data)
        setSelectedColor(data.colors[0])
        setCurrentImageIndex(0) // Reset carousel when product loads
      } catch (error) {
        console.error("Error loading product:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [slug])

  // Reset carousel when color changes
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [selectedColor])

  // Prevent body scroll when image is zoomed
  useEffect(() => {
    if (imageZoomed || sizeGuideOpen) {
      document.body.style.overflow = "hidden"
      document.body.style.touchAction = "none"
    } else {
      document.body.style.overflow = "unset"
      document.body.style.touchAction = "auto"
    }

    return () => {
      document.body.style.overflow = "unset"
      document.body.style.touchAction = "auto"
    }
  }, [imageZoomed, sizeGuideOpen])

  const isSizeAvailable = (size: string) => {
    return product ? product.availableSizes.includes(size) : false
  }

  const handleAddToBag = () => {
    if (!selectedSize || !isSizeAvailable(selectedSize)) return

    const frontImage = selectedColor?.images?.front || "/placeholder.png"

    addItem({
      productId: product?._id || product?.id!,
      name: product?.name || "",
      price: product?.price || 0,
      color: selectedColor?.name || "",
      size: selectedSize,
      quantity: 1,
      image: getImageUrl(frontImage),
    })

    setShowModal(true)
  }

  const handleDirectCheckout = () => {
    if (!selectedSize || !isSizeAvailable(selectedSize)) return
    setShowCheckoutDialog(true)
  }

  const handleModalCheckout = () => {
    setShowModal(false)
    setShowCheckoutDialog(true)
  }

  const handleImageZoomClose = () => {
    setImageZoomed(false)
  }

  const handleSizeGuideClose = () => {
    setSizeGuideOpen(false)
  }

  const handleZoomBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleImageZoomClose()
    }
  }

  const handleSizeGuideBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleSizeGuideClose()
    }
  }

  const getCurrentImages = () => {
    if (!selectedColor?.images) return []

    const images = []
    if (selectedColor.images.front) images.push(selectedColor.images.front)
    if (selectedColor.images.back) images.push(selectedColor.images.back)
    if (selectedColor.images.optional) {
      images.push(...selectedColor.images.optional)
    }

    return images
  }

  const currentImages = getCurrentImages()
  const currentImage = currentImages[currentImageIndex] || currentImages[0] || "/placeholder.png"

  const directCheckoutItems =
    product && selectedColor && selectedSize
      ? [
          {
            id: "direct-checkout",
            productId: product._id || product.id!,
            name: product.name,
            price: product.price,
            color: selectedColor.name,
            size: selectedSize,
            quantity: 1,
            image: getImageUrl(selectedColor.images.front),
            productUrl: `${typeof window !== "undefined" ? window.location.origin : ""}/shop/${category}/${slug}`,
          },
        ]
      : []

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="min-h-[70vh] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!product) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href={`/shop/${category}`}
          className="flex items-center text-sm text-gray-600 hover:text-black font-medium"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          BACK TO {category.toUpperCase()}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image Carousel - Smooth sliding */}
        <div className="space-y-4">
          <div
            className="aspect-[4/4.5] bg-gray-100 overflow-hidden relative cursor-zoom-in"
            onClick={() => setImageZoomed(true)}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              className="flex transition-transform duration-300 ease-in-out h-full w-full"
              style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
            >
              {currentImages.map((img, idx) => (
                <div key={idx} className="flex-shrink-0 w-full h-full">
                  <Image
                    src={img || "/placeholder.png"}
                    alt={`${product.name} - ${selectedColor?.name}`}
                    width={600}
                    height={675}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    priority={idx === 0}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.png"
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          {currentImages.length > 1 && (
            <div className="flex justify-between items-center">
              <button
                onClick={() => goToPrevious(currentImages)}
                className="w-10 h-6 border border-black flex items-center justify-center text-black hover:bg-black hover:text-white transition-all duration-200 font-bold text-lg leading-none"
                aria-label="Previous image"
              >
                ←
              </button>

              <div className="flex space-x-2">
                {currentImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 border transition-all duration-200 ${
                      index === currentImageIndex
                        ? "bg-black border-black"
                        : "bg-transparent border-black hover:bg-black/20"
                    }`}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => goToNext(currentImages)}
                className="w-10 h-6 border border-black flex items-center justify-center text-black hover:bg-black hover:text-white transition-all duration-200 font-bold text-lg leading-none"
                aria-label="Next image"
              >
                →
              </button>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-between h-full">
          <div className="space-y-6 flex-1">
            <div>
              <h1 className="text-2xl font-bold mb-2 tracking-wide">{product.name}</h1>
              <p className="text-2xl font-bold">{product.price} LEK</p>
            </div>

            <div className="space-y-8 mt-16">
              {/* Color Selection */}
              <div>
                <h3 className="text-sm font-bold mb-3 tracking-wider">{selectedColor?.name.toUpperCase()}</h3>
                <div className="flex space-x-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 border-2 ${
                        selectedColor?.name === color.name ? "border-black" : "border-gray-300"
                      }`}
                    >
                      <Image
                        src={getImageUrl(color.images.front) || "/placeholder.png"}
                        alt={color.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.png"
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex space-x-2 mb-4">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border text-sm font-bold ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : "border-gray-300 hover:border-black"
                      } ${!isSizeAvailable(size) ? "opacity-50" : ""}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {selectedSize && !isSizeAvailable(selectedSize) && (
                  <p className="text-sm text-red-600 font-medium">This size is not available</p>
                )}
              </div>

              {/* Size Guide */}
              <div className="py-4 border-t border-gray-200">
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="font-bold tracking-wider text-sm hover:text-gray-600 transition-colors"
                >
                  SIZE GUIDE
                </button>
              </div>

              {/* Product Details Collapsible */}
              <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-4 border-t border-gray-200">
                  <span className="font-bold tracking-wider">PRODUCT DETAILS</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${detailsOpen ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pb-4">
                  <ul className="space-y-1 text-xs text-gray-600 font-medium">
                    {product.details.map((detail, index) => (
                      <li key={index}>- {detail}</li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>

              {/* Shipping & Returns */}
              <Collapsible open={shippingOpen} onOpenChange={setShippingOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-4 border-t border-gray-200">
                  <span className="font-bold tracking-wider">INFORMATION ABOUT SHIPPING</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${shippingOpen ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pb-4">
                  <div className="text-xs text-gray-600 space-y-2 font-medium">
                    <p>No returns after purchase.</p>
                    <p>Free standard shipping on every order.</p>
                    <p>Items delievered in personalized boxes.</p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <button
              onClick={handleAddToBag}
              disabled={!selectedSize || !isSizeAvailable(selectedSize)}
              className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 font-bold tracking-wider py-2 px-4 transition-colors duration-200"
            >
              ADD TO BAG
            </button>
            <button
              onClick={handleDirectCheckout}
              disabled={!selectedSize || !isSizeAvailable(selectedSize)}
              className="border border-black text-black hover:bg-black hover:text-white disabled:border-gray-300 bg-transparent font-bold tracking-wider py-2 px-4 transition-colors duration-200"
            >
              CHECKOUT
            </button>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal with Fixed Navigation Position */}
      {imageZoomed && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50" onClick={handleZoomBackdropClick} />
          <div
            className="fixed inset-0 z-50 overflow-auto p-4 sm:p-8 pb-20"
            onClick={handleZoomBackdropClick}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{
              overflowY: "auto",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div className="min-h-full flex items-center justify-center py-4">
              <div className="relative max-w-2xl w-full">
                {/* Close Button */}
                <button
                  onClick={handleImageZoomClose}
                  className="absolute -top-8 -right-3 text-gray-400 hover:text-white z-10 p-2"
                >
                  <X className="h-6 w-6" />
                </button>

                {/* Zoomed Image */}
                <Image
                  src={currentImage || "/placeholder.png"}
                  alt={`${product.name} - Image ${currentImageIndex + 1}`}
                  width={600}
                  height={600}
                  className="w-full h-auto shadow-2xl"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.png"
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </div>

          {/* Fixed Navigation Controls - Same layout as normal view */}
          {currentImages.length > 1 && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
              <div className="flex justify-between items-center w-80 max-w-[90vw] pointer-events-auto">
                {/* Left Arrow - Same as normal view but with smart contrast */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPrevious(currentImages)
                  }}
                  className="w-10 h-6 border-2 border-white bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white hover:text-black hover:border-white transition-all duration-200 font-bold text-lg shadow-xl leading-none"
                  aria-label="Previous image"
                >
                  ←
                </button>

                {/* Dots in the center - Same as normal view but with smart contrast */}
                <div className="flex space-x-2 px-2 py-1 bg-black/50 backdrop-blur-sm">
                  {currentImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentImageIndex(index)
                      }}
                      className={`w-2 h-2 border-2 transition-all duration-200 shadow-sm ${
                        index === currentImageIndex
                          ? "bg-white border-white"
                          : "bg-transparent border-white hover:bg-white/50 hover:border-white"
                      }`}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Right Arrow - Same as normal view but with smart contrast */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToNext(currentImages)
                  }}
                  className="w-10 h-6 border-2 border-white bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white hover:text-black hover:border-white transition-all duration-200 font-bold text-lg shadow-xl leading-none"
                  aria-label="Next image"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50" onClick={handleSizeGuideBackdropClick} />
          <div
            className="fixed inset-0 z-50 overflow-auto p-8 sm:p-12 md:p-16"
            onClick={handleSizeGuideBackdropClick}
            style={{
              overflowY: "auto",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div className="min-h-full flex items-center justify-center">
              <div className="relative max-w-4xl max-h-[90vh] w-full">
                <button
                  onClick={handleSizeGuideClose}
                  className="absolute -top-8 -right-3 text-gray-400 hover:text-white z-10 p-2"
                >
                  <X className="h-6 w-6" />
                </button>
                {/* Replace this placeholder with your size guide image */}
                <div className="bg-white p-8 shadow-2xl">
                  <h2 className="text-2xl font-bold mb-6 text-center">SIZE GUIDE</h2>
                    <img src="/images/sizechart.png" alt="sizechart" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <AddToBagModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        productName={product.name}
        productColor={selectedColor?.name}
        productSize={selectedSize}
        productPrice={product.price}
        onCheckout={handleModalCheckout}
      />

      {/* Direct Checkout Dialog */}
      <CheckoutDialog
        isOpen={showCheckoutDialog}
        onClose={() => setShowCheckoutDialog(false)}
        items={directCheckoutItems}
        total={product?.price || 0}
      />
    </div>
  )
}
