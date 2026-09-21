import { create } from 'zustand'
import { shopProducts, type ShopProduct } from '@/data/shop'

export interface CartItem extends ShopProduct {
  qty: number
  checked: boolean
}

interface CartState {
  items: CartItem[]
  setQty: (id: string, qty: number) => void
  toggleChecked: (id: string, checked: boolean) => void
}

const seed: CartItem[] = shopProducts.slice(0, 3).map((p, i) => ({
  ...p,
  qty: i === 0 ? 2 : 1,
  checked: true,
}))

export const useCartStore = create<CartState>((set) => ({
  items: seed,
  setQty: (id, qty) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, qty: Math.max(1, qty) } : item)),
    })),
  toggleChecked: (id, checked) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, checked } : item)),
    })),
}))
