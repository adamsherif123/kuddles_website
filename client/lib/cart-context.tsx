"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"

type CartItem = {
  id: string
  productId: string // Store product ID to fetch stock data
  name: string
  price: number
  image: string
  color: string
  size: string
  quantity: number
}

export type ShippingAddress = {
  fullName: string
  phone: string
  email?: string
  city: string
  area: string
  streetAddress: string
  building?: string
  apartment?: string
  floor?: string
  notes?: string
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string, color: string, size: string) => void
  updateQuantity: (id: string, color: string, size: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void

  // ✅ new
  shippingAddress: ShippingAddress | null
  setShippingAddress: (addr: ShippingAddress | null) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const LS_CART_KEY = "kuddles_cart_v1"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null)

  // ✅ Load persisted cart once (address is NOT persisted)
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(LS_CART_KEY)
      if (savedCart) setItems(JSON.parse(savedCart) as CartItem[])
    } catch {}
    // Note: Shipping address is NOT loaded from localStorage - it should be fresh each time
  }, [])

  // ✅ Persist cart
  useEffect(() => {
    try {
      localStorage.setItem(LS_CART_KEY, JSON.stringify(items))
    } catch {}
  }, [items])

  // Note: Shipping address is NOT persisted to localStorage - it should be cleared after each order

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id && i.color === item.color && i.size === item.size)
      if (existingIndex > -1) {
        const updated = [...prev]
        updated[existingIndex].quantity += item.quantity
        return updated
      }
      return [...prev, item]
    })
  }

  const removeItem = (id: string, color: string, size: string) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.color === color && i.size === size)))
  }

  const updateQuantity = (id: string, color: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id, color, size)
      return
    }
    setItems((prev) => prev.map((i) => (i.id === id && i.color === color && i.size === size ? { ...i, quantity } : i)))
  }

  const clearCart = () => setItems([])

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        shippingAddress,
        setShippingAddress,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within CartProvider")
  return context
}
