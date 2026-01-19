import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CartDrawer } from "@/components/cart-drawer"
import { Card } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Package, RotateCcw } from "lucide-react"
import Image from "next/image"

export default function RefundPolicyPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--brand-blue-light)]/30 via-background to-background py-20">
          {/* Decorative pattern background */}
          <div className="absolute inset-0 opacity-5">
            <Image
              src="/images/pattern.png"
              alt=""
              fill
              className="object-cover"
            />
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center space-y-6">
            <div>
              <span className="inline-block text-[var(--brand-coral)] font-semibold text-sm uppercase tracking-wider mb-4">
                ✨ Our Commitment to You
              </span>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground text-balance leading-tight">
                Return & Exchange Policy
              </h1>
              <p className="text-lg md:text-xl text-foreground/70 text-pretty leading-relaxed max-w-2xl mx-auto mt-6">
                Not happy? No worries! Smooth, simple, and stress-free—just how Kuddles should be!
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Timeline/Steps */}
            <div className="space-y-8 mb-16">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-coral)]/10">
                    <CheckCircle className="h-6 w-6 text-[var(--brand-coral)]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Return Window</h3>
                  <div className="space-y-2 text-foreground/70">
                    <p>
                      <span className="font-semibold text-foreground">30 days</span> for returns/exchanges due to size or fit.
                    </p>
                    <p>
                      <span className="font-semibold text-foreground">14 days</span> for quality issues (defects/damage).
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-blue-medium)]/10">
                    <Package className="h-6 w-6 text-[var(--brand-blue-medium)]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Condition Requirements</h3>
                  <p className="text-foreground/70 mb-3">Items must be:</p>
                  <ul className="space-y-2 text-foreground/70">
                    <li className="flex gap-3">
                      <span className="text-[var(--brand-coral)]">•</span>
                      <span>Unused and unwashed</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[var(--brand-coral)]">•</span>
                      <span>With original tags attached</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[var(--brand-coral)]">•</span>
                      <span>In original condition</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-blue-light)]/20">
                    <AlertCircle className="h-6 w-6 text-[var(--brand-blue-dark)]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Eligible Purchases</h3>
                  <p className="text-foreground/70">
                    Only items bought from our official website <span className="font-semibold text-foreground">kuddleseg.com</span> are eligible for returns and exchanges.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-coral)]/10">
                    <RotateCcw className="h-6 w-6 text-[var(--brand-coral)]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">How to Request a Return</h3>
                  <p className="text-foreground/70 mb-3">
                    WhatsApp us at <span className="font-bold text-foreground">0100 0085117</span> with:
                  </p>
                  <ul className="space-y-2 text-foreground/70">
                    <li className="flex gap-3">
                      <span className="text-[var(--brand-coral)]">•</span>
                      <span>Your order number</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[var(--brand-coral)]">•</span>
                      <span>Reason for return</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[var(--brand-coral)]">•</span>
                      <span>Photos of the item (if applicable)</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-blue-medium)]/10">
                    <Package className="h-6 w-6 text-[var(--brand-blue-medium)]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Shipping Your Return</h3>
                  <p className="text-foreground/70 mb-3">
                    Pack your item securely and send it back to us. Please note:
                  </p>
                  <ul className="space-y-2 text-foreground/70">
                    <li className="flex gap-3">
                      <span className="text-[var(--brand-coral)]">•</span>
                      <span>
                        <span className="font-semibold text-foreground">Return shipping</span> is paid by the customer
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[var(--brand-coral)]">•</span>
                      <span>
                        <span className="font-semibold text-foreground">Exception:</span> We cover shipping if we sent a damaged or incorrect item
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-coral)]/10">
                    <CheckCircle className="h-6 w-6 text-[var(--brand-coral)]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Refunds & Exchanges</h3>
                  <p className="text-foreground/70 mb-3">Once we receive and inspect your return:</p>
                  <ul className="space-y-2 text-foreground/70">
                    <li className="flex gap-3">
                      <span className="text-[var(--brand-coral)]">•</span>
                      <span>
                        <span className="font-semibold text-foreground">Refunds</span> go to your original payment method
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[var(--brand-coral)]">•</span>
                      <span>
                        <span className="font-semibold text-foreground">Exchanges</span> for a new size/style are subject to availability
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* FAQ Card */}
            <Card className="p-8 bg-gradient-to-br from-[var(--brand-blue-light)]/10 to-[var(--brand-coral)]/5 border-[var(--brand-blue-light)] rounded-2xl">
              <h3 className="text-2xl font-bold text-foreground mb-4">Need Help?</h3>
              <p className="text-foreground/70 mb-6">
                Have questions about our return policy? Reach out to our Kuddles team anytime!
              </p>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-foreground">WhatsApp</p>
                  <p className="text-foreground/70">0100 0085117</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Website</p>
                  <p className="text-foreground/70">kuddleseg.com</p>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
