"use client"

import { useEffect, useMemo, useState } from "react"
import { Navbar } from "@/components/navbar"
import { CartDrawer } from "@/components/cart-drawer"
import { ProductGrid } from "@/components/product-grid"
import type { Product } from "@/lib/products"
import { fetchProducts } from "@/lib/products.firestore"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

import { Search, SlidersHorizontal, X } from "lucide-react"

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("popular")

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    fetchProducts()
      .then((items) => {
        if (!mounted) return
        setProducts(items)
      })
      .catch((e) => {
        if (!mounted) return
        setError(e?.message ?? "Failed to load products")
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const p of products) {
      if (p.category) set.add(p.category)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [products])

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category)
      return matchesSearch && matchesCategory
    })

    // Sort / filter
    if (sortBy === "price-low") {
      result = [...result].sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-high") {
      result = [...result].sort((a, b) => b.price - a.price)
    } else if (sortBy === "newest") {
      result = result.filter((p) => p.tags?.includes("new"))
    }

    return result
  }, [products, searchQuery, selectedCategories, sortBy])

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Shop All Products</h1>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="gap-2"
                disabled={loading}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {selectedCategories.length > 0 && (
                  <span className="bg-[var(--brand-coral)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {selectedCategories.length}
                  </span>
                )}
              </Button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-input rounded-lg bg-background"
                disabled={loading}
              >
                <option value="popular">Popular</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Loading / Error */}
          {loading && (
            <div className="py-16 text-center text-muted-foreground">
              Loading products…
            </div>
          )}

          {!loading && error && (
            <div className="py-16 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} className="bg-[var(--brand-coral)] text-white">
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Filter Drawer */}
              {isFilterOpen && (
                <>
                  <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsFilterOpen(false)}
                  />
                  <div className="fixed md:static right-0 top-0 h-full md:h-auto w-80 md:w-auto bg-background z-40 md:z-0 p-6 border border-border rounded-lg mb-8 overflow-y-auto md:overflow-visible shadow-xl md:shadow-none animate-slide-in-from-right md:animate-none">
                    <div className="flex items-center justify-between mb-4 md:hidden">
                      <h3 className="font-semibold">Filters</h3>
                      <Button variant="ghost" size="icon" onClick={() => setIsFilterOpen(false)}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    <div>
                      <Label className="text-base font-semibold mb-3 block">Category</Label>

                      {categories.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No categories available</p>
                      ) : (
                        <div className="space-y-3">
                          {categories.map((category) => (
                            <div key={category} className="flex items-center gap-2">
                              <Checkbox
                                id={category}
                                checked={selectedCategories.includes(category)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedCategories((prev) => [...prev, category])
                                  } else {
                                    setSelectedCategories((prev) => prev.filter((c) => c !== category))
                                  }
                                }}
                              />
                              <Label htmlFor={category} className="cursor-pointer">
                                {category}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedCategories.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCategories([])}
                          className="mt-4 text-[var(--brand-coral)]"
                        >
                          Clear all
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Results */}
              <div className="mb-4 text-sm text-muted-foreground">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
              </div>

              <ProductGrid products={filteredProducts} />
            </>
          )}
        </div>
      </main>

      <CartDrawer />
    </>
  )
}
