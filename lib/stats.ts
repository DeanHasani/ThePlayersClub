import type { StatsData, Product } from "./types"

const STATS_KEY = "players-club-stats"
const ORDERS_KEY = "players-club-orders"

// Get stats from localStorage
export const getStats = (): StatsData => {
  if (typeof window === "undefined") {
    return { totalRevenue: 0, totalCheckouts: 0, productStats: {} }
  }

  try {
    const stored = localStorage.getItem(STATS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    // Fail silently if localStorage is unavailable
  }

  return { totalRevenue: 0, totalCheckouts: 0, productStats: {} }
}

// Save stats to localStorage
const saveStats = (stats: StatsData): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch (error) {
    // Fail silently if localStorage is unavailable
  }
}

// Get recent orders from localStorage
export const getRecentOrders = (): any[] => {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const stored = localStorage.getItem(ORDERS_KEY)
    if (stored) {
      const orders = JSON.parse(stored)
      // Return last 10 orders, sorted by timestamp (newest first)
      return orders
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)
    }
  } catch (error) {
    // Fail silently if localStorage is unavailable
  }

  return []
}

// Save order to localStorage
const saveOrder = (order: any): void => {
  if (typeof window === "undefined") return

  try {
    const existingOrders = getRecentOrders()
    const updatedOrders = [order, ...existingOrders].slice(0, 50) // Keep last 50 orders
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders))
  } catch (error) {
    // Fail silently if localStorage is unavailable
  }
}

// Add checkout (called when WhatsApp/Email is pressed)
export const addCheckout = (items: any[], total: number): void => {
  const stats = getStats()

  stats.totalRevenue += total
  stats.totalCheckouts += 1

  // Update product-specific stats
  items.forEach((item) => {
    const productId = item.productId
    if (!stats.productStats[productId]) {
      stats.productStats[productId] = { addedToBag: 0, checkouts: 0 }
    }
    stats.productStats[productId].checkouts += item.quantity
  })

  saveStats(stats)

  // Save order details
  const order = {
    timestamp: new Date().toISOString(),
    items,
    total,
    method: "whatsapp", // or "email" depending on how they checkout
  }
  saveOrder(order)
}

// Add to bag tracking
export const addToBagStat = (productId: string, quantity = 1): void => {
  const stats = getStats()

  if (!stats.productStats[productId]) {
    stats.productStats[productId] = { addedToBag: 0, checkouts: 0 }
  }

  stats.productStats[productId].addedToBag += quantity
  saveStats(stats)
}

// Reset all stats
export const resetStats = (): void => {
  const emptyStats: StatsData = { totalRevenue: 0, totalCheckouts: 0, productStats: {} }
  saveStats(emptyStats)
  // Also clear orders
  if (typeof window !== "undefined") {
    localStorage.removeItem(ORDERS_KEY)
  }
}

// Subtract from stats (for corrections)
export const subtractFromStats = (revenue: number, checkouts: number): void => {
  const stats = getStats()

  stats.totalRevenue = Math.max(0, stats.totalRevenue - revenue)
  stats.totalCheckouts = Math.max(0, stats.totalCheckouts - checkouts)

  saveStats(stats)
}

// Get most added to bag product
export const getMostAddedToBagProduct = async (products: Product[]): Promise<Product | null> => {
  const stats = getStats()
  let maxAddedToBag = 0
  let mostAddedProduct: Product | null = null

  for (const product of products) {
    const productId = product._id || product.id
    if (!productId) continue

    const productStats = stats.productStats[productId] || { addedToBag: 0, checkouts: 0 }
    if (productStats.addedToBag > maxAddedToBag) {
      maxAddedToBag = productStats.addedToBag
      mostAddedProduct = { ...product, addedToBagCount: productStats.addedToBag }
    }
  }

  return mostAddedProduct
}

// Get most checkout product
export const getMostCheckoutProduct = async (products: Product[]): Promise<Product | null> => {
  const stats = getStats()
  let maxCheckouts = 0
  let mostCheckoutProduct: Product | null = null

  for (const product of products) {
    const productId = product._id || product.id
    if (!productId) continue

    const productStats = stats.productStats[productId] || { addedToBag: 0, checkouts: 0 }
    if (productStats.checkouts > maxCheckouts) {
      maxCheckouts = productStats.checkouts
      mostCheckoutProduct = { ...product, checkoutCount: productStats.checkouts }
    }
  }

  return mostCheckoutProduct
}
