import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(imageUrl: string | undefined): string {
  if (!imageUrl) return "/placeholder.png"

  // If it's already a placeholder, return as is
  if (imageUrl.includes("placeholder")) return "/placeholder.png"

  // If it's a valid image URL, return it
  return imageUrl
}

export function getProductImageUrl(product: any, index = 0): string {
  if (!product?.colors || product.colors.length === 0) {
    return "/placeholder.png"
  }

  // Get the first color's front image
  const firstColor = product.colors[0]
  if (firstColor?.images?.front && !firstColor.images.front.includes("placeholder.svg")) {
    return firstColor.images.front
  }

  return "/placeholder.png"
}
