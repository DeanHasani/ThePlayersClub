import { create } from "zustand"
import { addToBagStat } from "./stats"
import type { CartState, CartItem } from "./types"

interface CartStore extends CartState {
  addItem: (item: Omit<CartItem, "id">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  toggleCart: () => void
  clearCart: () => void
  justAdded: boolean
  setJustAdded: (value: boolean) => void
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  total: 0,
  justAdded: false,

  setJustAdded: (value: boolean) => set({ justAdded: value }),

  addItem: (item) => {
    const items = get().items
    const existingItem = items.find(
      (i) => i.productId === item.productId && i.color === item.color && i.size === item.size,
    )

    if (existingItem) {
      set({
        items: items.map((i) => (i.id === existingItem.id ? { ...i, quantity: i.quantity + item.quantity } : i)),
      })
    } else {
      set({
        items: [...items, { ...item, id: Date.now().toString() }],
      })
    }

    // Track add to bag stat
    addToBagStat(item.productId, item.quantity)

    // Recalculate total
    const newItems = get().items
    const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    set({ total, justAdded: true })

    // Reset animation after a short delay
    setTimeout(() => {
      set({ justAdded: false })
    }, 1000)
  },

  removeItem: (id) => {
    const items = get().items.filter((item) => item.id !== id)
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    set({ items, total })
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id)
      return
    }

    const items = get().items.map((item) => (item.id === id ? { ...item, quantity } : item))
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    set({ items, total })
  },

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  clearCart: () => set({ items: [], total: 0 }),
}))
