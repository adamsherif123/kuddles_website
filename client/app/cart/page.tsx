"use client"

import { useMemo, useState } from "react"
import { Navbar } from "@/components/navbar"
import { CartDrawer } from "@/components/cart-drawer"
import { useCart, type ShippingAddress } from "@/lib/cart-context"
import { CartLineItem } from "@/components/cart-line-item"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { createOrder, type PaymentMethod } from "@/lib/orders.firestore"

function validateAddress(a: ShippingAddress) {
  const errors: Partial<Record<keyof ShippingAddress, string>> = {}

  if (!a.fullName.trim()) errors.fullName = "Full name is required"
  if (!a.phone.trim()) errors.phone = "Phone is required"
  if (!a.email?.trim()) errors.email = "Email is required"
  if (a.email && !/^\S+@\S+\.\S+$/.test(a.email)) errors.email = "Enter a valid email"
  if (!a.city.trim()) errors.city = "City is required"
  if (!a.area.trim()) errors.area = "Area is required"
  if (!a.streetAddress.trim()) errors.streetAddress = "Street address is required"

  return errors
}

const emptyAddress: ShippingAddress = {
  fullName: "",
  phone: "",
  email: "",
  city: "",
  area: "",
  streetAddress: "",
  building: "",
  apartment: "",
  floor: "",
  notes: "",
}

