import type { Product } from "@/lib/products"
import Link from "next/link"
import Image from "next/image"

function formatMoneyEGP(amount: number) {
  const n = Number(amount || 0)
  try {
    return new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP" }).format(n)
  } catch {
    return `EGP ${n.toFixed(2)}`
  }
}

function isProductInStock(product: Product) {
  if (Array.isArray(product.sizes) && product.sizes.length > 0) {
    for (const s of product.sizes) {
      const map = s?.inStockByColor || {}
      for (const key of Object.keys(map)) {
        if (map[key] === true) return true
      }
    }
    return false
  }
  if (Array.isArray(product.colors) && product.colors.length > 0) {
    return product.colors.some((c) => c?.inStock === true)
  }
  return false
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted-foreground">No products found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      {products.map((product) => {
        const img = product.images?.[0]?.url || "/placeholder.svg"
        const isBestseller = product.tags?.includes("bestseller")
        const isNew = product.tags?.includes("new")
        const inStock = isProductInStock(product)

        return (
          <Link key={product.id} href={`/product/${product.id}`} className="group">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--brand-blue-light)]/40 to-[var(--brand-blue-light)]/10 aspect-square mb-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <Image
                src={img}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {isBestseller && (
                <div className="absolute top-4 left-4 bg-[var(--brand-coral)] text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Bestseller
                </div>
              )}
              {!isBestseller && isNew && (
                <div className="absolute top-4 left-4 bg-[var(--brand-blue-dark)] text-white px-3 py-1 rounded-full text-sm font-semibold">
                  New
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground group-hover:text-[var(--brand-blue-dark)] transition-colors">
                {product.name}
              </h3>

              <p className="text-sm text-foreground/60 line-clamp-2">{product.description}</p>

              <div className="flex items-center gap-2 pt-2">
                <span className="text-lg font-bold text-[var(--brand-coral)]">
                  {formatMoneyEGP(product.price)}
                </span>
              </div>

              {/* Stock indicator */}
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${inStock ? "bg-green-500" : "bg-red-500"}`} />
                <span className={inStock ? "text-green-600" : "text-red-600"}>
                  {inStock ? "Available" : "Out of stock"}
                </span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
