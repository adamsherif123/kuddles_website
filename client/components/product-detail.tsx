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
    // if no colors exist, create a dummy one so UI doesn't crash
    return colors.length ? colors : [{ name: "Default", hex: "#e5e7eb", inStock: true }]
  }, [product])

  const safeSizes = useMemo(() => {
    const sizes = Array.isArray((product as any).sizes) ? (product as any).sizes : []
    // if no sizes exist, create a dummy one
    return sizes.length ? sizes : [{ label: "One Size", inStockByColor: { Default: true } }]
  }, [product])

  const [selectedColor, setSelectedColor] = useState<string>(safeColors[0]?.name ?? "Default")
  const [selectedSize, setSelectedSize] = useState<string>(safeSizes[0]?.label ?? "One Size")
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const { addItem, setIsCartOpen } = useCart()

  const selectedSizeData = safeSizes.find((s: any) => s.label === selectedSize)
  const isInStock = selectedSizeData?.inStockByColor?.[selectedColor] ?? true

  // Get available stock quantity for selected color and size
  const getAvailableStock = useMemo(() => {
    if (!product.stockBySize) return Infinity // If no stock data, allow unlimited
    
    // Try different key formats: "color-size", "size", or "color"
    const stockKey1 = `${selectedColor}-${selectedSize}`
    const stockKey2 = selectedSize
    const stockKey3 = selectedColor
    
    const stock = product.stockBySize[stockKey1] ?? 
                  product.stockBySize[stockKey2] ?? 
                  product.stockBySize[stockKey3] ?? 
                  0
    
    return Math.max(0, stock) // Ensure non-negative
  }, [product.stockBySize, selectedColor, selectedSize])

  // Reset quantity to 1 when color/size changes, or cap it if it exceeds available stock
  useEffect(() => {
    setQuantity(1) // Reset to 1 when selection changes
  }, [selectedColor, selectedSize])

  // Ensure quantity doesn't exceed available stock
  useEffect(() => {
    if (quantity > getAvailableStock && getAvailableStock > 0) {
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
      productId: product.id, // Store product ID to fetch stock data
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

            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted mb-4">
              <Image
                src={currentImage.url || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
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

            {/* Color Selector */}
            {/* <div className="mb-6">
              <div className="text-sm font-semibold mb-3">
                Color: <span className="font-normal text-muted-foreground">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {safeColors.map((color: any) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    disabled={color.inStock === false}
                    className={`w-12 h-12 rounded-full border-2 transition-all ${
                      selectedColor === color.name ? "border-[var(--brand-coral)] scale-110" : "border-border"
                    } ${color.inStock === false ? "opacity-30 cursor-not-allowed" : "hover:scale-110"}`}
                    style={{ backgroundColor: color.hex ?? "#e5e7eb" }}
                    title={color.name}
                  />
                ))}
              </div>
            </div> */}

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

            {/* Quantity */}
            <div className="mb-6">
              <div className="text-sm font-semibold mb-3">
                Quantity
                {getAvailableStock !== Infinity && (
                  <span className="font-normal text-muted-foreground ml-2">
                    ({getAvailableStock} available)
                  </span>
                )}
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
                    <p>• Free standard shipping on orders over $50</p>
                    <p>• Express shipping available at checkout</p>
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
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>• Washing: Cold wash (&lt;30°C) inside out, gentle cycle, no bleach or softener</p>
                    <p>• Drying: Air dry in shade, lay flat or hang</p>
                    <p>• Ironing: Low heat inside out, don't iron print</p>
                    <p>• Wear: Avoid rough surfaces, handle gently</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </main>
  )
}








