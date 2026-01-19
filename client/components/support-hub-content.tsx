'use client'

import React from "react"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, Mail, MessageSquare, HelpCircle } from 'lucide-react'

export function SupportHubContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const faqs = [
    {
      question: "What sizes do Kuddles clothes come in?",
      answer:
        "Kuddles clothing is available in a variety of sizes for toddlers and kids. You can find a detailed size chart on each product page to help you choose the perfect fit.",
    },
    {
      question: "Are Kuddles clothes unisex?",
      answer:
        "Yes. All Kuddles designs are created to be comfortable, playful, and stylish for both boys and girls.",
    },
    {
      question: "Are Kuddles clothes safe for children?",
      answer:
        "Yes, absolutely. Kuddles products are made using soft, child-safe, and non-toxic fabrics that are gentle on sensitive skin.",
    },
    {
      question: "How long does shipping take?",
      answer:
        "Orders within Egypt are typically delivered within 2 to 5 business days, depending on your location.",
    },
    {
      question: "Can I return or exchange an item?",
      answer:
        "Yes. We accept returns and exchanges within 30 days for sizing issues or quality concerns, as long as the item is unused and in its original condition.",
    },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    setSubmitted(true)
    setFormData({ name: '', email: '', subject: '', message: '' })
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div>
      {/* Contact and FAQ Grid */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="mb-8 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--brand-coral)] to-[var(--brand-coral)]/70 rounded-full flex items-center justify-center shadow-md">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">Send us a message</h2>
                </div>
                <p className="text-foreground/70 text-lg">We typically respond within 24 hours</p>
              </div>

              <Card className="p-8 border border-[var(--brand-blue-light)] rounded-2xl bg-white">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-[var(--brand-blue-light)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-coral)]/50 bg-background"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-[var(--brand-blue-light)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-coral)]/50 bg-background"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-foreground mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-[var(--brand-blue-light)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-coral)]/50 bg-background"
                      placeholder="What can we help with?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-[var(--brand-blue-light)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-coral)]/50 bg-background resize-none"
                      placeholder="Tell us more..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[var(--brand-coral)] hover:bg-[var(--brand-coral)]/90 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>

                  {submitted && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                      Thanks for reaching out! We'll get back to you soon. 💙
                    </div>
                  )}
                </form>
              </Card>
            </div>

            {/* FAQs */}
            <div>
              <div className="mb-8 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--brand-blue-dark)] to-[var(--brand-blue-medium)] rounded-full flex items-center justify-center shadow-md">
                    <HelpCircle className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">Frequently asked questions</h2>
                </div>
                <p className="text-foreground/70 text-lg">Find quick answers to common questions</p>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <Card
                    key={idx}
                    className="border border-[var(--brand-blue-light)] rounded-lg bg-white overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full p-6 flex items-center justify-between bg-white hover:bg-[var(--brand-blue-light)]/5 transition-colors"
                    >
                      <span className="text-left font-semibold text-foreground">{faq.question}</span>
                      <ChevronDown
                        className={`h-5 w-5 text-[var(--brand-coral)] transition-transform ${
                          openFaq === idx ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {openFaq === idx && (
                      <div className="px-6 pb-6 border-t border-[var(--brand-blue-light)]/20 pt-4">
                        <p className="text-foreground/70 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              <div className="mt-8 p-6 bg-gradient-to-br from-[var(--brand-blue-light)]/30 to-[var(--brand-blue-light)]/10 rounded-lg border border-[var(--brand-blue-light)]">
                <p className="text-sm text-foreground/70 mb-4">
                  Can't find what you're looking for?
                </p>
                <p className="font-semibold text-foreground">
                  Email us at{' '}
                  <a href="mailto:support@kuddles.com" className="text-[var(--brand-coral)] hover:underline">
                    support@kuddles.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
