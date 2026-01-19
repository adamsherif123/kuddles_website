"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { CartLineItem } from "@/components/cart-line-item"
import Link from "next/link"

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, subtotal } = useCart()

  if (!isCartOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50 animate-fade-in" onClick={() => setIsCartOpen(false)} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-50 shadow-2xl animate-slide-in-from-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">Shopping Cart ({items.length})</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Button asChild onClick={() => setIsCartOpen(false)}>
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <CartLineItem key={`${item.id}-${item.color}-${item.size}-${index}`} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-6 space-y-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)} EGP</span>
            </div>
            <Button
              asChild
              size="lg"
              className="w-full bg-[var(--brand-coral)] hover:bg-[var(--brand-coral)]/90 text-white"
              onClick={() => setIsCartOpen(false)}
            >
              <Link href="/cart">View Cart & Checkout</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
