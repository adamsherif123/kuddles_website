import React, { useEffect, useMemo, useState } from "react"
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native"
import { LineChart, BarChart, PieChart } from "react-native-chart-kit"
import type { Order } from "../../order"
import { listenOrders } from "../services/orders"

const screenWidth = Dimensions.get("window").width
const PAGE_PADDING = 20
const GAP = 16
const SECTION_GAP = 24

function money(v: number, currency = "EGP") {
  const n = Number(v || 0)
  return `${currency} ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

function toDate(ts: any): Date | null {
  if (!ts) return null
  if (ts?.toDate?.() instanceof Date) return ts.toDate()
  if (ts instanceof Date) return ts
  return null
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function DashboardScreen() {
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = listenOrders(
      (data) => {
        setOrders(data)
        setError(null)
      },
      (e) => setError(e?.message ?? "Failed to load dashboard")
    )
    return () => unsub()
  }, [])

  const analytics = useMemo(() => {
    const safeOrders = Array.isArray(orders) ? orders : []

    // ---- KPI base ----
    const totalOrders = safeOrders.length
    const grossRevenue = safeOrders.reduce((sum, o) => sum + Number((o as any).total ?? (o as any).subtotal ?? 0), 0)
    const avgOrderValue = totalOrders ? grossRevenue / totalOrders : 0
    const pendingOrders = safeOrders.filter((o) => String((o as any).status ?? "pending") === "pending").length

    // ---- Orders over time (last 7 days) ----
    const byDay: Record<string, { orders: number; revenue: number }> = {}
    for (const o of safeOrders) {
      const d = toDate((o as any).createdAt)
      if (!d) continue
      const k = dayKey(d)
      if (!byDay[k]) byDay[k] = { orders: 0, revenue: 0 }
      byDay[k].orders += 1
      byDay[k].revenue += Number((o as any).total ?? (o as any).subtotal ?? 0)
    }

    // build last 7 consecutive days so chart looks nice even if days missing
    const today = new Date()
    const last7: { day: string; label: string; orders: number; revenue: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const k = dayKey(d)
      last7.push({
        day: k,
        label: `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
        orders: byDay[k]?.orders ?? 0,
        revenue: byDay[k]?.revenue ?? 0,
      })
    }

    // ---- Revenue by Category (from items) ----
    const revenueByCategory: Record<string, number> = {}
    for (const o of safeOrders) {
      const items = (o as any).items
      if (!Array.isArray(items)) continue
      for (const it of items) {
        const cat = String(it?.category ?? it?.productCategory ?? "Uncategorized")
        const line = Number(it?.price ?? 0) * Number(it?.quantity ?? 0)
        revenueByCategory[cat] = (revenueByCategory[cat] ?? 0) + line
      }
    }
    const categoryBars = Object.entries(revenueByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6) // keep it readable
    const categoryLabels = categoryBars.map(([k]) => (k.length > 10 ? k.slice(0, 10) + "…" : k))
    const categoryValues = categoryBars.map(([, v]) => Math.round(v))

    // ---- Orders by Weekday (pie) ----
    const weekdayCounts = new Array(7).fill(0)
    for (const o of safeOrders) {
      const d = toDate((o as any).createdAt)
      if (!d) continue
      weekdayCounts[d.getDay()] += 1
    }
    const totalWeekday = weekdayCounts.reduce((a, b) => a + b, 0) || 1
    const pieData = WEEKDAYS.map((name, idx) => ({
      name,
      population: weekdayCounts[idx],
      color: PIE_COLORS[idx],
      legendFontColor: "#6B7280",
      legendFontSize: 11,
    })).filter((x) => x.population > 0)

    // ---- “Booked hours per week” placeholder equivalent ----
    // We don’t have hours, so we show Orders per Day (same as last7 orders) on bottom-right.
    // Later, if you add delivery slot/time or fulfillment times, you can swap this to something else.

    return {
      totalOrders,
      grossRevenue,
      avgOrderValue,
      pendingOrders,
      last7,
      categoryLabels,
      categoryValues,
      pieData,
      totalWeekday,
    }
  }, [orders])

  const cardWidth = useMemo(() => {
    // Calculate optimal width for KPI cards
    const availableWidth = screenWidth - PAGE_PADDING * 2
    const w = Math.min(160, Math.floor((availableWidth - GAP * 5) / 6))
    return Math.max(130, w)
  }, [])

  const chartWidth = useMemo(() => {
    // Calculate chart width for grid cards (accounting for gap between cards)
    return (screenWidth - PAGE_PADDING * 2 - GAP) / 2
  }, [])

  const gridCardWidth = useMemo(() => {
    // Grid card width matches chart width calculation
    return (screenWidth - PAGE_PADDING * 2 - GAP) / 2
  }, [])

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Dashboard</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* KPI row (single line, horizontally scrollable like screenshot) */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.kpiScrollView}
        contentContainerStyle={styles.kpiScrollContent}
      >
        <KpiCard label="Total Orders" value={String(analytics.totalOrders)} width={cardWidth} />
        <KpiCard label="Gross Revenue" value={money(analytics.grossRevenue)} width={cardWidth} />
        <KpiCard label="Avg Order" value={money(analytics.avgOrderValue)} width={cardWidth} />
        <KpiCard label="Pending" value={String(analytics.pendingOrders)} width={cardWidth} />
        <KpiCard label="This Week (Orders)" value={String(analytics.last7.reduce((s, d) => s + d.orders, 0))} width={cardWidth} />
        <KpiCard label="This Week (Rev)" value={money(analytics.last7.reduce((s, d) => s + d.revenue, 0))} width={cardWidth} />
      </ScrollView>

      {/* Chart grid (2x2 like screenshot) */}
      <View style={styles.grid}>
        {/* Top-left: Orders over Time */}
        <View style={[styles.gridCard, { width: gridCardWidth }]}>
          <Text style={styles.cardTitle}>Orders over Time</Text>
          <LineChart
            data={{
              labels: analytics.last7.map((d) => d.label),
              datasets: [{ data: analytics.last7.map((d) => d.orders) }],
            }}
            width={chartWidth - 28}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines
          />
        </View>

        {/* Top-right: Revenue by Category (Bar) */}
        <View style={[styles.gridCard, { width: gridCardWidth }]}>
          <Text style={styles.cardTitle}>Revenue by Category</Text>
          <BarChart
            data={{
              labels: analytics.categoryLabels.length ? analytics.categoryLabels : ["—"],
              datasets: [{ data: analytics.categoryValues.length ? analytics.categoryValues : [0] }],
            }}
            width={chartWidth - 28}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero
            showValuesOnTopOfBars={false}
            yAxisLabel=""
            yAxisSuffix=""
          />
        </View>

        {/* Bottom-left: Orders by Weekday (Pie) */}
        <View style={[styles.gridCard, { width: gridCardWidth }]}>
          <Text style={styles.cardTitle}>Orders by Weekday</Text>
          <PieChart
            data={analytics.pieData.length ? analytics.pieData : [{ name: "No data", population: 1, color: "#E5E7EB", legendFontColor: "#6B7280", legendFontSize: 11 }]}
            width={chartWidth - 28}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="12"
            hasLegend
            center={[0, 0]}
          />
        </View>

        {/* Bottom-right: Revenue per Day (Line) */}
        <View style={[styles.gridCard, { width: gridCardWidth }]}>
          <Text style={styles.cardTitle}>Revenue per Day</Text>
          <LineChart
            data={{
              labels: analytics.last7.map((d) => d.label),
              datasets: [{ data: analytics.last7.map((d) => Math.round(d.revenue)) }],
            }}
            width={chartWidth - 28}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines
          />
        </View>
      </View>
    </ScrollView>
  )
}

