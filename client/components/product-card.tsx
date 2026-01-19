import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import type { Product } from "@/lib/products"

export function ProductCard({ product }: { product: Product }) {
  const hasNewTag = product.tags.includes("new")
  const hasBestsellerTag = product.tags.includes("bestseller")

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="group overflow-hidden border-2 hover:border-[var(--brand-coral)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="relative aspect-square bg-muted overflow-hidden">
          <Image
            src={product.images[0].url || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {(hasNewTag || hasBestsellerTag) && (
            <div className="absolute top-3 right-3 z-10">
              <span className="bg-[var(--brand-coral)] text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-md">
                {hasNewTag ? "✨ New" : "💖 Bestseller"}
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-foreground mb-2 text-balance">{product.name}</h3>
          <p className="text-lg font-bold text-[var(--brand-coral)] mb-3">${product.price.toFixed(2)}</p>
          <div className="flex items-center gap-2">
          {product.colors.slice(0, 4).map((color, idx) => (
              <div
                key={color.name}
                className="w-5 h-5 rounded-full border-2 border-border"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-muted-foreground">+{product.colors.length - 4}</span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
