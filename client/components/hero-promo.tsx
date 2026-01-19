'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function HeroPromo() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--brand-blue-light)]/40 via-background to-background">
      {/* Decorative elephant sticker - top right */}
      <div className="absolute -top-12 -right-12 w-48 h-48 opacity-20 hidden lg:block">
        <Image
          src="/images/stickers-03.png"
          alt="decorative"
          fill
          className="object-contain"
        />
      </div>

      {/* Decorative elephant sticker - bottom left */}
      <div className="absolute -bottom-8 -left-16 w-56 h-56 opacity-15 hidden lg:block">
        <Image
          src="/images/stickers-04.png"
          alt="decorative"
          fill
          className="object-contain"
        />
      </div>

      <div className="container mx-auto px-4 py-20 md:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <div className="inline-block">
                <span className="inline-block bg-[var(--brand-coral)]/10 text-[var(--brand-coral)] px-3 py-1 rounded-full text-sm font-medium">
                  🐘 Premium Collection
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground text-balance leading-tight tracking-tight">
                Where every cuddle counts
              </h1>
              <p className="text-lg md:text-xl text-foreground/70 text-pretty leading-relaxed max-w-md">
                Discover thoughtfully crafted plushies and cozy essentials designed to bring joy and comfort to every moment.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                asChild
                size="lg"
                className="bg-[var(--brand-coral)] hover:bg-[var(--brand-coral)]/90 text-white rounded-full font-semibold text-base shadow-lg"
              >
                <Link href="/shop">Explore Collection</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full font-semibold text-base border-2 border-[var(--brand-blue-dark)] text-[var(--brand-blue-dark)] hover:bg-[var(--brand-blue-dark)]/5 bg-transparent"
              >
                <Link href="/shop">View All Products</Link>
              </Button>
            </div>
          </div>

          {/* Right - Featured Product Image */}
          <div className="relative h-96 md:h-[500px] lg:h-[550px]">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-blue-light)] to-[var(--brand-blue-medium)]/30 rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/images/pink-shoot-01.png"
                alt="Featured Product"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Floating sticker decoration */}
            <div className="absolute -top-6 -right-6 w-20 h-20 opacity-90 hidden md:block">
              <Image
                src="/images/stickers-02.png"
                alt="decorative heart"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
