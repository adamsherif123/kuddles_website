"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Sticker } from "@/components/sticker"

export default function CheckoutPage() {
  const params = useSearchParams()
  const orderId = params.get("orderId")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) {
      setError("Missing orderId")
      return
    }

    ;(async () => {
      try {
        const res = await fetch(`/api/paymob/checkout?orderId=${encodeURIComponent(orderId)}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error ?? "Failed to start Paymob checkout")
        if (!json.redirectUrl) throw new Error("Missing redirectUrl from server")
        window.location.href = json.redirectUrl
      } catch (e: any) {
        setError(e?.message ?? "Checkout failed")
      }
    })()
  }, [orderId])

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="p-8 relative overflow-hidden">
            <Sticker
              src="/images/circularlogo.png"
              alt="Kuddles"
              size="lg"
              position="top-left"
              hideOnMobile
              className="opacity-10"
            />
            <h1 className="text-2xl font-bold mb-2">Redirecting to Paymob…</h1>
            <p className="text-muted-foreground">
              Please don’t close this page. We’re opening the secure payment page.
            </p>

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
          </Card>
        </div>
      </main>
    </>
  )
}
