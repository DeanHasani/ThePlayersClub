export interface Product {
  _id?: string
  id?: string
  name: string
  price: number
  images: string[]
  category: "tshirts" | "hoodies" | "pants"
  colors: Color[]
  sizes: string[]
  availableSizes: string[]
  description: string
  details: string[]
  inStock: boolean
  slug: string
  addedToBagCount?: number
  checkoutCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface Color {
  name: string
  value: string
  images: ColorImages
}

export interface ColorImages {
  front: string
  back: string
  optional?: string[]
}

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  color: string
  size: string
  quantity: number
  image: string
  productUrl?: string
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
  total: number
}

export interface AdminStats {
  totalCheckouts: number
  mostAddedToBag: Product | null
  mostCheckout: Product | null
  totalProducts: number
  totalRevenue: number
}

export interface StatsData {
  totalRevenue: number
  totalCheckouts: number
  productStats: {
    [productId: string]: {
      addedToBag: number
      checkouts: number
    }
  }
}
