'use client'

import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-slate-100 pt-20 pb-8">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 mb-16 pb-16 border-b border-slate-800">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Kuddles</h3>
              <p className="text-slate-400 leading-relaxed max-w-sm">
                Where every cuddle counts. Premium plushies and cozy essentials designed to bring joy and comfort to every moment.
              </p>
            </div>

            {/* Social Media Links */}
            <div className="flex items-center gap-4 mt-8">
              <a
                href="https://www.instagram.com/kuddles.eg?igsh=dDE3MXU1MHhwN2po&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 hover:bg-[var(--brand-coral)] rounded-lg flex items-center justify-center transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold mb-6">Company</h4>
            <ul className="space-y-3">
              <li>
                <a href="/" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Home
                </a>
              </li>
              <li>
                <a href="/shop" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Shop
                </a>
              </li>
              <li>
                <a href="/contact" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-white font-semibold mb-6">Customer Care</h4>
            <ul className="space-y-3">
              <li>
                <a href="/shipping-policy" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Shipping Policy
                </a>
              </li>
              <li>
                <a href="/refund-policy" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Refund Policy
                </a>
              </li>
              <li>
                <a href="/contact" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Contact Information
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-6">Legal</h4>
            <ul className="space-y-3">
              <li>
                <a href="/privacy-policy" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms-of-service" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section with Powered By */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-slate-500 text-sm">
            &copy; {currentYear} Kuddles. All rights reserved.
          </p>

          <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors duration-200">
            <Image
              src="/images/crafted-tech-logo.jpeg"
              alt="Crafted Technologies"
              width={24}
              height={24}
              className="h-6 w-6"
            />
            <span className="text-sm text-slate-300">
            <a     
                href="https://craftedtechnologies-website.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[var(--brand-coral)] transition-colors duration-200"
              >
                <span className="font-normal">Powered by </span>
                <span className="font-bold">Crafted Technologies</span>
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
