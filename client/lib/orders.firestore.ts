import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { ShippingAddress } from "@/lib/cart-context"

export type OrderItem = {
  id: string
  name: string
  price: number
  image: string
  color: string
  size: string
  quantity: number
}

export type PaymentMethod = "paymob" | "cod"

export type CreateOrderInput = {
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  shippingAddress: ShippingAddress
  paymentMethod: PaymentMethod
}

export async function createOrder(input: CreateOrderInput): Promise<{ orderId: string }> {
  const { items, subtotal, shipping, total, shippingAddress, paymentMethod } = input

  // COD orders should not go to paymob at all
  const isCOD = paymentMethod === "cod"

  const orderRef = await addDoc(collection(db, "orders"), {
    // ✅ main fields
    source: "client",
    currency: "EGP",
    subtotal,
    shipping,
    total,

    // ✅ payment
    paymentProvider: isCOD ? "cash_on_delivery" : "paymob",
    paymentMethod: paymentMethod, // "cod" | "paymob"
    paymentStatus: isCOD ? "cod" : "unpaid", // for paymob flow you already update to pending/paid/failed later

    // ✅ status (you asked: status should be cash on delivery)
    status: isCOD ? "cash_on_delivery" : "created",

    // store items on the order (admin-friendly)
    items: items.map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      image: i.image,
      color: i.color,
      size: i.size,
      quantity: i.quantity,
      lineTotal: Number(i.price) * Number(i.quantity),
    })),

    // quick customer fields for dashboard table
    customer: {
      fullName: shippingAddress.fullName ?? "",
      phone: shippingAddress.phone ?? "",
      email: shippingAddress.email ?? "",
      city: shippingAddress.city ?? "",
      area: shippingAddress.area ?? "",
    },

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  // orders/{orderId}/shipping/address
  await setDoc(doc(db, "orders", orderRef.id, "shipping", "address"), {
    ...shippingAddress,
    createdAt: serverTimestamp(),
  })

  return { orderId: orderRef.id }
}
