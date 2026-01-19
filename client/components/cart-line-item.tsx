"use client"

import { useMemo, useEffect, useState } from "react"
import Image from "next/image"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { fetchProductById } from "@/lib/products.firestore"
import type { Product } from "@/lib/products"

type CartItem = {
  id: string
  productId?: string // Optional for backward compatibility
  name: string
  price: number
  image: string
  color: string
  size: string
  quantity: number
}

export function CartLineItem({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch product data to get stock information
  useEffect(() => {
    if (!item.productId) {
      setLoading(false)
      return
    }

    let mounted = true
    setLoading(true)
    
    fetchProductById(item.productId)
      .then((p) => {
        if (mounted && p) setProduct(p)
      })
      .catch(() => {
        // Silently fail - will default to unlimited stock
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [item.productId])

  // Get available stock quantity for this item's color and size
  const getAvailableStock = useMemo(() => {
    if (!product?.stockBySize) return Infinity // If no stock data, allow unlimited
    
    // Try different key formats: "color-size", "size", or "color"
    const stockKey1 = `${item.color}-${item.size}`
    const stockKey2 = item.size
    const stockKey3 = item.color
    
    const stock = product.stockBySize[stockKey1] ?? 
                  product.stockBySize[stockKey2] ?? 
                  product.stockBySize[stockKey3] ?? 
                  0
    
    return Math.max(0, stock) // Ensure non-negative
  }, [product?.stockBySize, item.color, item.size])

  // Cap quantity if it exceeds available stock
  useEffect(() => {
    if (item.quantity > getAvailableStock && getAvailableStock > 0 && getAvailableStock !== Infinity) {
      updateQuantity(item.id, item.color, item.size, getAvailableStock)
    }
  }, [getAvailableStock, item.quantity, item.id, item.color, item.size, updateQuantity])

  return (
    <div className="flex gap-4 pb-4 border-b border-border">
      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm mb-1 truncate">{item.name}</h3>
        <p className="text-xs text-muted-foreground mb-2">
          {item.color} • {item.size}
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 bg-transparent"
              onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 bg-transparent"
              onClick={() => updateQuantity(item.id, item.color, item.size, Math.min(getAvailableStock, item.quantity + 1))}
              disabled={item.quantity >= getAvailableStock}
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 ml-auto"
              onClick={() => removeItem(item.id, item.color, item.size)}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
          {getAvailableStock !== Infinity && item.quantity >= getAvailableStock && (
            <p className="text-xs text-muted-foreground">Maximum stock reached</p>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-semibold text-sm">{(item.price * item.quantity).toFixed(2)} EGP</p>
      </div>
    </div>
  )
}
