import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CartDrawer } from "@/components/cart-drawer"
import { SupportHubContent } from "@/components/support-hub-content"
import Image from "next/image"

export const metadata = {
  title: "Support Hub | Kuddles",
  description: "Get help, ask questions, and connect with the Kuddles team",
}

export default function SupportPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-[var(--brand-coral)]/20 via-background to-background">
          <div className="absolute inset-0 opacity-5">
            <Image
              src="/images/pattern.png"
              alt=""
              fill
              className="object-cover"
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <span className="inline-block text-[var(--brand-coral)] font-semibold text-sm uppercase tracking-wider">
                We're Here to Help
              </span>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground text-balance leading-tight">
                Welcome to Kuddles Support
              </h1>
              <p className="text-xl text-foreground/70 text-pretty leading-relaxed">
                Have questions? We'd love to hear from you. Reach out to our team anytime.
              </p>
            </div>
          </div>
        </section>

        {/* Support Content */}
        <SupportHubContent />
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
