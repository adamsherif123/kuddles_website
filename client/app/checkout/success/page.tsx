"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CartDrawer } from "@/components/cart-drawer"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Package, Heart, MessageCircle } from "lucide-react"
import Image from "next/image"

type OrderStatus = "created" | "paid" | "failed" | "cash_on_delivery" | "cod" | string

export default function CheckoutSuccessPage() {
  const params = useSearchParams()
  const orderId = params.get("orderId")

  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<OrderStatus>("created")
  const [orderDate, setOrderDate] = useState<Date | null>(null)
  const [orderNumber, setOrderNumber] = useState<string>("")

  useEffect(() => {
    ;(async () => {
      if (!orderId) {
        setLoading(false)
        setStatus("failed")
        return
      }

      try {
        const snap = await getDoc(doc(db, "orders", orderId))
        if (!snap.exists()) {
          setStatus("failed")
          setLoading(false)
          return
        }

        const data: any = snap.data()
        const orderStatus = (data.paymentStatus || data.status || "created") as OrderStatus
        setStatus(orderStatus)

        // Format order number (e.g., #KUD2025001)
        if (orderId) {
          const year = new Date().getFullYear()
          const shortId = orderId.substring(0, 6).toUpperCase()
          setOrderNumber(`#KUD${year}${shortId}`)
        }

        // Get order date
        if (data.createdAt) {
          const timestamp = data.createdAt
          if (timestamp?.toDate) {
            setOrderDate(timestamp.toDate())
          } else if (timestamp?.seconds) {
            setOrderDate(new Date(timestamp.seconds * 1000))
          } else {
            setOrderDate(new Date())
          }
        } else {
          setOrderDate(new Date())
        }
      } catch {
        setStatus("failed")
      } finally {
        setLoading(false)
      }
    })()
  }, [orderId])

  // Only show success page if order was successfully created
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-br from-[var(--brand-blue-light)]/30 via-background to-background flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-foreground/70">Loading order status…</p>
          </div>
        </main>
        <Footer />
        <CartDrawer />
      </>
    )
  }

  if (status === "failed" || !orderId) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-br from-[var(--brand-blue-light)]/30 via-background to-background flex items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center space-y-6">
            <h1 className="text-4xl font-bold text-foreground">Order Not Found</h1>
            <p className="text-foreground/70">We couldn't find your order. Please contact support if you believe this is an error.</p>
            <Button asChild size="lg" className="bg-[var(--brand-coral)] hover:bg-[var(--brand-coral)]/90 text-white">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </main>
        <Footer />
        <CartDrawer />
      </>
    )
  }

  const displayStatus = status === "cash_on_delivery" || status === "cod" ? "Processing" : "Processing"
  const formattedDate = orderDate
    ? orderDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-[var(--brand-blue-light)]/30 via-background to-background flex items-center justify-center px-4">
        {/* Decorative sticker - top right */}
        <div className="absolute top-20 right-10 w-40 h-40 opacity-10 hidden lg:block">
          <Image
            src="/images/stickers-03.png"
            alt="decorative"
            fill
            className="object-contain"
          />
        </div>

        <div className="max-w-2xl w-full text-center space-y-12 relative z-10">
          {/* Success Icon with Animation */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--brand-coral)]/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-[var(--brand-coral)] to-[var(--brand-coral)]/70 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-14 h-14 text-white" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground text-balance">
              Order Confirmed!
            </h1>
            <p className="text-xl text-foreground/70 leading-relaxed">
              Thank you for your purchase! Your order has been successfully placed and we're getting it ready to cuddle its way to you.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-[var(--brand-blue-light)]/20 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Order Number */}
              <div className="space-y-2">
                <p className="text-sm text-foreground/60 uppercase tracking-wider font-semibold">Order Number</p>
                <p className="text-2xl font-bold text-[var(--brand-blue-dark)]">{orderNumber || `#${orderId?.substring(0, 12).toUpperCase()}`}</p>
              </div>

              {/* Order Date */}
              <div className="space-y-2">
                <p className="text-sm text-foreground/60 uppercase tracking-wider font-semibold">Order Date</p>
                <p className="text-2xl font-bold text-[var(--brand-blue-dark)]">
                  {formattedDate}
                </p>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <p className="text-sm text-foreground/60 uppercase tracking-wider font-semibold">Status</p>
                <div className="inline-block bg-[var(--brand-coral)]/10 text-[var(--brand-coral)] px-4 py-2 rounded-full text-sm font-semibold">
                  {displayStatus}
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--brand-blue-light)]/20 pt-6">
              <p className="text-foreground/70 text-sm leading-relaxed">
                We're packing your Kuddles with extra love! You'll receive a shipping confirmation email with tracking information within 24 hours.
              </p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-[var(--brand-blue-light)]/20 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[var(--brand-blue-light)]/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Package className="w-6 h-6 text-[var(--brand-blue-dark)]" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Check Status</h3>
              <p className="text-sm text-foreground/70 mb-4">Track your order in real-time</p>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                View Orders
              </Button>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[var(--brand-blue-light)]/20 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[var(--brand-blue-light)]/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Heart className="w-6 h-6 text-[var(--brand-coral)]" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Care Guide</h3>
              <p className="text-sm text-foreground/70 mb-4">Learn how to care for your Kuddles</p>
              <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                <Link href="/support">Learn More</Link>
              </Button>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[var(--brand-blue-light)]/20 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[var(--brand-blue-light)]/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <MessageCircle className="w-6 h-6 text-[var(--brand-blue-dark)]" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Need Help?</h3>
              <p className="text-sm text-foreground/70 mb-4">Contact our support team</p>
              <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                <Link href="/support">Support Hub</Link>
              </Button>
            </div>
          </div>

          {/* Continue Shopping */}
          <div className="space-y-4">
            <p className="text-foreground/60">Want to explore more Kuddles?</p>
            <Button asChild size="lg" className="bg-[var(--brand-coral)] hover:bg-[var(--brand-coral)]/90 text-white rounded-full font-semibold">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>

          {/* Closing Message */}
          <div className="pt-8 space-y-2">
            <p className="text-foreground/70">Thank you for choosing Kuddles!</p>
            <p className="text-sm text-foreground/50">Every cuddle counts ✨</p>
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
