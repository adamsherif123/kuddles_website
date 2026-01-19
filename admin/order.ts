import type { Timestamp } from "firebase/firestore"

export type OrderItem = {
  id: string
  name: string
  price: number
  quantity: number
  color?: string
  size?: string
  image?: string
}

export type Order = {
  id: string
  createdAt?: Timestamp | any
  status?: "pending" | "paid" | "failed" | "fulfilled" | "cancelled" | string

  // totals
  subtotal?: number
  shipping?: number
  total?: number
  currency?: string // "EGP" etc

  // items
  items?: OrderItem[]

  // optional customer fields if you store them
  customerName?: string
  customerPhone?: string
  customerEmail?: string
}