function KpiCard({ label, value, width }: { label: string; value: string; width: number }) {
  return (
    <View style={[styles.kpiCard, { width }]}>
      <Text style={styles.kpiLabel} numberOfLines={1}>{label}</Text>
      <Text style={styles.kpiValue} numberOfLines={1}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F6F7FB" 
  },
  scrollContent: { 
    padding: PAGE_PADDING,
    paddingBottom: 32 
  },
  title: { 
    fontSize: 28, 
    fontWeight: "800", 
    marginBottom: SECTION_GAP,
    color: "#111827"
  },
  error: { 
    color: "#DC2626", 
    marginBottom: 16,
    fontSize: 14
  },
  kpiScrollView: {
    marginBottom: SECTION_GAP,
    marginHorizontal: -PAGE_PADDING,
  },
  kpiScrollContent: {
    paddingHorizontal: PAGE_PADDING,
    gap: GAP,
    paddingRight: PAGE_PADDING + GAP,
  },
  kpiCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E9E9EE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  kpiLabel: { 
    color: "#6B7280", 
    fontSize: 12, 
    marginBottom: 8,
    fontWeight: "500"
  },
  kpiValue: { 
    fontSize: 18, 
    fontWeight: "700",
    color: "#111827"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
    marginTop: 0,
  },
  gridCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E9E9EE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: { 
    fontSize: 14, 
    fontWeight: "700", 
    marginBottom: 12, 
    color: "#111827" 
  },
  chart: { 
    borderRadius: 8,
    marginTop: 4
  },
})

const chartConfig = {
  backgroundGradientFrom: "#FFFFFF",
  backgroundGradientTo: "#FFFFFF",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
  propsForDots: { r: "4" },
  propsForBackgroundLines: { stroke: "rgba(229,231,235,1)" },
}

const PIE_COLORS = [
  "rgba(255, 107, 107, 1)", // coral
  "rgba(34, 197, 94, 1)",   // green
  "rgba(59, 130, 246, 1)",  // blue
  "rgba(245, 158, 11, 1)",  // amber
  "rgba(168, 85, 247, 1)",  // purple
  "rgba(20, 184, 166, 1)",  // teal
  "rgba(100, 116, 139, 1)", // slate
]
