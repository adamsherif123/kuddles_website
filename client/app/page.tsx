"use client"

import { useEffect, useMemo, useState } from "react"
import { Navbar } from "@/components/navbar"
import { HeroPromo } from "@/components/hero-promo"
import { Footer } from "@/components/footer"
import { FeaturedProductsHero } from "@/components/featured-products-hero"
import { CartDrawer } from "@/components/cart-drawer"
import type { Product } from "@/lib/products"
import { fetchProducts } from "@/lib/products.firestore"

import { Card } from "@/components/ui/card"
import { Sparkles, Package, Heart } from "lucide-react"
import Image from "next/image"

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchProducts()
      .then((items) => {
        if (!mounted) return
        setProducts(items)
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const featuredProducts = useMemo(() => {
    const tagged = products.filter((p) => p.tags?.includes("bestseller") || p.tags?.includes("new"))
    // fallback if your DB doesn’t have tags yet
    return (tagged.length ? tagged : products).slice(0, 8)
  }, [products])

  return (
    <>
      <Navbar />
      <main>
        <HeroPromo />

        {/* Featured Products Section */}
        {loading ? (
          <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4 text-center text-muted-foreground">
              Loading featured products…
            </div>
          </section>
        ) : (
          <FeaturedProductsHero products={featuredProducts} />
        )}

        {/* Why Kuddles - Premium Section */}
        <section className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-br from-[var(--brand-blue-light)]/20 via-background to-background">
          <div className="absolute inset-0 opacity-5">
            <Image src="/images/pattern.png" alt="" fill className="object-cover" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16 space-y-4">
              <span className="inline-block text-[var(--brand-coral)] font-semibold text-sm uppercase tracking-wider">
                Why Choose Kuddles
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
                Crafted with love, designed for joy
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-8 border border-[var(--brand-blue-light)] rounded-2xl hover:shadow-lg transition-shadow duration-300 bg-white">
                <div className="w-14 h-14 bg-gradient-to-br from-[var(--brand-coral)] to-[var(--brand-coral)]/70 rounded-full flex items-center justify-center mb-6 shadow-md">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Premium Quality</h3>
                <p className="text-foreground/70 text-pretty leading-relaxed">
                  Every product is thoughtfully crafted with premium materials, designed to bring lasting joy and comfort to those you love.
                </p>
              </Card>

              <Card className="p-8 border border-[var(--brand-blue-light)] rounded-2xl hover:shadow-lg transition-shadow duration-300 bg-white">
                <div className="w-14 h-14 bg-gradient-to-br from-[var(--brand-blue-dark)] to-[var(--brand-blue-medium)] rounded-full flex items-center justify-center mb-6 shadow-md">
                  <Package className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Thoughtful Packaging</h3>
                <p className="text-foreground/70 text-pretty leading-relaxed">
                  Each order arrives beautifully packaged and ready to gift. We believe the unboxing experience matters as much as the product itself.
                </p>
              </Card>

              <Card className="p-8 border border-[var(--brand-blue-light)] rounded-2xl hover:shadow-lg transition-shadow duration-300 bg-white">
                <div className="w-14 h-14 bg-gradient-to-br from-[var(--brand-coral)] to-[var(--brand-blue-dark)] rounded-full flex items-center justify-center mb-6 shadow-md">
                  <Heart className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Made with Love</h3>
                <p className="text-foreground/70 text-pretty leading-relaxed">
                  Behind every Kuddles product is a passion for creating meaningful connections and spreading happiness through cuddles and comfort.
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
