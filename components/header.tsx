"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Search, ChevronDown, ShoppingBag, X } from "lucide-react"
import { useCartStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Header() {
  const { items, toggleCart, justAdded } = useCartStore()
  const router = useRouter()
  const [shopOpen, setShopOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [bagAnimation, setBagAnimation] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isDropdownOpen = shopOpen || infoOpen || searchOpen

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  // Trigger bag animation when items are added
  useEffect(() => {
    if (justAdded) {
      setBagAnimation(true)
      setTimeout(() => setBagAnimation(false), 600)
    }
  }, [justAdded])

  const toggleShop = () => {
    setShopOpen(!shopOpen)
    setSearchOpen(false)
    setInfoOpen(false)
  }

  const toggleInfo = () => {
    setInfoOpen(!infoOpen)
    setShopOpen(false)
    setSearchOpen(false)
  }

  const toggleSearch = () => {
    setSearchOpen(!searchOpen)
    setShopOpen(false)
    setInfoOpen(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery("")
    }
  }

  return (
    <>
      {searchOpen && <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setSearchOpen(false)} />}
      <header
        className={cn("sticky top-0 z-40 transition-all duration-300 text-black", {
          "bg-white/30 backdrop-blur-md backdrop-saturate-150 border-b border-white/20 shadow-sm": isScrolled && !isDropdownOpen,
          "bg-white/50 backdrop-blur-lg backdrop-saturate-150 border-b border-white/30 shadow-lg": isDropdownOpen,
          "bg-transparent border-b border-transparent": !isScrolled && !isDropdownOpen,
        })}
      >
        <div className="pl-2 pr-2 sm:pl-3 sm:pr-3 lg:pl-4 lg:pr-4">
          <div className="flex h-12 items-center justify-between w-full">
            {/* Logo and Navigation - Left side */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <Image
                    src="/images/logo.svg"
                    alt="The Players Club"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
                {/* Hide text on mobile, show on sm and up */}
                <span className="hidden sm:block text-base font-medium tracking-wide">THE PLAYERS CLUB</span>
              </Link>

              {/* Mobile Navigation */}
              <div className="sm:hidden flex items-center space-x-0.5">
                <Button
                  variant="ghost"
                  className="flex items-center space-x-1 text-xs font-medium tracking-wider px-2 hover:bg-transparent hover:text-gray-600"
                  onClick={toggleShop}
                >
                  <span>SHOP</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${shopOpen ? "rotate-180" : ""}`} />
                </Button>

                <Button
                  variant="ghost"
                  className="flex items-center space-x-1 text-xs font-medium tracking-wider px-1 hover:bg-transparent hover:text-gray-600"
                  onClick={toggleInfo}
                >
                  <span>INFO</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${infoOpen ? "rotate-180" : ""}`} />
                </Button>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden sm:flex items-center space-x-1">
                <Button
                  variant="ghost"
                  className="flex items-center space-x-1 text-xs font-medium tracking-wider hover:bg-transparent hover:text-gray-600"
                  onClick={toggleShop}
                >
                  <span>SHOP</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${shopOpen ? "rotate-180" : ""}`} />
                </Button>

                <Button
                  variant="ghost"
                  className="flex items-center space-x-1 text-xs font-medium tracking-wider hover:bg-transparent hover:text-gray-600"
                  onClick={toggleInfo}
                >
                  <span>INFO</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${infoOpen ? "rotate-180" : ""}`} />
                </Button>
              </div>
            </div>

            {/* Right side - Search and Bag */}
            <div className="flex items-center space-x-1 sm:space-x-3">
              {/* Search Button */}
              <Button
                variant="ghost"
                onClick={toggleSearch}
                className="text-xs font-medium tracking-wider px-2 sm:px-3 hover:bg-transparent hover:text-gray-600"
              >
                <span className="hidden sm:inline">SEARCH</span>
                <Search className="h-4 w-4 sm:hidden" />
              </Button>

              {/* Bag Button with Icon and Counter */}
              <Button
                variant="ghost"
                onClick={toggleCart}
                className="relative text-xs font-medium tracking-wider px-2 sm:px-3 hover:bg-transparent hover:text-gray-600"
              >
                {/* Desktop version */}
                <span className="hidden sm:inline">BAG ({itemCount})</span>

                {/* Mobile version with bag icon and animated counter */}
                <div className="sm:hidden relative">
                  <ShoppingBag
                    className={`h-5 w-5 transition-transform duration-300 ${bagAnimation ? "scale-110" : "scale-100"}`}
                  />
                  {itemCount > 0 && (
                    <div
                      className={`absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium transition-all duration-300 ${
                        bagAnimation ? "scale-125 bg-red-500" : "scale-100"
                      }`}
                    >
                      {itemCount > 99 ? "99+" : itemCount}
                    </div>
                  )}
                </div>
              </Button>
            </div>
          </div>

          {/* Shop dropdown content */}
          {shopOpen && (
            <div className="border-t border-gray-200 py-4">
              {/* Mobile: Two columns layout (4 items fit in first column) */}
              <div className="sm:hidden grid grid-cols-2 gap-x-4 gap-y-2">
                {/* First column - 4 items */}
                <div className="space-y-2">
                  <Link
                    href="/shop/all"
                    className="block text-xs font-medium tracking-wider hover:text-gray-600 py-1"
                    onClick={() => setShopOpen(false)}
                  >
                    ALL PRODUCTS
                  </Link>
                  <Link
                    href="/shop/tshirts"
                    className="block text-xs font-medium tracking-wider hover:text-gray-600 py-1"
                    onClick={() => setShopOpen(false)}
                  >
                    T-SHIRTS
                  </Link>
                  <Link
                    href="/shop/hoodies"
                    className="block text-xs font-medium tracking-wider hover:text-gray-600 py-1"
                    onClick={() => setShopOpen(false)}
                  >
                    HOODIES
                  </Link>
                  <Link
                    href="/shop/pants"
                    className="block text-xs font-medium tracking-wider hover:text-gray-600 py-1"
                    onClick={() => setShopOpen(false)}
                  >
                    PANTS
                  </Link>
                </div>

                {/* Second column - empty for now, ready for future additions */}
                <div className="space-y-2">{/* Future shop categories will go here */}</div>
              </div>

              {/* Desktop: Single row layout */}
              <div className="hidden sm:flex sm:flex-row sm:space-y-0 sm:space-x-8">
                <Link
                  href="/shop/all"
                  className="text-xs font-medium tracking-wider hover:text-gray-600 py-1"
                  onClick={() => setShopOpen(false)}
                >
                  ALL PRODUCTS
                </Link>
                <Link
                  href="/shop/tshirts"
                  className="text-xs font-medium tracking-wider hover:text-gray-600 py-1"
                  onClick={() => setShopOpen(false)}
                >
                  T-SHIRTS
                </Link>
                <Link
                  href="/shop/hoodies"
                  className="text-xs font-medium tracking-wider hover:text-gray-600 py-1"
                  onClick={() => setShopOpen(false)}
                >
                  HOODIES
                </Link>
                <Link
                  href="/shop/pants"
                  className="text-xs font-medium tracking-wider hover:text-gray-600 py-1"
                  onClick={() => setShopOpen(false)}
                >
                  PANTS
                </Link>
              </div>
            </div>
          )}

          {/* Info dropdown content */}
          {infoOpen && (
            <div className="border-t border-gray-200 py-4">
              {/* Mobile: Two columns layout */}
              <div className="sm:hidden grid grid-cols-2 gap-x-4 gap-y-2">
                {/* First column - 4 items */}
                <div className="space-y-2">
                  <Link
                    href="/info/about-us"
                    className="block text-xs font-medium tracking-wider hover:text-gray-600 py-1"
                    onClick={() => setInfoOpen(false)}
                  >
                    ABOUT US
                  </Link>
                  <Link
                    href="/info/shipping"
                    className="block text-xs font-medium tracking-wider hover:text-gray-600 py-1"
                    onClick={() => setInfoOpen(false)}
                  >
                    SHIPPING
                  </Link>
                  <Link
                    href="/info/terms-conditions"
                    className="block text-xs font-medium tracking-wider hover:text-gray-600 py-1"
                    onClick={() => setInfoOpen(false)}
                  >
                    TERMS & CONDITIONS
                  </Link>
                  <Link
                    href="/info/privacy-policy"
                    className="block text-xs font-medium tracking-wider hover:text-gray-600 py-1"
                    onClick={() => setInfoOpen(false)}
                  >
                    PRIVACY POLICY
                  </Link>
                </div>

                {/* Second column - 2 items */}
                <div className="space-y-2">
                  <Link
                    href="/info/refund-policy"
                    className="block text-xs font-medium tracking-wider hover:text-gray-600 py-1"
                    onClick={() => setInfoOpen(false)}
                  >
                    REFUND POLICY
                  </Link>
                  <Link
                    href="/info/contact"
                    className="block text-xs font-medium tracking-wider hover:text-gray-600 py-1"
                    onClick={() => setInfoOpen(false)}
                  >
                    CONTACT
                  </Link>
                </div>
              </div>

              {/* Desktop: Single row layout */}
              <div className="hidden sm:flex sm:flex-row sm:space-y-0 sm:space-x-8">
                <Link
                  href="/info/about-us"
                  className="text-xs font-medium tracking-wider hover:text-gray-600 py-1"
                  onClick={() => setInfoOpen(false)}
                >
                  ABOUT US
                </Link>
                <Link
                  href="/info/shipping"
                  className="text-xs font-medium tracking-wider hover:text-gray-600 py-1"
                  onClick={() => setInfoOpen(false)}
                >
                  SHIPPING
                </Link>
                <Link
                  href="/info/terms-conditions"
                  className="text-xs font-medium tracking-wider hover:text-gray-600 py-1"
                  onClick={() => setInfoOpen(false)}
                >
                  TERMS & CONDITIONS
                </Link>
                <Link
                  href="/info/privacy-policy"
                  className="text-xs font-medium tracking-wider hover:text-gray-600 py-1"
                  onClick={() => setInfoOpen(false)}
                >
                  PRIVACY POLICY
                </Link>
                <Link
                  href="/info/refund-policy"
                  className="text-xs font-medium tracking-wider hover:text-gray-600 py-1"
                  onClick={() => setInfoOpen(false)}
                >
                  REFUND POLICY
                </Link>
                <Link
                  href="/info/contact"
                  className="text-xs font-medium tracking-wider hover:text-gray-600 py-1"
                  onClick={() => setInfoOpen(false)}
                >
                  CONTACT
                </Link>
              </div>
            </div>
          )}

          {/* Search bar */}
          {searchOpen && (
            <div className="border-t border-gray-200 py-4">
              <form onSubmit={handleSearch} className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-none outline-none text-sm font-medium bg-transparent"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </form>
              {searchQuery.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">Press Enter to search for "{searchQuery}"</div>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  )
}