export default function CartPage() {
  const router = useRouter()
  const { items, subtotal, setShippingAddress, clearCart } = useCart()

  // NOTE: keep your own shipping rule here
  const shipping = subtotal > 50 ? 0 : 5.99
  const total = subtotal + shipping

  const [address, setAddress] = useState<ShippingAddress>(emptyAddress)
  const [touched, setTouched] = useState<Partial<Record<keyof ShippingAddress, boolean>>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const [placingOrder, setPlacingOrder] = useState(false)
  const [placeError, setPlaceError] = useState<string | null>(null)

  // ✅ Payment method (Paymob card vs COD)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paymob")

  const errors = useMemo(() => validateAddress(address), [address])
  const isValid = Object.keys(errors).length === 0
  const showError = (field: keyof ShippingAddress) => (submitAttempted || touched[field]) && !!errors[field]

  const onChange = (field: keyof ShippingAddress, value: string) => {
    const next = { ...address, [field]: value }
    setAddress(next)
    setShippingAddress(next)
  }

  const handleProceed = async () => {
    setSubmitAttempted(true)
    setPlaceError(null)

    if (items.length === 0) {
      setPlaceError("Your cart is empty.")
      return
    }
    if (!isValid) return

    try {
      setPlacingOrder(true)

      const { orderId } = await createOrder({
        items,
        subtotal,
        shipping,
        total,
        shippingAddress: address,
        paymentMethod,
      })

      // ✅ Clear cart right after creating the order
      clearCart()
      
      // ✅ Clear shipping address from context and reset form
      setShippingAddress(null)
      setAddress(emptyAddress)
      setTouched({})

      // ✅ COD: confirm immediately (NO paymob)
      if (paymentMethod === "cod") {
        router.push(`/checkout/success?orderId=${encodeURIComponent(orderId)}`)
        return
      }

      // ✅ Card: go to paymob flow
      router.push(`/checkout?orderId=${encodeURIComponent(orderId)}`)
    } catch (e: any) {
      setPlaceError(e?.message ?? "Failed to create order. Check Firestore rules / console logs.")
    } finally {
      setPlacingOrder(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-8 md:py-12">
        <div className="container mx-auto px-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold mb-8">Shopping Cart</h1>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-6">Your cart is empty</p>
              <Button asChild size="lg" className="bg-[var(--brand-coral)] hover:bg-[var(--brand-coral)]/90 text-white">
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* LEFT: Shipping + Cart items */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping Address */}
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-4">Shipping Address</h2>

                  <div className="grid grid-cols-1 gap-3">
                    <Input
                      placeholder="Full name *"
                      value={address.fullName}
                      onChange={(e) => onChange("fullName", e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
                      className={showError("fullName") ? "border-red-500" : ""}
                      disabled={placingOrder}
                    />
                    {showError("fullName") && <p className="text-xs text-red-600">{errors.fullName}</p>}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Input
                          placeholder="Phone *"
                          value={address.phone}
                          onChange={(e) => onChange("phone", e.target.value)}
                          onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                          className={showError("phone") ? "border-red-500" : ""}
                          disabled={placingOrder}
                        />
                        {showError("phone") && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                      </div>

                      <div>
                        <Input
                          placeholder="Email *"
                          value={address.email ?? ""}
                          onChange={(e) => onChange("email", e.target.value)}
                          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                          className={showError("email") ? "border-red-500" : ""}
                          disabled={placingOrder}
                        />
                        {showError("email") && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Input
                          placeholder="City *"
                          value={address.city}
                          onChange={(e) => onChange("city", e.target.value)}
                          onBlur={() => setTouched((t) => ({ ...t, city: true }))}
                          className={showError("city") ? "border-red-500" : ""}
                          disabled={placingOrder}
                        />
                        {showError("city") && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
                      </div>

                      <div>
                        <Input
                          placeholder="Area / District *"
                          value={address.area}
                          onChange={(e) => onChange("area", e.target.value)}
                          onBlur={() => setTouched((t) => ({ ...t, area: true }))}
                          className={showError("area") ? "border-red-500" : ""}
                          disabled={placingOrder}
                        />
                        {showError("area") && <p className="text-xs text-red-600 mt-1">{errors.area}</p>}
                      </div>
                    </div>

                    <Input
                      placeholder="Street address * (street, landmark, etc.)"
                      value={address.streetAddress}
                      onChange={(e) => onChange("streetAddress", e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, streetAddress: true }))}
                      className={showError("streetAddress") ? "border-red-500" : ""}
                      disabled={placingOrder}
                    />
                    {showError("streetAddress") && <p className="text-xs text-red-600">{errors.streetAddress}</p>}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input
                        placeholder="Building"
                        value={address.building ?? ""}
                        onChange={(e) => onChange("building", e.target.value)}
                        disabled={placingOrder}
                      />
                      <Input
                        placeholder="Floor"
                        value={address.floor ?? ""}
                        onChange={(e) => onChange("floor", e.target.value)}
                        disabled={placingOrder}
                      />
                      <Input
                        placeholder="Apt"
                        value={address.apartment ?? ""}
                        onChange={(e) => onChange("apartment", e.target.value)}
                        disabled={placingOrder}
                      />
                    </div>

                    <Input
                      placeholder="Notes for the courier (optional)"
                      value={address.notes ?? ""}
                      onChange={(e) => onChange("notes", e.target.value)}
                      disabled={placingOrder}
                    />

                    {!isValid && submitAttempted && (
                      <p className="text-xs text-red-600">Please fill the required shipping fields marked with *</p>
                    )}

                    {placeError && <p className="text-sm text-red-600">{placeError}</p>}
                  </div>
                </Card>

                {/* Cart Items */}
                <Card className="p-6">
                  <div className="space-y-6">
                    {items.map((item, index) => (
                      <CartLineItem key={`${item.id}-${item.color}-${item.size}-${index}`} item={item} />
                    ))}
                  </div>
                </Card>
              </div>

              {/* RIGHT: Order Summary */}
              <div>
                <Card className="p-6 sticky top-24">
                  <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{subtotal.toFixed(2)} EGP</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">{shipping === 0 ? "FREE" : `${shipping.toFixed(2)} EGP`}</span>
                    </div>

                    {subtotal < 50 && subtotal > 0 && (
                      <p className="text-xs text-[var(--brand-coral)]">
                        Add {(50 - subtotal).toFixed(2)} EGP more for free shipping!
                      </p>
                    )}

                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>{total.toFixed(2)} EGP</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <Input placeholder="Coupon code" disabled={placingOrder} />
                    <Button variant="outline" className="w-full bg-transparent" disabled={placingOrder}>
                      Apply Coupon
                    </Button>
                  </div>

                  {/* ✅ Payment Method */}
                  <div className="mt-6 mb-6">
                    <p className="text-sm font-semibold mb-3">Payment Method</p>

                    <div className="space-y-2">
                      {/* Card (disabled / coming soon) */}
                      <div className="rounded-lg border border-border p-3 opacity-50 select-none">
                        <div className="flex items-start gap-3">
                          <input type="radio" name="paymentMethod" disabled checked={false} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">Credit / Debit Card</p>
                              <span className="text-xs px-2 py-0.5 rounded-full border border-border">
                                Coming soon
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Secure payment via Paymob (not enabled yet)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* COD (active) */}
                      <label className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={() => setPaymentMethod("cod")}
                          disabled={placingOrder}
                        />
                        <div>
                          <p className="font-medium">Payment on Delivery</p>
                          <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-[var(--brand-coral)] hover:bg-[var(--brand-coral)]/90 text-white"
                    onClick={handleProceed}
                    disabled={placingOrder}
                  >
                    {placingOrder
                      ? "Creating Order…"
                      : paymentMethod === "cod"
                        ? "Place Order (Payment on Delivery)"
                        : "Proceed to Checkout"}
                  </Button>

                  <div className="mt-6 text-xs text-muted-foreground text-center">
                    <p>
                      {paymentMethod === "cod"
                        ? "Pay with cash or card when your order arrives."
                        : "Secure checkout powered by Paymob"}
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <CartDrawer />
    </>
  )
}
