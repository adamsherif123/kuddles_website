"use client"

import { useMemo, useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Heart, Minus, Plus, Truck, RotateCcw } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { Sticker } from "@/components/sticker"
import type { Product } from "@/lib/products"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

type Img = { url?: string; color?: string }

export function ProductDetail({ product }: { product: Product }) {
  // ✅ Safe fallbacks in case Firestore doc is missing these fields
  const safeImages: Img[] = useMemo(() => {
    const imgs = Array.isArray((product as any).images) ? ((product as any).images as Img[]) : []
    return imgs.length ? imgs : [{ url: "/placeholder.svg" }]
  }, [product])

  const safeColors = useMemo(() => {
    const colors = Array.isArray((product as any).colors) ? (product as any).colors : []
    return colors.length ? colors : [{ name: "Default", hex: "#e5e7eb", inStock: true }]
  }, [product])

  const safeSizes = useMemo(() => {
    const sizes = Array.isArray((product as any).sizes) ? (product as any).sizes : []
    return sizes.length ? sizes : [{ label: "One Size", inStockByColor: { Default: true } }]
  }, [product])

  const [selectedColor, setSelectedColor] = useState<string>(safeColors[0]?.name ?? "Default")
  const [selectedSize, setSelectedSize] = useState<string>(safeSizes[0]?.label ?? "One Size")
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const [openChart, setOpenChart] = useState<null | { src: string; label: string }>(null)

  const { addItem, setIsCartOpen } = useCart()

  const selectedSizeData = safeSizes.find((s: any) => s.label === selectedSize)
  const isInStock = selectedSizeData?.inStockByColor?.[selectedColor] ?? true

  // Get available stock quantity for selected color and size
  const getAvailableStock = useMemo(() => {
    if (!product.stockBySize) return Infinity

    const stockKey1 = `${selectedColor}-${selectedSize}`
    const stockKey2 = selectedSize
    const stockKey3 = selectedColor

    const stock =
      (product as any).stockBySize?.[stockKey1] ??
      (product as any).stockBySize?.[stockKey2] ??
      (product as any).stockBySize?.[stockKey3] ??
      0

    return Math.max(0, stock)
  }, [product, selectedColor, selectedSize])

  // Reset quantity to 1 when selection changes
  useEffect(() => {
    setQuantity(1)
  }, [selectedColor, selectedSize])

  // Ensure quantity doesn't exceed available stock
  useEffect(() => {
    if (getAvailableStock !== Infinity && quantity > getAvailableStock && getAvailableStock > 0) {
      setQuantity(getAvailableStock)
    }
  }, [getAvailableStock, quantity])

  const currentImage =
    safeImages[selectedImageIndex] ??
    safeImages.find((img) => img.color === selectedColor) ??
    safeImages[0] ??
    { url: "/placeholder.svg" }

  const handleAddToCart = () => {
    if (!isInStock || quantity > getAvailableStock || quantity <= 0) return
    addItem({
      id: `${product.id}-${selectedColor}-${selectedSize}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: currentImage.url || "/placeholder.svg",
      color: selectedColor,
      size: selectedSize,
      quantity,
    })
    setIsCartOpen(true)
  }

  return (
    <main className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="relative">
            <Sticker
              src="/images/circularlogo.png"
              alt="Kuddles"
              size="lg"
              position="top-left"
              hideOnMobile
              className="opacity-10"
            />

            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border mb-4">
              <Image
                src={currentImage.url || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-contain"
                priority
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {safeImages.map((img, index) => (
                <button
                  key={`${img.url ?? "img"}-${index}`}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                    index === selectedImageIndex ? "border-[var(--brand-coral)]" : "border-border"
                  }`}
                >
                  <Image
                    src={img.url || "/placeholder.svg"}
                    alt={`${product.name} ${img.color ?? ""}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">{product.name}</h1>
            <p className="text-3xl font-bold text-[var(--brand-coral)] mb-6">{product.price.toFixed(2)} EGP</p>
            <p className="text-muted-foreground mb-8 leading-relaxed">{product.description}</p>

            {/* Size Selector */}
            <div className="mb-6">
              <div className="text-sm font-semibold mb-3">
                Size: <span className="font-normal text-muted-foreground">{selectedSize}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {safeSizes.map((size: any) => {
                  const sizeInStock = size.inStockByColor?.[selectedColor] ?? true
                  return (
                    <button
                      key={size.label}
                      onClick={() => setSelectedSize(size.label)}
                      disabled={!sizeInStock}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedSize === size.label
                          ? "border-[var(--brand-coral)] bg-[var(--brand-coral)] text-white"
                          : "border-border hover:border-[var(--brand-coral)]"
                      } ${!sizeInStock ? "opacity-30 cursor-not-allowed" : ""}`}
                    >
                      {size.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quantity (stock label only) */}
            <div className="mb-6">
              <div className="text-sm font-semibold mb-3">
                Quantity{" "}
                <span className="font-normal ml-2">
                  {isInStock ? (
                    <span className="text-green-600">In stock</span>
                  ) : (
                    <span className="text-red-600">Out of stock</span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!isInStock || quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <span className="text-lg font-medium w-12 text-center">{quantity}</span>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(getAvailableStock, quantity + 1))}
                  disabled={!isInStock || quantity >= getAvailableStock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <Button
                size="lg"
                className="flex-1 bg-[var(--brand-coral)] hover:bg-[var(--brand-coral)]/90 text-white"
                onClick={handleAddToCart}
                disabled={!isInStock || quantity > getAvailableStock || quantity <= 0}
              >
                Add to Cart
              </Button>
              <Button variant="outline" size="lg" className="px-6 bg-transparent">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Size charts */}
            <div className="mb-8">
              <p className="text-sm font-semibold mb-3">Size charts</p>

              <div className="grid grid-cols-2 gap-3 max-w-sm">
                {[
                  { src: "/images/size-chart1.png", label: "Sweaters size chart" },
                  { src: "/images/size-chart2.png", label: "Pants size chart" },
                ].map((item) => (
                  <button
                    key={item.src}
                    type="button"
                    onClick={() => setOpenChart(item)}
                    className="text-left rounded-2xl border bg-white p-2 hover:shadow-sm transition"
                    title="Click to expand"
                  >
                    <p className="text-[11px] font-medium text-muted-foreground mb-1">{item.label}</p>

                    <div className="aspect-square w-full rounded-xl overflow-hidden bg-white border">
                      {/* use <img> so it never gets optimized/cropped weird */}
                      <img src={item.src} alt={item.label} className="w-full h-full object-contain" />
                    </div>

                    <p className="mt-1 text-[11px] text-muted-foreground">Tap to expand</p>
                  </button>
                ))}
              </div>

              {/* Lightbox modal */}
              {openChart && (
                <div
                  className="fixed inset-0 z-[999] bg-black/60 flex items-center justify-center p-4"
                  onClick={() => setOpenChart(null)}
                  role="dialog"
                  aria-modal="true"
                >
                  <div
                    className="relative w-full max-w-5xl rounded-2xl bg-white p-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenChart(null)}
                      className="absolute right-3 top-3 rounded-full border bg-white px-3 py-1 text-sm"
                    >
                      ✕
                    </button>

                    <p className="text-sm font-semibold mb-2 pr-10">{openChart.label}</p>

                    {/* No scrolling: fit to viewport */}
                    <div className="flex items-center justify-center">
                      <img
                        src={openChart.src}
                        alt={openChart.label}
                        className="h-[80vh] w-auto max-w-[92vw] object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="delivery">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span>Delivery & Returns</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>• Free standard shipping</p>
                    <p>• 2-5 business days</p>
                    <p>• 30-day return policy</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="care">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    <span>Care Instructions</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <a
                    href="/docs/care-instructions.pdf"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-coral)] hover:underline"
                  >
                    Open Care Instructions (PDF)
                  </a>
                  <p className="mt-2 text-sm text-muted-foreground">Opens in a new tab.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </main>
  )
}
