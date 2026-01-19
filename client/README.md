# Kuddles Ecommerce Storefront

A cute, premium, and playful ecommerce storefront for Kuddles - where every cuddle counts!

## Features

- 🏠 **Home Page**: Hero section with brand stickers, featured products, and category navigation
- 🛍️ **Shop Page**: Full product catalog with filtering, sorting, and search
- 📦 **Product Details**: Complete product pages with color/size selection, availability, and quantity management
- 🛒 **Cart System**: Slide-out cart drawer and full cart page with checkout flow
- 🎨 **Brand Integration**: Uses your brand assets (logos, patterns, stickers) throughout

## Project Structure

```
app/
├── page.tsx              # Home page
├── shop/page.tsx         # Shop/products listing
├── product/[id]/page.tsx # Product detail pages
├── cart/page.tsx         # Cart page
├── layout.tsx            # Root layout with CartProvider
└── globals.css           # Theme with brand colors

components/
├── navbar.tsx            # Sticky navigation
├── hero-promo.tsx        # Hero advertisement section
├── category-chips.tsx    # Category navigation
├── product-card.tsx      # Product card component
├── product-grid.tsx      # Product grid layout
├── cart-drawer.tsx       # Slide-out cart
├── cart-line-item.tsx    # Cart item component
└── sticker.tsx           # Reusable sticker component

lib/
├── cart-context.tsx      # Cart state management
├── products.ts           # Product data and types
└── utils.ts              # Utility functions
```

## Adding Brand Assets

### Stickers

Place your PNG sticker files in `/public/brand/stickers/`. The naming convention should be descriptive:

- `elephant-heart.png`
- `new-badge.png`
- `bestseller-star.png`
- etc.

To use stickers in your components:

```tsx
<Sticker
  src="/brand/stickers/elephant-heart.png"
  alt="Kuddles mascot"
  size="lg"
  position="top-right"
  hideOnMobile
/>
```

### Logos

Place logo files in `/public/brand/logo/`:

- `logo-full.png` - Full logo with mascot
- `logo-circular.png` - Circular badge logo
- `logo-icon.png` - Icon only

The current implementation uses your provided logos via Vercel blob storage URLs. You can replace these with local files once you add them to the public folder.

## Customizing Products

Edit `lib/products.ts` to add, remove, or modify products. Each product should follow this structure:

```typescript
{
  id: string,
  name: string,
  price: number,
  images: [{ url: string, color?: string }],
  description: string,
  colors: [{ name: string, hex: string, inStock: boolean }],
  sizes: [{ label: string, inStockByColor: Record<string, boolean> }],
  tags: string[], // 'new', 'bestseller', etc.
  category: string
}
```

## Color Theme

The theme uses your brand colors defined in `app/globals.css`:

- **Primary (Light Blue)**: Navigation, buttons, accents
- **Accent (Coral Red)**: CTA buttons, highlights, love elements
- **Neutrals**: White backgrounds, soft grays for cards

You can customize these by editing the CSS variables in the `:root` section.

## Next Steps

1. Add your actual product images
2. Place sticker PNG files in `/public/brand/stickers/`
3. Integrate with a payment processor (Stripe recommended)
4. Connect to a backend/database for real product data
5. Add authentication for user accounts
6. Implement favorites/wishlist functionality

## Technologies Used

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS v4**
- **shadcn/ui** components
- **TypeScript**

Built with ❤️ for Kuddles
