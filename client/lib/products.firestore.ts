import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Product } from "@/lib/products"

// Color name to hex mapping for common colors
const COLOR_HEX_MAP: Record<string, string> = {
  "red": "#EF4444",
  "blue": "#3B82F6",
  "green": "#10B981",
  "yellow": "#F59E0B",
  "orange": "#F97316",
  "purple": "#A855F7",
  "pink": "#EC4899",
  "brown": "#8B4513",
  "black": "#000000",
  "white": "#FFFFFF",
  "gray": "#9CA3AF",
  "grey": "#9CA3AF",
  "navy": "#1E3A8A",
  "beige": "#F5F5DC",
  "tan": "#D2B48C",
  "cream": "#FFFDD0",
  "honey": "#E5C195",
  "sky blue": "#BAE6FD",
  "multi": "#FF69B4",
  "rainbow": "#FFB6C1",
  "default": "#E5E7EB",
};

function getColorHex(colorName: string): string {
  const normalized = colorName.toLowerCase().trim();
  return COLOR_HEX_MAP[normalized] ?? "#9CA3AF"; // Default to gray if not found
}

function mapFirestoreProduct(id: string, data: any): Product {
  // Handle images - admin uses imageUrls (string[]), client expects { url, color? }[]
  let images: { url: string; color?: string }[] = [];
  if (data.imageUrls && Array.isArray(data.imageUrls)) {
    // Map imageUrls to images with color if colors array exists
    const colorNames = data.colors && Array.isArray(data.colors) && typeof data.colors[0] === "string" 
      ? data.colors 
      : [];
    images = data.imageUrls.map((url: string, index: number) => ({
      url,
      color: colorNames[index] || undefined,
    }));
  } else if (data.images && Array.isArray(data.images)) {
    images = data.images.map((img: any) =>
      typeof img === "string"
        ? { url: img }
        : { url: img.url ?? "/placeholder.svg", color: img.color }
    );
  } else {
    images = [{ url: "/placeholder.svg" }];
  }

  // Handle colors - admin uses colors (string[]), client expects { name, hex, inStock }[]
  let colors: { name: string; hex: string; inStock: boolean }[] = [];
  if (data.colors && Array.isArray(data.colors)) {
    if (data.colors.length > 0 && typeof data.colors[0] === "string") {
      // Admin format: string[]
      colors = data.colors.map((colorName: string) => ({
        name: colorName,
        hex: getColorHex(colorName),
        inStock: true, // Default to in stock, can be overridden by stockBySize
      }));
    } else {
      // Client format: object[]
      colors = data.colors.map((color: any) => ({
        name: color.name ?? "Default",
        hex: color.hex ?? getColorHex(color.name ?? "default"),
        inStock: color.inStock ?? true,
      }));
    }
  }

  // If no colors, create a default one
  if (colors.length === 0) {
    colors = [{ name: "Default", hex: "#E5E7EB", inStock: true }];
  }

  // Handle sizes - admin uses sizes (string[]) and stockBySize, client expects { label, inStockByColor }[]
  let sizes: { label: string; inStockByColor: Record<string, boolean> }[] = [];
  if (data.sizes && Array.isArray(data.sizes)) {
    if (data.sizes.length > 0 && typeof data.sizes[0] === "string") {
      // Admin format: string[] with stockBySize
      const colorNames = data.colors && Array.isArray(data.colors) && typeof data.colors[0] === "string"
        ? data.colors
        : colors.map(c => c.name);
      
      sizes = data.sizes.map((sizeLabel: string) => {
        const inStockByColor: Record<string, boolean> = {};
        colorNames.forEach((colorName: string) => {
          // Check stockBySize - format might be "color-size" or just size
          const stockKey = `${colorName}-${sizeLabel}`;
          const stock = data.stockBySize?.[stockKey] ?? data.stockBySize?.[sizeLabel] ?? data.stockBySize?.[colorName] ?? 0;
          inStockByColor[colorName] = stock > 0;
        });
        return {
          label: sizeLabel,
          inStockByColor,
        };
      });
    } else {
      // Client format: object[]
      sizes = data.sizes.map((size: any) => ({
        label: size.label ?? "One Size",
        inStockByColor: size.inStockByColor ?? {},
      }));
    }
  }

  // If no sizes, create a default one
  if (sizes.length === 0) {
    const defaultInStock: Record<string, boolean> = {};
    colors.forEach(color => {
      defaultInStock[color.name] = color.inStock;
    });
    sizes = [{ label: "One Size", inStockByColor: defaultInStock }];
  }

  return {
    id,
    name: data.name ?? data.title ?? "",
    price: Number(data.price ?? 0),
    description: data.description ?? "",
    category: data.category ?? "Uncategorized",
    images: images.length > 0 ? images : [{ url: "/placeholder.svg" }],
    colors,
    sizes,
    tags: Array.isArray(data.tags) ? data.tags : [],
    stockBySize: data.stockBySize ?? {}, // Preserve stock quantities from database
  };
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const snap = await getDocs(collection(db, "products"))
    return snap.docs.map((d) => mapFirestoreProduct(d.id, d.data()))
  } catch (error) {
    console.error("Error fetching products:", error)
    throw new Error(`Failed to fetch products: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const snap = await getDoc(doc(db, "products", id))
    if (!snap.exists()) return null
    return mapFirestoreProduct(snap.id, snap.data())
  } catch (error) {
    console.error("Error fetching product:", error)
    throw new Error(`Failed to fetch product: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
