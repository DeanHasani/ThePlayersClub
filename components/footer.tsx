"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { MessageCircle, Mail, Facebook, Instagram } from "lucide-react"
import { CONTACT_CONFIG } from "@/lib/config"

// Custom TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M19.321 5.562a5.124 5.124 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.849-1.294-1.98-1.294-3.338h-3.239v14.19c0 1.308-1.065 2.372-2.372 2.372s-2.372-1.064-2.372-2.372c0-1.308 1.065-2.372 2.372-2.372.131 0 .258.011.382.031V9.611a5.612 5.612 0 0 0-.382-.013c-3.097 0-5.611 2.514-5.611 5.611s2.514 5.611 5.611 5.611 5.611-2.514 5.611-5.611V9.804a9.65 9.65 0 0 0 5.015 1.383V8.003a6.229 6.229 0 0 1-2.141-.441z" />
  </svg>
)

export default function Footer() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showFooter, setShowFooter] = useState(false)
  const pathname = usePathname()

  // Determine if footer should be shown based on current route
  const shouldShowFooter = () => {
    // Don't show on admin/dashboard pages
    if (pathname.startsWith("/dashboard")) return false

    // Don't show on individual product pages (has slug pattern)
    if (pathname.match(/^\/shop\/[^/]+\/[^/]+$/)) return false

    // Show on main page, category pages, info pages, and other pages
    return true
  }

  useEffect(() => {
    if (!shouldShowFooter()) {
      setShowFooter(false)
      return
    }

    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop

      // Show footer when user is near the bottom (within 100px)
      const isNearBottom = scrollTop + windowHeight >= documentHeight - 100

      // Only apply this logic on mobile for non-info pages
      if (window.innerWidth < 640) {
        setShowFooter(isNearBottom)
      } else {
        setShowFooter(false) // Desktop footer is always static
      }
    }

    // Throttle scroll events
    let ticking = false
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", throttledHandleScroll, { passive: true })
    window.addEventListener("resize", throttledHandleScroll, { passive: true })

    // Initial check
    handleScroll()

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll)
      window.removeEventListener("resize", throttledHandleScroll)
    }
  }, [pathname])

  // Don't render footer at all if it shouldn't be shown
  if (!shouldShowFooter()) {
    return null
  }

  const toggleFooter = () => {
    setIsExpanded(!isExpanded)
  }

  const closeFooter = () => {
    setIsExpanded(false)
  }

  const FullFooterContent = () => (
    <div className="px-4 py-4 sm:px-6 sm:py-6">
      {/* Contact Section */}
      <div className="mb-4">
        <h3 className="text-xs font-semibold tracking-wider mb-2">CONTACT US:</h3>
        <div className="space-y-1.5">
          {/* WhatsApp */}
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4 flex-shrink-0" />
            <a
              href={`https://wa.me/${CONTACT_CONFIG.whatsapp.number}`}
              className="text-sm font-medium hover:text-gray-300 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {CONTACT_CONFIG.whatsapp.displayNumber}
            </a>
          </div>

          {/* Email */}
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <a
              href={`mailto:${CONTACT_CONFIG.email.address}`}
              className="text-sm font-medium hover:text-gray-300 transition-colors"
            >
              {CONTACT_CONFIG.email.displayName}
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="mb-4">
        <div className="space-y-1">
          <Link href="/info/about-us" className="block text-xs text-gray-300 hover:text-white transition-colors">
            About Us
          </Link>
          <Link
            href="/info/terms-conditions"
            className="block text-xs text-gray-300 hover:text-white transition-colors"
          >
            Terms & Conditions
          </Link>
          <Link href="/info/privacy-policy" className="block text-xs text-gray-300 hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>

      {/* Social Links */}
      <div className="mb-4">
        <h3 className="text-xs font-semibold tracking-wider mb-2">SOCIAL LINKS:</h3>
        <div className="flex space-x-3">
          <a
            href={CONTACT_CONFIG.social.facebook}
            className="hover:text-gray-300 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <Facebook className="h-5 w-5" />
          </a>
          <a
            href={CONTACT_CONFIG.social.instagram}
            className="hover:text-gray-300 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <Instagram className="h-5 w-5" />
          </a>
          <a
            href={CONTACT_CONFIG.social.tiktok}
            className="hover:text-gray-300 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
          >
            <TikTokIcon className="h-5 w-5" />
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="pt-2 border-t border-gray-600">
        <p className="text-xs text-gray-400">{CONTACT_CONFIG.business.copyright}</p>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Footer - Sliding for non-info pages, static for info pages */}
      <div className="sm:hidden">
        {/* Non-info pages: Sliding footer */}
        <>
          {/* Overlay when expanded */}
          {isExpanded && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleFooter} />}

          {/* Single Footer Container - Always shows the contact part when showFooter is true */}
          <div
            className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
              showFooter ? (isExpanded ? "translate-y-0" : "translate-y-[70%]") : "translate-y-full"
            }`}
          >
            {/* One Complete Footer - Contact part always visible, rest slides up */}
            <div className="bg-black text-white rounded-t-2xl shadow-2xl">
              {/* iPhone-style handle */}
              <div className="flex justify-center pt-4 pb-2">
                <button
                  onClick={toggleFooter}
                  className="w-12 h-1 bg-gray-500 rounded-full"
                  aria-label="Expand footer"
                />
              </div>

              {/* Contact Us section - This part stays visible */}
              <div className="px-4 pb-4">
                <h3 className="text-xs font-semibold tracking-wider mb-3 text-center">CONTACT US:</h3>
                <div className="flex justify-center space-x-6 -ml-2">
                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/${CONTACT_CONFIG.whatsapp.number}`}
                    className="flex items-center space-x-1 text-xs font-medium hover:text-gray-300 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeFooter}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:${CONTACT_CONFIG.email.address}`}
                    className="flex items-center space-x-1 text-xs font-medium hover:text-gray-300 transition-colors"
                    onClick={closeFooter}
                  >
                    <Mail className="h-4 w-4" />
                    <span>{CONTACT_CONFIG.email.displayName}</span>
                  </a>
                </div>
              </div>

              {/* Rest of footer content - This part slides up when expanded */}
              <div className="px-4 pb-4 border-t border-gray-600">
                {/* Navigation Links */}
                <div className="mb-4 mt-4">
                  <div className="space-y-1">
                    <Link
                      href="/info/about-us"
                      className="block text-xs text-gray-300 hover:text-white transition-colors"
                      onClick={closeFooter}
                    >
                      About Us
                    </Link>
                    <Link
                      href="/info/terms-conditions"
                      className="block text-xs text-gray-300 hover:text-white transition-colors"
                      onClick={closeFooter}
                    >
                      Terms & Conditions
                    </Link>
                    <Link
                      href="/info/privacy-policy"
                      className="block text-xs text-gray-300 hover:text-white transition-colors"
                      onClick={closeFooter}
                    >
                      Privacy Policy
                    </Link>
                  </div>
                </div>

                {/* Social Links */}
                <div className="mb-4">
                  <h3 className="text-xs font-semibold tracking-wider mb-2">SOCIAL LINKS:</h3>
                  <div className="flex space-x-3">
                    <a
                      href={CONTACT_CONFIG.social.facebook}
                      className="hover:text-gray-300 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      onClick={closeFooter}
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a
                      href={CONTACT_CONFIG.social.instagram}
                      className="hover:text-gray-300 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      onClick={closeFooter}
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a
                      href={CONTACT_CONFIG.social.tiktok}
                      className="hover:text-gray-300 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="TikTok"
                      onClick={closeFooter}
                    >
                      <TikTokIcon className="h-5 w-5" />
                    </a>
                  </div>
                </div>

                {/* Copyright */}
                <div className="pt-2 border-t border-gray-600">
                  <p className="text-xs text-gray-400">{CONTACT_CONFIG.business.copyright}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      </div>

      {/* Desktop Footer - Static for all pages */}
      <footer className="hidden sm:block bg-black text-white">
        <div className="bg-black">
          <FullFooterContent />
        </div>
      </footer>
    </>
  )
}
