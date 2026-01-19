"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { doc, serverTimestamp, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"

export default function SuccessReturnPage() {
  const router = useRouter()
  const params = useSearchParams()

  const orderId = params.get("orderId")
  const success = params.get("success")

  useEffect(() => {
    ;(async () => {
      if (!orderId) {
        router.replace("/shop")
        return
      }

      // Only update if Paymob explicitly gives true/false
      const shouldUpdate = success === "true" || success === "false"

      if (shouldUpdate) {
        try {
          await updateDoc(doc(db, "orders", orderId), {
            status: success === "true" ? "paid" : "failed",
            paymentStatus: success === "true" ? "paid" : "failed",
            updatedAt: serverTimestamp(),
          })
        } catch {
          // ignore
        }
      }

      // send user to your existing success page
      router.replace(`/checkout/success?orderId=${encodeURIComponent(orderId)}`)
    })()
  }, [orderId, success, router])

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="p-8">
            <h1 className="text-2xl font-bold mb-2">Processing payment…</h1>
            <p className="text-muted-foreground">
              We’re confirming your payment and finalizing your order.
            </p>
          </Card>
        </div>
      </main>
    </>
  )
}
