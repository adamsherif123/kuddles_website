import React, { useEffect, useMemo, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native"

import SheetModal from "../components/SheetModal"
import type { Order } from "../../order"
import { fetchOrderShippingAddress, listenOrders, updateOrderStatus, type ShippingAddress } from "../services/orders"

function formatMoney(v: number, currency = "EGP") {
  const n = Number(v || 0)
  try {
    return new Intl.NumberFormat("en-EG", { style: "currency", currency }).format(n)
  } catch {
    return `${currency} ${n.toFixed(2)}`
  }
}

function formatDate(ts: any) {
  const d = ts?.toDate?.() instanceof Date ? ts.toDate() : ts instanceof Date ? ts : null
  return d ? d.toLocaleString() : "—"
}

function statusPillStyle(status: string) {
  const s = String(status || "pending").toLowerCase()
  if (s === "paid") return { bg: "#DCFCE7", fg: "#166534", border: "#86EFAC" }
  if (s === "fulfilled" || s === "delivered" || s === "completed") return { bg: "#DBEAFE", fg: "#1D4ED8", border: "#93C5FD" }
  if (s === "cancelled") return { bg: "#FEE2E2", fg: "#991B1B", border: "#FCA5A5" }
  if (s === "failed") return { bg: "#FFE4E6", fg: "#9F1239", border: "#FDA4AF" }
  return { bg: "#FEF3C7", fg: "#92400E", border: "#FCD34D" } // pending/default
}

const STATUS_OPTIONS = ["pending", "paid", "fulfilled", "cancelled", "failed"]

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState<string | null>(null)

  const [selected, setSelected] = useState<Order | null>(null)
  const [address, setAddress] = useState<ShippingAddress | null>(null)
  const [addrLoading, setAddrLoading] = useState(false)

  const [savingStatus, setSavingStatus] = useState(false)

  useEffect(() => {
    const unsub = listenOrders(
      (data) => {
        setOrders(data)
        setError(null)
      },
      (e) => setError(e?.message ?? "Failed to load orders")
    )
    return () => unsub()
  }, [])

  const totals = useMemo(() => {
    const revenue = orders.reduce((sum, o) => sum + Number(o.total ?? o.subtotal ?? 0), 0)
    const pending = orders.filter((o) => String(o.status ?? "pending").toLowerCase() === "pending").length
    return { revenue, count: orders.length, pending }
  }, [orders])

  async function openOrder(o: Order) {
    setSelected(o)
    setAddress(null)
    setAddrLoading(true)
    try {
      const a = await fetchOrderShippingAddress(o.id)
      setAddress(a)
    } catch (e: any) {
      // keep null; we show a nice empty state
      console.warn(e)
    } finally {
      setAddrLoading(false)
    }
  }

  function closeOrder() {
    setSelected(null)
    setAddress(null)
    setAddrLoading(false)
    setSavingStatus(false)
  }

  async function setStatus(nextStatus: string) {
    if (!selected) return
    setSavingStatus(true)
    try {
      await updateOrderStatus(selected.id, nextStatus)

      // Optimistically update local state so UI snaps instantly
      setOrders((prev) => prev.map((o) => (o.id === selected.id ? { ...o, status: nextStatus } : o)))
      setSelected((prev) => (prev ? { ...prev, status: nextStatus } : prev))
    } catch (e: any) {
      setError(e?.message ?? "Failed to update status")
    } finally {
      setSavingStatus(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Orders</Text>
          <Text style={styles.subtitle}>View, pack, ship, and update order status.</Text>
        </View>
      </View>

      {/* KPI row (like your screenshot top cards) */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Total Orders</Text>
          <Text style={styles.kpiValue}>{totals.count}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Pending</Text>
          <Text style={styles.kpiValue}>{totals.pending}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Gross Revenue</Text>
          <Text style={styles.kpiValue}>{formatMoney(totals.revenue, "EGP")}</Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Orders list */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Recent orders</Text>
        </View>

        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 12 }}
          showsVerticalScrollIndicator={true}
          renderItem={({ item }) => {
            const currency = item.currency ?? "EGP"
            const total = Number(item.total ?? item.subtotal ?? 0)
            const status = String(item.status ?? "pending")
            const pill = statusPillStyle(status)
            const itemsCount = item.items?.reduce((s, it) => s + Number(it.quantity ?? 0), 0) ?? 0

            return (
              <Pressable onPress={() => openOrder(item)} style={({ pressed }) => [styles.row, pressed && { opacity: 0.92 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderId}>#{item.id.slice(0, 8).toUpperCase()}</Text>
                  <Text style={styles.muted}>{formatDate(item.createdAt)}</Text>
                  <Text style={styles.muted}>{itemsCount} item(s)</Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.orderTotal}>{formatMoney(total, currency)}</Text>
                  <View style={[styles.pill, { backgroundColor: pill.bg, borderColor: pill.border }]}>
                    <Text style={[styles.pillText, { color: pill.fg }]}>{status.toUpperCase()}</Text>
                  </View>
                </View>
              </Pressable>
            )
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.muted}>No orders yet.</Text>
            </View>
          }
        />
      </View>

      {/* Expanded order view */}
      <SheetModal visible={!!selected} onClose={closeOrder}>
        {!selected ? null : (
          <ScrollView style={{ maxHeight: 680 }} contentContainerStyle={{ paddingBottom: 12 }}>
            {/* Top */}
            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>Order #{selected.id.slice(0, 8).toUpperCase()}</Text>
                <Text style={styles.muted}>{formatDate(selected.createdAt)}</Text>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.sheetTotal}>
                  {formatMoney(Number(selected.total ?? selected.subtotal ?? 0), selected.currency ?? "EGP")}
                </Text>
                <Text style={styles.muted}>Total</Text>
              </View>
            </View>

            {/* Status editor */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Status</Text>
              <Text style={styles.mutedSmall}>Tap a status to update the order in Firestore.</Text>

              <View style={styles.statusRow}>
                {STATUS_OPTIONS.map((s) => {
                  const active = String(selected.status ?? "pending").toLowerCase() === s
                  const pill = statusPillStyle(s)
                  return (
                    <Pressable
                      key={s}
                      onPress={() => setStatus(s)}
                      disabled={savingStatus}
                      style={({ pressed }) => [
                        styles.statusChip,
                        { borderColor: active ? "#FF6B6B" : pill.border, backgroundColor: active ? "rgba(255,107,107,0.12)" : "#fff" },
                        pressed && { opacity: 0.9 },
                        savingStatus && { opacity: 0.6 },
                      ]}
                    >
                      <Text style={{ fontWeight: "800", color: active ? "#FF6B6B" : "#111827", fontSize: 12 }}>
                        {s.toUpperCase()}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>

              {savingStatus ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 }}>
                  <ActivityIndicator />
                  <Text style={styles.muted}>Saving…</Text>
                </View>
              ) : null}
            </View>

            {/* Shipping */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shipping address</Text>

              {addrLoading ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 }}>
                  <ActivityIndicator />
                  <Text style={styles.muted}>Loading shipping…</Text>
                </View>
              ) : !address ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.muted}>
                    No address found in orders/{selected.id}/shipping/address
                  </Text>
                </View>
              ) : (
                <View style={styles.infoBox}>
                  <Text style={styles.infoLine}><Text style={styles.infoKey}>Name: </Text>{address.fullName ?? "—"}</Text>
                  <Text style={styles.infoLine}><Text style={styles.infoKey}>Phone: </Text>{address.phone ?? "—"}</Text>
                  <Text style={styles.infoLine}><Text style={styles.infoKey}>Email: </Text>{address.email ?? "—"}</Text>

                  <View style={styles.divider} />

                  <Text style={styles.infoLine}>
                    <Text style={styles.infoKey}>Address: </Text>
                    {address.streetAddress ?? "—"}
                  </Text>
                  <Text style={styles.infoLine}>
                    <Text style={styles.infoKey}>Building/Floor/Apt: </Text>
                    {address.building ?? "—"} / {address.floor ?? "—"} / {address.apartment ?? "—"}
                  </Text>
                  <Text style={styles.infoLine}>
                    <Text style={styles.infoKey}>Area/City: </Text>
                    {address.area ?? "—"} / {address.city ?? "—"}
                  </Text>

                  {address.notes ? (
                    <>
                      <View style={styles.divider} />
                      <Text style={styles.infoLine}><Text style={styles.infoKey}>Notes: </Text>{address.notes}</Text>
                    </>
                  ) : null}
                </View>
              )}
            </View>

            {/* Items */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Items</Text>

              <View style={styles.infoBox}>
                {(selected.items ?? []).length === 0 ? (
                  <Text style={styles.muted}>No items stored on this order.</Text>
                ) : (
                  (selected.items ?? []).map((it, idx) => (
                    <View key={`${it.id}-${it.color ?? ""}-${it.size ?? ""}-${idx}`} style={styles.itemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemName}>{it.name}</Text>
                        <Text style={styles.mutedSmall}>
                          {it.color ? `Color: ${it.color}` : ""}{it.color && it.size ? " • " : ""}{it.size ? `Size: ${it.size}` : ""}
                        </Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.itemQty}>x{Number(it.quantity ?? 0)}</Text>
                        <Text style={styles.mutedSmall}>{formatMoney(Number(it.price ?? 0), selected.currency ?? "EGP")}</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          </ScrollView>
        )}
      </SheetModal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#F6F7FB" },

  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  title: { fontSize: 26, fontWeight: "900" },
  subtitle: { color: "#6B7280", marginTop: 4 },

  // KPI row like screenshot: small cards on ONE line (web) — RN will wrap on narrow screens.
  kpiRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 14 },
  kpiCard: {
    flexGrow: 1,
    flexBasis: 220,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E9E9EE",
  },
  kpiLabel: { color: "#6B7280", fontSize: 12, marginBottom: 6 },
  kpiValue: { fontSize: 18, fontWeight: "900" },

  errorBox: { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5", borderWidth: 1, padding: 12, borderRadius: 12, marginBottom: 12 },
  errorText: { color: "#991B1B", fontWeight: "700" },

  card: {
    flex: 1,                // ✅ THIS is the key
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E9E9EE",
    minHeight: 0,           // ✅ important for scrolling inside flex containers
  },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  cardTitle: { fontSize: 14, fontWeight: "900" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F4",
  },
  orderId: { fontWeight: "900", marginBottom: 4 },
  orderTotal: { fontWeight: "900", fontSize: 16, marginBottom: 8 },

  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
  pillText: { fontWeight: "900", fontSize: 11 },

  muted: { color: "#6B7280" },
  mutedSmall: { color: "#6B7280", fontSize: 12, marginTop: 4 },

  empty: { paddingVertical: 30, alignItems: "center" },
  emptyBox: { marginTop: 10, backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 12 },

  // Sheet
  sheetHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 10 },
  sheetTitle: { fontSize: 18, fontWeight: "900" },
  sheetTotal: { fontSize: 16, fontWeight: "900" },

  section: { marginTop: 14 },
  sectionTitle: { fontSize: 13, fontWeight: "900" },

  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "#fff",
  },

  infoBox: { marginTop: 10, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E9E9EE", borderRadius: 12, padding: 12 },
  divider: { height: 1, backgroundColor: "#F0F0F4", marginVertical: 10 },

  infoKey: { fontWeight: "900", color: "#111827" },
  infoLine: { color: "#111827", marginBottom: 6 },

  itemRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#F0F0F4" },
  itemName: { fontWeight: "900" },
  itemQty: { fontWeight: "900" },
})
