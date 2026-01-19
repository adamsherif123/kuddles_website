import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, Timestamp, updateDoc } from "firebase/firestore"
import { db } from "../firebase/firebase"
import type { Order } from "../../order"

export type ShippingAddress = {
  id?: string
  streetAddress?: string
  building?: string
  floor?: string
  apartment?: string
  area?: string
  city?: string
  fullName?: string
  phone?: string
  email?: string
  notes?: string
}
  
  // Map Firestore doc -> Order
  function mapOrder(d: any): Order {
    const data = d.data()
    return { id: d.id, ...data } as Order
  }
  
  // Real-time orders list
  export function listenOrders(onData: (orders: Order[]) => void, onError?: (err: any) => void) {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"))
    return onSnapshot(q, (snap) => onData(snap.docs.map(mapOrder)), (err) => onError?.(err))
  }
  
  // Fetch once (if you don't want realtime somewhere)
  export async function fetchOrdersOnce(): Promise<Order[]> {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"))
    const snap = await getDocs(q)
    return snap.docs.map(mapOrder)
  }
  
  // Optional: read shipping address subcollection for an order
  export async function fetchOrderShippingAddress(orderId: string): Promise<ShippingAddress | null> {
    const addressRef = doc(db, "orders", orderId, "shipping", "address")
    const snap = await getDoc(addressRef)
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() } as ShippingAddress
  }
  
  // Dashboard aggregation (client-side aggregation)
  export function computeDashboard(orders: Order[]) {
    const totalOrders = orders.length
  
    const grossRevenue = orders.reduce((sum, o) => sum + Number(o.total ?? o.subtotal ?? 0), 0)
  
    const avgOrderValue = totalOrders ? grossRevenue / totalOrders : 0
  
    const pendingOrders = orders.filter((o) => (o.status ?? "pending") === "pending").length
  
    // group by date (YYYY-MM-DD)
    const byDay: Record<string, { orders: number; revenue: number }> = {}
    for (const o of orders) {
      const ts: any = o.createdAt
      const date =
        ts?.toDate?.() instanceof Date
          ? ts.toDate()
          : ts instanceof Date
            ? ts
            : null
  
      const key = date
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
        : "unknown"
  
      if (!byDay[key]) byDay[key] = { orders: 0, revenue: 0 }
      byDay[key].orders += 1
      byDay[key].revenue += Number(o.total ?? o.subtotal ?? 0)
    }
  
    const daysSorted = Object.keys(byDay)
      .filter((k) => k !== "unknown")
      .sort((a, b) => (a < b ? -1 : 1))
  
    const last7 = daysSorted.slice(-7)
  
    return {
      totalOrders,
      grossRevenue,
      avgOrderValue,
      pendingOrders,
      last7Days: last7.map((d) => ({ day: d, ...byDay[d] })),
    }
  }

// Update status field on order doc
export async function updateOrderStatus(orderId: string, status: string) {
    const ref = doc(db, "orders", orderId)
    await updateDoc(ref, { status })
}

// Alias (nicer name for your UI)
export async function fetchShippingAddress(orderId: string) {
  return fetchOrderShippingAddress(orderId)
}

  