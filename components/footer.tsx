"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { MessageCircle, Mail, Facebook, Instagram } from "lucide-react"
import { CONTACT_CONFIG } from "@/lib/config"

// Custom TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.321 5.562a5.124 5.124 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.849-1.294-1.98-1.294-3.338h-3.239v14.19c0 1.308-1.065 2.372-2.372 2.372s-2.372-1.064-2.372-2.372c0-1.308 1.065-2.372 2.372-2.372.131 0 .258.011.382.031V9.611a5.612 5.612 0 0 0-.382-.013c-3.097 0-5.611 2.514-5.611 5.611s2.514 5.611 5.611 5.611 5.611-2.514 5.611-5.611V9.804a9.65 9.65 0 0 0 5.015 1.383V8.003a6.229 6.229 0 0 1-2.141-.441z" />
  </svg>
)

export default function Footer() {
  const [isExpanded, setIsExpanded] = useState(false)
  const pathname = usePathname()

  const shouldShowFooter = () => {
    if (pathname.startsWith("/dashboard")) return false
    if (pathname.match(/^\/shop\/[^/]+\/[^/]+$/)) return false
    return true
  }

  if (!shouldShowFooter()) return null

  const toggleFooter = () => setIsExpanded(!isExpanded)
  const closeFooter = () => setIsExpanded(false)

  // Desktop Footer (unchanged)
  const DesktopFooterContent = () => (
    <div className="px-8 py-12 sm:px-12 sm:py-16">
      <div className="flex justify-center gap-16 mb-20">
        <div className="text-center">
          <img src="/giftbox.gif" className="mx-auto w-32 h-32 object-contain block" />
          <p className="mt-3 text-sm">EXTRA GIFTS</p>
        </div>
        <div className="text-center">
          <img src="/van.gif" className="mx-auto w-32 h-32 object-contain block" />
          <p className="mt-3 text-sm">FAST SHIPPING</p>
        </div>
        <div className="text-center">
          <img src="/material.gif" className="mx-auto w-32 h-32 object-contain block" />
          <p className="mt-3 text-sm">TOP MATERIAL</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-12 max-w-5xl mx-auto text-center">
        <div>
          <h3 className="text-base font-semibold tracking-wider mb-4">CONTACT US:</h3>
          <div className="space-y-3 text-base">
            <div className="flex items-center justify-center space-x-2">
              <MessageCircle className="h-5 w-5 flex-shrink-0" />
              <a
                href={`https://wa.me/${CONTACT_CONFIG.whatsapp.number}`}
                className="hover:text-gray-300 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {CONTACT_CONFIG.whatsapp.displayNumber}
              </a>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Mail className="h-5 w-5 flex-shrink-0" />
              <a
                href={`mailto:${CONTACT_CONFIG.email.address}`}
                className="hover:text-gray-300 transition-colors"
              >
                {CONTACT_CONFIG.email.displayName}
              </a>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold tracking-wider mb-4">ABOUT US:</h3>
          <div className="space-y-3 text-base">
            <Link href="/info/about-us" className="block hover:text-white transition-colors">About Us</Link>
            <Link href="/info/terms-conditions" className="block hover:text-white transition-colors">Terms & Conditions</Link>
            <Link href="/info/privacy-policy" className="block hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold tracking-wider mb-4">SOCIAL LINKS:</h3>
          <div className="flex justify-center space-x-4">
            <a href={CONTACT_CONFIG.social.facebook} className="hover:text-gray-300 transition-colors" target="_blank" rel="noopener noreferrer">
              <Facebook className="h-6 w-6" />
            </a>
            <a href={CONTACT_CONFIG.social.instagram} className="hover:text-gray-300 transition-colors" target="_blank" rel="noopener noreferrer">
              <Instagram className="h-6 w-6" />
            </a>
            <a href={CONTACT_CONFIG.social.tiktok} className="hover:text-gray-300 transition-colors" target="_blank" rel="noopener noreferrer">
              <TikTokIcon className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
      <div className="pt-8 mt-10 border-t border-gray-600 text-center">
        <p className="text-sm text-gray-400">{CONTACT_CONFIG.business.copyright}</p>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Footer */}
      <div className="sm:hidden bg-black text-white border-t border-gray-700">
        {/* Tap button */}
        <div className="px-4 py-3 flex justify-center">
          <button
            onClick={toggleFooter}
            className="flex items-center gap-2 text-xs font-semibold tracking-wider"
          >
            {isExpanded ? "CLOSE" : "TAP FOR MORE INFO"}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} />
            </svg>
          </button>
        </div>

        {/* Expanded info */}
        {isExpanded && (
          <div className="px-6 py-6 bg-black">
            {/* Contact Section */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold tracking-wider mb-2 text-gray-300">CONTACT US:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4" />
                    <a href={`https://wa.me/${CONTACT_CONFIG.whatsapp.number}`} className="hover:text-gray-300" target="_blank" rel="noopener noreferrer">
                      {CONTACT_CONFIG.whatsapp.displayNumber}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${CONTACT_CONFIG.email.address}`} className="hover:text-gray-300">{CONTACT_CONFIG.email.displayName}</a>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div>
                <h4 className="text-xs font-semibold tracking-wider mb-2 text-gray-300">ABOUT US:</h4>
                <div className="space-y-1 text-sm">
                  <Link href="/info/about-us" onClick={closeFooter} className="block hover:text-white">About Us</Link>
                  <Link href="/info/terms-conditions" onClick={closeFooter} className="block hover:text-white">Terms & Conditions</Link>
                  <Link href="/info/privacy-policy" onClick={closeFooter} className="block hover:text-white">Privacy Policy</Link>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h4 className="text-xs font-semibold tracking-wider mb-2 text-gray-300">SOCIAL LINKS:</h4>
                <div className="flex space-x-4">
                  <a href={CONTACT_CONFIG.social.facebook} target="_blank" rel="noopener noreferrer"><Facebook className="h-5 w-5" /></a>
                  <a href={CONTACT_CONFIG.social.instagram} target="_blank" rel="noopener noreferrer"><Instagram className="h-5 w-5" /></a>
                  <a href={CONTACT_CONFIG.social.tiktok} target="_blank" rel="noopener noreferrer"><TikTokIcon className="h-5 w-5" /></a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GIFs + small captions */}
        <div className="px-5 py-3 flex flex-col items-center gap-3">
          <div className="flex justify-center gap-4">
            <div className="text-center">
              <img src="/giftbox.gif" className="w-12 h-12 mx-auto" />
              <p className="text-[9px] mt-2">EXTRA GIFTS</p>
            </div>
            <div className="text-center">
              <img src="/van.gif" className="w-12 h-12 mx-auto" />
              <p className="text-[9px] mt-2">FAST SHIPPING</p>
            </div>
            <div className="text-center">
              <img src="/material.gif" className="w-12 h-12 mx-auto" />
              <p className="text-[9px] mt-2">TOP MATERIAL</p>
            </div>
          </div>

          {/* Copyright BELOW GIFs */}
          <div className="mt-2 w-full text-center py-2 border-t border-gray-600">
            <p className="text-xs text-gray-400">{CONTACT_CONFIG.business.copyright}</p>
          </div>
        </div>
      </div>

      {/* Desktop Footer */}
      <footer className="hidden sm:block bg-black text-white">
        <DesktopFooterContent />
      </footer>
    </>
  )
}