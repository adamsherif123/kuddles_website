"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/products"

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

export function FeaturedProductsHero({ products }: { products: Product[] }) {
  if (!products || products.length === 0) return null

  const featured = products.slice(0, 3)

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block text-[var(--brand-coral)] font-semibold text-sm uppercase tracking-wider">
            Handpicked Collection
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
            Best Sellers & New Favorites
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Discover the products our customers love most. Carefully selected for quality, charm, and lasting joy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {featured.map((product) => {
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

                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-lg font-bold text-[var(--brand-coral)]">
                      {formatMoneyEGP(product.price)}
                    </span>
                  </div>

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

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Button
            asChild
            size="lg"
            className="bg-[var(--brand-coral)] hover:bg-[var(--brand-coral)]/90 text-white rounded-full font-semibold text-base"
          >
            <Link href="/shop">Shop All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
