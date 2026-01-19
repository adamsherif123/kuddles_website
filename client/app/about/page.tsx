import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CartDrawer } from "@/components/cart-drawer"
import { Card } from "@/components/ui/card"
import Image from "next/image"

export const metadata = {
  title: "About Us | Kuddles",
  description: "Learn about the founders and story behind Kuddles",
}

export default function AboutPage() {
  const founders = [
    {
      name: "Omar El Sheikh and Hamza Khalil",
      role: "Co-Founders",
      bio: "Welcome to the Kuddles community! We create soft, comfy clothes for little humans who love to move, play, and explore. Made with gentle fabrics and easy fits, our pieces are perfect for all the messy, magical moments of real childhood. One of our goals is to offer designs that feel timeless and playful, not crowded with logos or writing, so every outfit keeps up with little adventures, big imaginations, and tiny humans on the move. With love, The Kuddles Team",
      image: "/images/omar-and-hamza-kuddles.jpg",
    },
    // {
    //   name: "Marcus Lee",
    //   role: "Co-Founder & Operations Lead",
    //   bio: "Marcus brings years of experience in sustainable manufacturing and supply chain excellence. His commitment to quality and ethical production ensures every Kuddles product meets the highest standards.",
    //   image: "/images/omar-and-hamza-kuddles.jpg",
    // },
  ]

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-[var(--brand-blue-light)]/30 via-background to-background">
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
                Our Story
              </span>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground text-balance leading-tight">
                Meet the hearts behind Kuddles
              </h1>
              <p className="text-xl text-foreground/70 text-pretty leading-relaxed">
                We believe every child deserves comfort, joy, and a friend that's always there. Kuddles was born from this simple truth.
              </p>
            </div>
          </div>
        </section>

        {/* Founders Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="space-y-20">
              {founders.map((founder, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${idx === 1 ? "md:grid-cols-2 md:grid-flow-dense" : ""}`}
                >
                  <div className={idx === 1 ? "md:col-start-2" : ""}>
                    <div className="relative h-96 md:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                      <Image
                        src={founder.image || "/placeholder.svg"}
                        alt={founder.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                        {founder.name}
                      </h2>
                      <p className="text-lg text-[var(--brand-coral)] font-semibold">
                        {founder.role}
                      </p>
                    </div>

                    <p className="text-lg text-foreground/70 leading-relaxed text-pretty">
                      {founder.bio}
                    </p>

                    <div className="pt-4">
                      <p className="text-sm text-foreground/60 font-medium uppercase tracking-widest mb-4">
                        What drives them
                      </p>
                      <ul className="space-y-3">
                        {idx === 0 ? (
                          <>
                            <li className="flex items-start gap-3">
                              <span className="text-[var(--brand-coral)] text-xl leading-none">✨</span>
                              <span className="text-foreground/70">Creating moments of pure joy for children everywhere</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="text-[var(--brand-coral)] text-xl leading-none">❤️</span>
                              <span className="text-foreground/70">Designing with empathy and intention</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="text-[var(--brand-coral)] text-xl leading-none">🎨</span>
                              <span className="text-foreground/70">Pushing creative boundaries in product design</span>
                            </li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-start gap-3">
                              <span className="text-[var(--brand-coral)] text-xl leading-none">🌍</span>
                              <span className="text-foreground/70">Building sustainable, ethical manufacturing practices</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="text-[var(--brand-coral)] text-xl leading-none">⚙️</span>
                              <span className="text-foreground/70">Ensuring every product meets exceptional standards</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="text-[var(--brand-coral)] text-xl leading-none">🤝</span>
                              <span className="text-foreground/70">Fostering meaningful connections with our community</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-[var(--brand-blue-light)]/20 via-background to-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <Card className="p-10 border border-[var(--brand-blue-light)] rounded-3xl bg-white">
                <div className="space-y-4 mb-6">
                  <h3 className="text-3xl font-bold text-foreground">Our Mission</h3>
                </div>
                <p className="text-lg text-foreground/70 leading-relaxed text-pretty">
                  To create premium, joyful products that celebrate the special moments between loved ones. We believe that thoughtfully designed items can strengthen bonds, spark imagination, and create memories that last a lifetime.
                </p>
              </Card>

              <Card className="p-10 border border-[var(--brand-blue-light)] rounded-3xl bg-white">
                <div className="space-y-4 mb-6">
                  <h3 className="text-3xl font-bold text-foreground">Our Values</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-foreground mb-1">Quality First</p>
                    <p className="text-foreground/70">Every product is crafted with premium materials and exceptional attention to detail.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Sustainability</p>
                    <p className="text-foreground/70">We're committed to ethical practices and minimal environmental impact.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Love & Care</p>
                    <p className="text-foreground/70">Behind every Kuddles product is genuine passion for bringing joy.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Join the Kuddles family
            </h2>
            <p className="text-xl text-foreground/70 text-pretty max-w-2xl mx-auto mb-8">
              Discover our collection and experience the difference that thoughtful design and quality craftsmanship can make.
            </p>
            <a
              href="/shop"
              className="inline-block bg-[var(--brand-coral)] hover:bg-[var(--brand-coral)]/90 text-white font-semibold px-8 py-4 rounded-full transition-colors shadow-lg"
            >
              Explore Collection
            </a>
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
