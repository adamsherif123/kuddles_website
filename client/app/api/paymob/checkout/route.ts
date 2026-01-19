import { NextResponse } from "next/server"
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export const runtime = "nodejs"

const AUTH_URL = "https://accept.paymob.com/api/auth/tokens"
const ORDER_URL = "https://accept.paymob.com/api/ecommerce/orders"
const PAYMENT_KEY_URL = "https://accept.paymob.com/api/acceptance/payment_keys"

function splitName(fullName?: string) {
  const name = String(fullName ?? "").trim()
  if (!name) return { first_name: "Customer", last_name: "Kuddles" }
  const parts = name.split(/\s+/)
  if (parts.length === 1) return { first_name: parts[0], last_name: "Kuddles" }
  return { first_name: parts[0], last_name: parts.slice(1).join(" ") }
}

function toCents(amount: number) {
  return String(Math.round(Number(amount || 0) * 100))
}

function nonEmpty(value: any, fallback: string) {
  const v = String(value ?? "").trim()
  return v.length ? v : fallback
}


function normalizeEGPhone(phoneRaw: string) {
  const p = String(phoneRaw || "").trim()
  if (!p) return "+201000000000"
  if (p.startsWith("+")) return p
  if (p.startsWith("0")) return `+20${p.slice(1)}`
  return `+20${p}`
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const orderId = url.searchParams.get("orderId")
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 })

    // keep for now (move to env later)
    const apiKey =
      "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRBM05qRTJOaXdpYm1GdFpTSTZJbWx1YVhScFlXd2lmUS5yMzVuZGl6c0pKTmxuS3czaFNNZWJKMFJGazkwdFgxX0p4bjZ1T2phaW82V1J6cy1hMGdTelVpLXY5bE4xVktzdF9Id2IxbGZ3Qlh1UjA4RnAxWlZrdw=="
    const integrationId = Number("5274250")
    const iframeId = "959459" // if your working one is 959460, set it to that
    const currency = "EGP"

    // 1) Load order
    const orderRef = doc(db, "orders", orderId)
    const snap = await getDoc(orderRef)
    if (!snap.exists()) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    const order = snap.data() as any
    const total = Number(order.total ?? order.subtotal ?? 0)
    const amount_cents = toCents(total)

    // 2) Load shipping
    const customer = order.customer ?? {}
    const { first_name, last_name } = splitName(customer.fullName)

    const shippingRef = doc(db, "orders", orderId, "shipping", "address")
    const shippingSnap = await getDoc(shippingRef)
    const shipping = (shippingSnap.exists() ? shippingSnap.data() : {}) as any

    const phone = normalizeEGPhone(
        nonEmpty(shipping.phone ?? customer.phone, "01000000000")
    )
    
    const email = nonEmpty(
        shipping.email ?? customer.email,
        "customer@kuddles.com"
    )
    
    const city = nonEmpty(
        shipping.city ?? customer.city,
        "Cairo"
    )
    
    const area = nonEmpty(
        shipping.area ?? customer.area,
        "Cairo"
    )
    
    const street = nonEmpty(shipping.streetAddress, "N/A")
    const building = nonEmpty(shipping.building, "N/A")
    const floor = nonEmpty(shipping.floor, "N/A")
    const apartment = nonEmpty(shipping.apartment, "N/A")

    // 3) Auth
    const authRes = await fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey }),
    })
    const authJson = await authRes.json()
    if (!authRes.ok) {
      return NextResponse.json({ error: "Paymob auth failed", details: authJson }, { status: 502 })
    }
    const auth_token = authJson.token as string

    // 4) REUSE Paymob order if it exists to avoid duplicates
    let paymob_order_id: number | null = order?.paymob?.orderId ?? null
    let merchant_order_id: string | null = order?.paymob?.merchantOrderId ?? null

    // 5) Create Paymob order only once
    if (!paymob_order_id) {
      merchant_order_id = `kuddles_${orderId}_${Date.now()}` // ✅ UNIQUE

      const paymobOrderRes = await fetch(ORDER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth_token,
          delivery_needed: false,
          amount_cents,
          currency,
          merchant_order_id,
          items: [],
        }),
      })

      const paymobOrderJson = await paymobOrderRes.json()
      if (!paymobOrderRes.ok) {
        return NextResponse.json(
          { error: "Paymob order create failed", details: paymobOrderJson },
          { status: 502 }
        )
      }

      paymob_order_id = paymobOrderJson.id

      await updateDoc(orderRef, {
        paymentProvider: "paymob",
        paymentStatus: "pending",
        paymob: { orderId: paymob_order_id, merchantOrderId: merchant_order_id },
        updatedAt: serverTimestamp(),
      })
    }

    // 6) Payment key (new token every time is ok)
    const redirection_url = `http://localhost:3000/success?orderId=${encodeURIComponent(orderId)}`

    const paymentKeyRes = await fetch(PAYMENT_KEY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token,
        amount_cents,
        expiration: 3600,
        order_id: paymob_order_id,
        currency,
        integration_id: integrationId,
        lock_order_when_paid: true,
        redirection_url, // ✅ like your old project
        billing_data: {
          apartment,
          email,
          floor,
          first_name,
          street,
          building,
          phone_number: phone,
          shipping_method: "PKG",
          postal_code: "00000",
          city,
          country: "EG",
          last_name,
          state: area,
        },
      }),
    })

    const paymentKeyJson = await paymentKeyRes.json()
    if (!paymentKeyRes.ok) {
      return NextResponse.json(
        { error: "Paymob payment key failed", details: paymentKeyJson },
        { status: 502 }
      )
    }

    const payment_token = paymentKeyJson.token as string

    const redirectUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${encodeURIComponent(
      payment_token
    )}`

    return NextResponse.json({ redirectUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 })
  }
}
