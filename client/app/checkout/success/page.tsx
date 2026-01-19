"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"

type OrderStatus = "created" | "paid" | "failed" | string

export default function CheckoutSuccessPage() {
  const params = useSearchParams()
  const orderId = params.get("orderId")

  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<OrderStatus>("created")
  const [total, setTotal] = useState<number | null>(null)
  const [currency, setCurrency] = useState<string>("EGP")

  const title = useMemo(() => {
    if (status === "paid") return "Payment successful 🎉"
    if (status === "failed") return "Payment failed"
    return "Order status"
  }, [status])

  const subtitle = useMemo(() => {
    if (status === "paid") return "Your order has been confirmed."
    if (status === "failed") return "Your payment didn’t go through. You can try again."
    return "We’re checking your order status."
  }, [status])

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
        setStatus((data.paymentStatus || data.status || "created") as OrderStatus)

        const t = Number(data.total ?? data.subtotal ?? 0)
        setTotal(Number.isFinite(t) ? t : null)

        setCurrency(String(data.currency || "EGP"))
      } catch {
        setStatus("failed")
      } finally {
        setLoading(false)
      }
    })()
  }, [orderId])

  const formattedTotal =
    total == null
      ? null
      : new Intl.NumberFormat("en-EG", {
          style: "currency",
          currency: currency || "EGP",
          maximumFractionDigits: 2,
        }).format(total)

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="p-8">
            <h1 className="text-2xl font-bold mb-2">{title}</h1>
            <p className="text-muted-foreground mb-6">{subtitle}</p>

            {orderId && (
              <div className="text-sm mb-4">
                <div className="text-muted-foreground">Order ID</div>
                <div className="font-mono break-all">{orderId}</div>
              </div>
            )}

            {!loading && formattedTotal && (
              <div className="text-sm mb-6">
                <div className="text-muted-foreground">Total</div>
                <div className="font-semibold">{formattedTotal}</div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-white"
              >
                Continue shopping
              </Link>
            </div>

            {loading && (
              <p className="mt-6 text-sm text-muted-foreground">
                Loading order status…
              </p>
            )}
          </Card>
        </div>
      </main>
    </>
  )
}
