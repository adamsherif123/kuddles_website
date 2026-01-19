export type Product = {
  id: string
  name: string
  price: number
  images: { url: string; color?: string }[]
  description: string
  colors: { name: string; hex: string; inStock: boolean }[]
  sizes: { label: string; inStockByColor: Record<string, boolean> }[]
  tags: string[]
  category: string
  stockBySize?: Record<string, number> // Stock quantities: "color-size" -> number
}

