import type { Product } from "./types"

export const products: Product[] = [
  {
    id: "1",
    name: "JOKER TEE",
    price: 45,
    images: ["/placeholder.svg?height=600&width=600"],
    category: "tshirts",
    colors: [
      { name: "Black", value: "#000000", image: "/placeholder.svg?height=600&width=600" },
      { name: "White", value: "#FFFFFF", image: "/placeholder.svg?height=600&width=600" },
      { name: "Navy", value: "#1a1a2e", image: "/placeholder.svg?height=600&width=600" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    availableSizes: ["S", "M", "L"], // Only these sizes are in stock
    description: "Relaxed fit tee in midweight 200gsm cotton jersey",
    details: [
      "Screenprinted graphics at front and back",
      "Shortsleeve",
      "Ribbed crewneck",
      "Unisex",
      "Material: 100% cotton",
      "Imported",
    ],
    inStock: true,
    slug: "joker-tee",
    addedToBagCount: 15,
    checkoutCount: 8,
  },
  {
    id: "2",
    name: "SPADE TEE PIGMENT DYED",
    price: 45,
    images: ["/placeholder.svg?height=600&width=600"],
    category: "tshirts",
    colors: [
      { name: "Black", value: "#000000", image: "/placeholder.svg?height=600&width=600" },
      { name: "Slate", value: "#708090", image: "/placeholder.svg?height=600&width=600" },
      { name: "Purple", value: "#9370DB", image: "/placeholder.svg?height=600&width=600" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    availableSizes: ["M", "L", "XL"],
    description: "Pigment dyed tee with spade graphic",
    details: [
      "Pigment dyed for vintage feel",
      "Screenprinted graphics",
      "Relaxed fit",
      "Material: 100% cotton",
      "Imported",
    ],
    inStock: true,
    slug: "spade-tee-pigment-dyed",
    addedToBagCount: 12,
    checkoutCount: 10,
  },
  {
    id: "3",
    name: "WATER SHORT STOCK",
    price: 70,
    images: ["/placeholder.svg?height=600&width=600"],
    category: "pants",
    colors: [{ name: "Black", value: "#000000", image: "/placeholder.svg?height=600&width=600" }],
    sizes: ["S", "M", "L", "XL", "XXL"],
    availableSizes: ["S", "M", "L", "XL", "XXL"],
    description: "Water resistant shorts for active wear",
    details: ["Water resistant fabric", "Elastic waistband", "Side pockets", "Material: Polyester blend", "Imported"],
    inStock: true,
    slug: "water-short-stock",
    addedToBagCount: 8,
    checkoutCount: 5,
  },
]

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find((product) => product.slug === slug)
}

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter((product) => product.category === category)
}

export const updateProduct = (updatedProduct: Product): void => {
  const index = products.findIndex((p) => p.id === updatedProduct.id)
  if (index !== -1) {
    products[index] = updatedProduct
  }
}

export const addProduct = (product: Product): void => {
  products.push(product)
}

export const deleteProduct = (id: string): void => {
  const index = products.findIndex((p) => p.id === id)
  if (index !== -1) {
    products.splice(index, 1)
  }
}
